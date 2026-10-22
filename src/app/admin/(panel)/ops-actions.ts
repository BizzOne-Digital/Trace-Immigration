"use server";

import { AgreementTemplate, Availability, Booking, BOOKING_STATUSES, Inquiry, SignedAgreement, StoredUpload, type BookingStatus } from "@/lib/models";
import { adminAction, assertId, bool, num, required, revalidateSite, str, UserError, type ActionResult } from "@/lib/admin-helpers";
import { acquireLocks, isValidTimezone, issueAgreementToken, releaseLocks } from "@/lib/booking";
import { deliverSignedAgreement, sendBookingEmails } from "@/lib/notifications";
import { emailLayout, firmInbox, sendMail } from "@/lib/email";
import { cleanupAbandonedUploads, deleteUploadIfUnreferenced, getReferencedUploadUrls } from "@/lib/uploads";
import { siteUrl } from "@/lib/site";

/* ---------------- Bookings ---------------- */
const HOLDS_SLOT = (s: BookingStatus) => s === "pending" || s === "confirmed";

export async function updateBookingStatus(id: string, status: string, notify: boolean): Promise<ActionResult> {
  return adminAction(async () => {
    if (!(BOOKING_STATUSES as readonly string[]).includes(status)) throw new UserError("Invalid status.");
    const next = status as BookingStatus;
    const booking = await Booking.findById(assertId(id));
    if (!booking) throw new UserError("Booking not found.");
    const prev = booking.status;
    if (prev === next) return { ok: true, message: "No change." };

    if (HOLDS_SLOT(next) && !HOLDS_SLOT(prev)) {
      const ok = await acquireLocks(booking._id, booking.startUtc, booking.durationMinutes);
      if (!ok) throw new UserError("That time slot is now taken by another booking, so this booking cannot be reactivated.");
    }
    if (!HOLDS_SLOT(next) && HOLDS_SLOT(prev)) await releaseLocks(booking._id);

    booking.status = next;
    await booking.save();

    let message = `Booking marked ${next.replace("_", " ")}.`;
    if (notify && next === "confirmed") {
      const result = await sendBookingEmails(booking.toObject(), undefined, "confirmed");
      message += result === "sent" ? " Confirmation email sent." : " Email could not be sent — check email settings.";
    }
    return { ok: true, message };
  });
}

export async function saveBookingNotes(id: string, fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    await Booking.updateOne({ _id: assertId(id) }, { adminNotes: str(fd, "adminNotes", 4000) });
    return { ok: true, message: "Notes saved." };
  });
}

export async function resendBookingEmail(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    const booking = await Booking.findById(assertId(id)).lean();
    if (!booking) throw new UserError("Booking not found.");
    const status = await sendBookingEmails(booking, undefined, booking.status === "confirmed" ? "confirmed" : "received");
    if (status !== "sent") throw new UserError(status === "not_configured" ? "Email is not configured (SMTP settings)." : "Email delivery failed. Please try again.");
    return { ok: true, message: "Email sent to the client." };
  });
}

/** Creates a fresh agreement link (invalidating the old one). The raw token is returned once. */
export async function createAgreementLink(id: string, emailClient: boolean): Promise<ActionResult & { url?: string }> {
  let url = "";
  const res = await adminAction(async () => {
    const booking = await Booking.findById(assertId(id)).lean();
    if (!booking) throw new UserError("Booking not found.");
    if (booking.status === "cancelled") throw new UserError("This booking is cancelled.");
    if (await SignedAgreement.exists({ booking: booking._id })) throw new UserError("The agreement for this booking is already signed.");
    const tpl = await AgreementTemplate.findOne({ status: "active" }).select("body").lean();
    if (!tpl?.body?.trim()) throw new UserError("Activate an agreement template first.");
    const token = await issueAgreementToken(booking._id);
    url = siteUrl(`/consultation-agreement/${token}`);
    let message = "New agreement link created. Copy it now — it will not be shown again.";
    if (emailClient) {
      const r = await sendMail({
        to: booking.email,
        subject: `Your Initial Consultation Agreement — ${booking.reference}`,
        text: `Hello ${booking.name},\n\nPlease review and sign your Initial Consultation Agreement:\n${url}\n\nReference: ${booking.reference}`,
        html: emailLayout("Your Initial Consultation Agreement", [["Reference", booking.reference], ["Review and sign", url]], `Hello ${booking.name}, please review and sign your agreement using the secure link below.`),
      });
      message = r.status === "sent" ? "Agreement link emailed to the client." : `Link created, but the email was not sent (${r.status.replace("_", " ")}).`;
    }
    return { ok: true, message };
  });
  return { ...res, url: res.ok ? url : undefined };
}

export async function deleteBooking(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    const booking = await Booking.findById(assertId(id)).lean();
    if (!booking) return { ok: true, message: "Already deleted." };
    if (await SignedAgreement.exists({ booking: booking._id })) {
      throw new UserError("This booking has a signed agreement and cannot be deleted. Cancel it instead.");
    }
    await releaseLocks(booking._id);
    await Booking.deleteOne({ _id: booking._id });
    return { ok: true, message: "Booking deleted." };
  });
}

/* ---------------- Inquiries ---------------- */
export async function updateInquiry(id: string, fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    const status = (["new", "in_progress", "closed"] as const).find((s) => s === str(fd, "status")) ?? "new";
    await Inquiry.updateOne({ _id: assertId(id) }, { status, adminNotes: str(fd, "adminNotes", 4000) });
    return { ok: true, message: "Inquiry updated." };
  });
}

export async function retryInquiryEmail(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    const i = await Inquiry.findById(assertId(id)).lean();
    if (!i) throw new UserError("Inquiry not found.");
    const r = await sendMail({
      to: firmInbox(),
      replyTo: i.email,
      subject: `Website inquiry — ${i.name}`,
      text: `Name: ${i.name}\nEmail: ${i.email}\nPhone: ${i.phone || "-"}\nService: ${i.service || "-"}\n\n${i.message}`,
      html: emailLayout("Website inquiry", [["Name", i.name], ["Email", i.email], ["Phone", i.phone || "-"], ["Service", i.service || "-"], ["Message", i.message]]),
    });
    await Inquiry.updateOne({ _id: i._id }, { emailStatus: r.status, emailError: r.error ?? "" });
    if (r.status !== "sent") throw new UserError(r.status === "not_configured" ? "Email is not configured (SMTP settings)." : "Email delivery failed.");
    return { ok: true, message: "Notification sent." };
  });
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    await Inquiry.deleteOne({ _id: assertId(id) });
    return { ok: true, message: "Inquiry deleted." };
  });
}

/* ---------------- Availability ---------------- */
export async function saveAvailability(fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    const timezone = required(str(fd, "timezone", 60), "Timezone");
    if (!isValidTimezone(timezone)) throw new UserError("Unknown timezone. Use an IANA name such as America/Toronto.");
    const weekly: { day: number; start: string; end: string }[] = [];
    for (let day = 0; day < 7; day++) {
      if (!bool(fd, `day${day}_on`)) continue;
      const start = str(fd, `day${day}_start`);
      const end = str(fd, `day${day}_end`);
      if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || start >= end) {
        throw new UserError("Each enabled day needs a start time earlier than its end time.");
      }
      weekly.push({ day, start, end });
    }
    const blackoutDates = str(fd, "blackoutDates", 5000).split(/[\s,]+/).filter(Boolean);
    if (blackoutDates.some((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d))) throw new UserError("Blackout dates must use YYYY-MM-DD format.");
    await Availability.findOneAndUpdate(
      { key: "default" },
      {
        $set: {
          timezone, weekly, blackoutDates,
          slotStepMinutes: num(fd, "slotStepMinutes", 30),
          minNoticeHours: num(fd, "minNoticeHours", 24),
          maxDaysAhead: num(fd, "maxDaysAhead", 45),
          bufferMinutes: num(fd, "bufferMinutes", 0),
          acceptingBookings: bool(fd, "acceptingBookings"),
        },
      },
      { upsert: true, runValidators: true }
    );
    revalidateSite();
    return { ok: true, message: "Availability saved." };
  });
}

/* ---------------- Agreement templates ---------------- */
export async function createAgreementVersion(fromId?: string): Promise<ActionResult> {
  return adminAction(async () => {
    const latest = await AgreementTemplate.findOne().sort({ version: -1 }).select("version").lean();
    const source = fromId ? await AgreementTemplate.findById(assertId(fromId)).lean() : null;
    const created = await AgreementTemplate.create({
      version: (latest?.version ?? 0) + 1,
      title: source?.title ?? "Initial Consultation Agreement",
      body: source?.body ?? "",
      status: "draft",
    });
    return { ok: true, id: String(created._id), message: `Draft version ${created.version} created.` };
  });
}

export async function saveAgreementDraft(id: string, fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    const tpl = await AgreementTemplate.findById(assertId(id));
    if (!tpl) throw new UserError("Template not found.");
    // Active and archived versions are immutable so signed records always match the wording shown.
    if (tpl.status !== "draft") throw new UserError("Only draft versions can be edited. Create a new version instead.");
    tpl.title = required(str(fd, "title", 200), "Title");
    tpl.body = str(fd, "body", 60000);
    await tpl.save();
    return { ok: true, message: "Draft saved." };
  });
}

export async function activateAgreement(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    const tpl = await AgreementTemplate.findById(assertId(id));
    if (!tpl) throw new UserError("Template not found.");
    if (tpl.status !== "draft") throw new UserError("Only a draft can be activated.");
    if (tpl.body.trim().length < 50) throw new UserError("Enter the full, approved agreement wording before activating.");
    await AgreementTemplate.updateMany({ status: "active" }, { status: "archived" });
    tpl.status = "active";
    tpl.activatedAt = new Date();
    await tpl.save();
    return { ok: true, message: `Version ${tpl.version} is now active for new signatures.` };
  });
}

export async function deactivateAgreement(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    await AgreementTemplate.updateOne({ _id: assertId(id), status: "active" }, { status: "archived" });
    return { ok: true, message: "Agreement deactivated. Signing is disabled until a version is activated." };
  });
}

export async function deleteAgreementDraft(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    const res = await AgreementTemplate.deleteOne({ _id: assertId(id), status: "draft" });
    if (!res.deletedCount) throw new UserError("Only drafts can be deleted.");
    return { ok: true, message: "Draft deleted." };
  });
}

export async function retryAgreementEmail(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    const r = await deliverSignedAgreement(assertId(id));
    if (r.status !== "sent") throw new UserError(r.status === "not_configured" ? "Email is not configured (SMTP settings)." : `Delivery failed: ${r.error ?? "unknown error"}`);
    return { ok: true, message: "Signed agreement emailed to the firm inbox." };
  });
}

/* ---------------- Media ---------------- */
export async function deleteMedia(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    const doc = await StoredUpload.findById(assertId(id)).select("folder filename").lean();
    if (!doc) return { ok: true, message: "Already deleted." };
    const url = `/api/uploads/${doc.folder}/${doc.filename}`;
    const refs = await getReferencedUploadUrls();
    if (refs.has(url)) throw new UserError("This image is still used on the website. Remove it from that content first.");
    await deleteUploadIfUnreferenced(url);
    return { ok: true, message: "Image deleted." };
  });
}

export async function runMediaCleanup(): Promise<ActionResult> {
  return adminAction(async () => {
    const r = await cleanupAbandonedUploads(24);
    return { ok: true, message: `Removed ${r.deleted} unused image(s) older than 24 hours.` };
  });
}
