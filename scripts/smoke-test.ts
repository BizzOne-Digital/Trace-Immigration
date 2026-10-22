/**
 * End-to-end smoke test against a running server + database.
 *   npx tsx --conditions react-server scripts/smoke-test.ts http://localhost:3000
 * Uses a TEST database only: it creates bookings, uploads and an agreement template.
 */
import "./env";
import { sealData } from "iron-session";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import * as M from "../src/lib/models";
import { createBooking, computeSlots, issueAgreementToken } from "../src/lib/booking";
import { deliverSignedAgreement } from "../src/lib/notifications";
import { generateAgreementPdf } from "../src/lib/pdf";

const BASE = process.argv[2] || "http://localhost:3000";
let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const PNG = Buffer.from(
  "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63F8CFC0F01F0005000201E2B3A1D60000000049454E44AE426082",
  "hex"
);

async function main() {
  await connectDB();
  const admin = await M.Admin.findOne().lean();
  if (!admin) throw new Error("Run create-admin first");
  const cookie = `trace_admin=${await sealData(
    { adminId: String(admin._id), email: admin.email, name: admin.name, issuedAt: Date.now() },
    { password: process.env.SESSION_SECRET!, ttl: 3600 }
  )}`;
  const origin = { Origin: BASE };
  const authed = { Cookie: cookie, ...origin };

  // ---- Public pages
  for (const p of ["/", "/about", "/services", "/services/permanent-residence", "/team", "/testimonials", "/pricing", "/contact", "/booking", "/privacy", "/terms", "/sitemap.xml", "/robots.txt"]) {
    const r = await fetch(BASE + p);
    check(`GET ${p}`, r.status === 200, String(r.status));
  }
  check("Unknown service 404", (await fetch(`${BASE}/services/does-not-exist`)).status === 404);
  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  check("Sitemap excludes admin/agreement", !sitemap.includes("/admin") && !sitemap.includes("consultation-agreement"));

  // ---- Admin authorization (server-side)
  const adminAnon = await fetch(`${BASE}/admin`, { redirect: "manual" });
  check("Admin redirects anonymous users", [303, 307, 308].includes(adminAnon.status) && (adminAnon.headers.get("location") ?? "").includes("/admin/login"), String(adminAnon.status));
  check("Admin loads with session", (await fetch(`${BASE}/admin`, { headers: { Cookie: cookie } })).status === 200);
  check("Admin pages are noindex", (await fetch(`${BASE}/admin/login`)).headers.get("x-robots-tag")?.includes("noindex") === true);

  // ---- Upload rejection cases
  const form = (file: Blob | null, folder: string, name = "x.png") => {
    const fd = new FormData();
    if (file) fd.append("file", file, name);
    fd.append("folder", folder);
    return fd;
  };
  const up = (fd: FormData, headers: Record<string, string> = authed) => fetch(`${BASE}/api/upload`, { method: "POST", body: fd, headers });
  check("Upload: anonymous rejected", (await up(form(new Blob([PNG]), "pages"), origin)).status === 401);
  check("Upload: cross-origin rejected", (await up(form(new Blob([PNG]), "pages"), { Cookie: cookie, Origin: "https://evil.example" })).status === 403);
  check("Upload: bad folder rejected", (await up(form(new Blob([PNG]), "secret"))).status === 400);
  check("Upload: empty file rejected", (await up(form(new Blob([]), "pages"))).status === 400);
  check("Upload: fake PNG (text) rejected", (await up(form(new Blob(["<script>alert(1)</script>"], { type: "image/png" }), "pages"))).status === 415);
  check("Upload: missing file rejected", (await up(form(null, "pages"))).status === 400);

  // ---- Valid upload + delivery
  const okRes = await up(form(new Blob([PNG], { type: "image/png" }), "pages"));
  const okJson = await okRes.json();
  check("Upload: valid PNG accepted", okRes.status === 201 && okJson.success && /^\/api\/uploads\/pages\/\d+-[a-f0-9]{16}\.png$/.test(okJson.url), JSON.stringify(okJson));
  const img = await fetch(BASE + okJson.url);
  const bytes = Buffer.from(await img.arrayBuffer());
  check("Delivery: bytes identical", bytes.equals(PNG));
  check("Delivery: headers", img.headers.get("content-type") === "image/png" && img.headers.get("cache-control") === "public, max-age=31536000, immutable" && img.headers.get("x-content-type-options") === "nosniff" && img.headers.get("content-length") === String(PNG.length));
  const listed = await M.StoredUpload.findOne({ filename: okJson.filename }).lean();
  check("Media list query excludes binary", listed !== null && (listed as { data?: unknown }).data === undefined);

  // ---- Traversal / malformed
  for (const p of ["/api/uploads/pages/..%2F..%2Fpackage.json", "/api/uploads/evil/1700000000000-0123456789abcdef.png", "/api/uploads/pages/..%5C..%5Cx.png", "/api/uploads/pages/1700000000000-0123456789abcdef.png", "/uploads/legacy.png"]) {
    const r = await fetch(BASE + p);
    check(`Traversal/missing ${p}`, r.status === 404, String(r.status));
  }

  // ---- Chunked upload (5 MB > Vercel 4.5 MB body limit) and >8 MB rejection
  const big = Buffer.alloc(5 * 1024 * 1024, 0);
  PNG.copy(big); // valid signature, padded body
  const uploadId = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
  const CH = 2.5 * 1024 * 1024;
  const total = Math.ceil(big.length / CH);
  let chunksOk = true;
  for (let i = 0; i < total; i++) {
    const fd = new FormData();
    fd.append("uploadId", uploadId); fd.append("index", String(i)); fd.append("total", String(total)); fd.append("totalSize", String(big.length));
    fd.append("chunk", new Blob([big.subarray(i * CH, (i + 1) * CH)]));
    chunksOk &&= (await fetch(`${BASE}/api/upload/chunk`, { method: "POST", body: fd, headers: authed })).ok;
  }
  const fin = new FormData(); fin.append("uploadId", uploadId); fin.append("folder", "gallery");
  const finRes = await up(fin);
  const finJson = await finRes.json();
  const bigBack = Buffer.from(await (await fetch(BASE + finJson.url)).arrayBuffer());
  check("Chunked 5 MB upload assembled & served intact", chunksOk && finRes.status === 201 && bigBack.equals(big));
  check("Chunks removed after assembly", (await M.UploadChunk.countDocuments({ uploadId })) === 0);
  const tooBig = new FormData(); tooBig.append("uploadId", "a".repeat(32)); tooBig.append("index", "0"); tooBig.append("total", "4"); tooBig.append("totalSize", String(9 * 1024 * 1024)); tooBig.append("chunk", new Blob([PNG]));
  check("Over 8 MB declared size rejected", (await fetch(`${BASE}/api/upload/chunk`, { method: "POST", body: tooBig, headers: authed })).status === 413);

  // ---- Booking: atomic conflict prevention
  await M.Availability.updateOne({ key: "default" }, { acceptingBookings: true, minNoticeHours: 0, weekly: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, start: "00:00", end: "23:45" })) });
  const type = await M.ConsultationType.findOne({ status: "published" }).lean();
  const { days } = await computeSlots(type!.durationMinutes);
  const firstDay = Object.keys(days)[1];
  const slot = days[firstDay][4].startUtc;
  const attempts = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      createBooking({ consultationTypeId: String(type!._id), startUtc: slot, clientTimezone: "Europe/London", name: `Racer ${i}`, email: `racer${i}@example.com`, phone: "", service: "", notes: "" })
    )
  );
  const wins = attempts.filter((a) => a.ok);
  check("8 concurrent bookings for one slot → exactly 1 succeeds", wins.length === 1, `${wins.length} succeeded`);
  const overlap = new Date(new Date(slot).getTime() + 30 * 60_000).toISOString();
  const ov = await createBooking({ consultationTypeId: String(type!._id), startUtc: overlap, clientTimezone: "", name: "Overlap", email: "o@example.com", phone: "", service: "", notes: "" });
  check("Overlapping slot rejected", !ov.ok);
  const winner = wins[0].ok ? wins[0].booking : null;
  check("Booking stored in UTC with firm timezone", winner!.startUtc.toISOString() === slot && winner!.firmTimezone === "America/Toronto");
  const slotsAfter = await (await fetch(`${BASE}/api/booking/slots?type=${type!._id}`)).json();
  check("Booked slot no longer offered by API", !slotsAfter.days[firstDay]?.some((s: { startUtc: string }) => s.startUtc === slot));

  // ---- Agreement: disabled without wording, PDF + email status/retry
  const token = await issueAgreementToken(winner!._id);
  const noTpl = await (await fetch(`${BASE}/consultation-agreement/${token}`)).text();
  check("Agreement signing disabled until wording configured", noTpl.includes("not yet available") && !noTpl.includes("Sign Agreement"));
  const tpl = await M.AgreementTemplate.create({ version: 999, title: "TEST Agreement", body: "TEST WORDING ONLY — not client-approved.\n".repeat(5), status: "active" });
  const withTpl = await (await fetch(`${BASE}/consultation-agreement/${token}`)).text();
  check("Agreement form shown with active wording", withTpl.includes("Sign Agreement") && withTpl.includes("TEST WORDING ONLY"));
  check("Invalid token rejected", (await (await fetch(`${BASE}/consultation-agreement/${"x".repeat(43)}`)).text()).includes("not valid"));
  const { buffer, sha256 } = await generateAgreementPdf({
    businessName: "Trace Immigration", legalName: "Trace-Canada Immigration Services Inc.", title: tpl.title, version: tpl.version, body: tpl.body,
    bookingReference: winner!.reference, consultationName: winner!.consultationName, clientFullName: "Test Client", clientEmail: "t@example.com",
    clientPhone: "", clientAddress: "", signatureName: "Test Client", signedAt: new Date(), ipAddress: "127.0.0.1",
  });
  check("PDF generated", buffer.subarray(0, 5).toString() === "%PDF-" && buffer.length > 1000);
  const signed = await M.SignedAgreement.create({
    booking: winner!._id, bookingReference: winner!.reference, templateId: tpl._id, templateVersion: tpl.version, templateTitle: tpl.title, templateBody: tpl.body,
    clientFullName: "Test Client", clientEmail: "t@example.com", signatureName: "Test Client", consent: true, signedAt: new Date(), pdf: buffer, pdfSize: buffer.length, pdfSha256: sha256,
  });
  const d1 = await deliverSignedAgreement(String(signed._id));
  const d2 = await deliverSignedAgreement(String(signed._id));
  const after = await M.SignedAgreement.findById(signed._id).lean();
  check("Email status recorded & retry increments attempts", d1.status === after!.emailStatus && d2.status === d1.status && after!.emailAttempts === 2, `${after!.emailStatus}, attempts=${after!.emailAttempts}`);
  check("PDF download requires admin", (await fetch(`${BASE}/api/admin/agreements/${signed._id}/pdf`)).status === 401);
  const dl = await fetch(`${BASE}/api/admin/agreements/${signed._id}/pdf`, { headers: { Cookie: cookie } });
  check("PDF download for admin", dl.status === 200 && Buffer.from(await dl.arrayBuffer()).equals(buffer));
  await M.AgreementTemplate.updateOne({ _id: tpl._id }, { body: "EDITED LATER" });
  const stillSnap = await M.SignedAgreement.findById(signed._id).lean();
  check("Signed record keeps original wording after template edit", stillSnap!.templateBody.startsWith("TEST WORDING ONLY"));

  // ---- Cleanup test data
  await M.SignedAgreement.deleteOne({ _id: signed._id });
  await M.AgreementTemplate.deleteOne({ _id: tpl._id });
  await M.BookingLock.deleteMany({});
  await M.Booking.deleteMany({ email: /@example\.com$/ });
  await M.StoredUpload.deleteMany({ filename: { $in: [okJson.filename, finJson.filename] } });
  await M.Availability.updateOne({ key: "default" }, { acceptingBookings: false, minNoticeHours: 24, weekly: [1, 2, 3, 4, 5].map((day) => ({ day, start: "10:00", end: "17:00" })) });

  console.log(`\n${pass} passed, ${fail} failed`);
  await mongoose.disconnect();
  process.exit(fail ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
