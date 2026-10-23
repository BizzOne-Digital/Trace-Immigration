/**
 * Idempotent seed: creates starter records only where they do not exist yet.
 * Safe to run repeatedly — it never overwrites content edited in the admin panel.
 *
 *   npm run seed
 */
import "./env";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import * as M from "../src/lib/models";
import { DEFAULT_CONSULTATION_TYPES, DEFAULT_PRICING_PLANS, DEFAULT_SERVICES } from "../src/lib/default-content";
import { resolveImageUrl } from "../src/lib/image-assets";

async function main() {
  await connectDB();
  console.log("Connected. Syncing indexes…");
  for (const model of [
    M.Admin, M.PageContent, M.Service, M.TeamMember, M.Testimonial, M.PricingPlan, M.ConsultationType, M.Availability,
    M.Booking, M.BookingLock, M.Inquiry, M.AgreementTemplate, M.SignedAgreement, M.SiteSettings, M.StoredUpload,
    M.UploadChunk, M.RateLimit,
  ]) {
    await (model as mongoose.Model<unknown>).syncIndexes();
  }

  await M.SiteSettings.updateOne({ key: "site" }, { $setOnInsert: { key: "site" } }, { upsert: true });
  console.log("✓ Site settings (verified business details)");

  let created = 0;
  for (const s of DEFAULT_SERVICES) {
    const r = await M.Service.updateOne({ slug: s.slug }, { $setOnInsert: s }, { upsert: true });
    created += r.upsertedCount;
  }
  console.log(`✓ Services (${created} created, ${DEFAULT_SERVICES.length - created} already present)`);

  // Move starter services still pointing at old Unsplash URLs to the local images (admin uploads untouched).
  let migrated = 0;
  for (const s of await M.Service.find({ image: /^https:\/\/images\.unsplash\.com\// }).select("image").lean()) {
    const local = resolveImageUrl(s.image);
    if (local && local !== s.image) {
      await M.Service.updateOne({ _id: s._id }, { image: local });
      migrated++;
    }
  }
  if (migrated) console.log(`✓ Service images moved to /images (${migrated})`);

  for (const t of DEFAULT_CONSULTATION_TYPES) {
    await M.ConsultationType.updateOne({ slug: t.slug }, { $setOnInsert: t }, { upsert: true });
  }
  // The original starter type had no price; apply the approved one only if admin has not set a price yet.
  const [indepth] = DEFAULT_CONSULTATION_TYPES;
  await M.ConsultationType.updateOne(
    { slug: indepth.slug, priceLabel: "" },
    { name: indepth.name, description: indepth.description, priceLabel: indepth.priceLabel }
  );
  console.log("✓ Consultation types (approved prices, Oct 23, 2026 fee list)");

  created = 0;
  for (const p of DEFAULT_PRICING_PLANS) {
    const r = await M.PricingPlan.updateOne({ name: p.name }, { $setOnInsert: p }, { upsert: true });
    created += r.upsertedCount;
  }
  console.log(`✓ Pricing plans (${created} created, ${DEFAULT_PRICING_PLANS.length - created} already present)`);

  // Starter hours are a suggestion only; online booking stays OFF until the firm reviews them.
  await M.Availability.updateOne(
    { key: "default" },
    {
      $setOnInsert: {
        key: "default",
        timezone: "America/Toronto",
        weekly: [1, 2, 3, 4, 5].map((day) => ({ day, start: "10:00", end: "17:00" })),
        acceptingBookings: false,
      },
    },
    { upsert: true }
  );
  console.log("✓ Availability (online booking OFF until reviewed in admin)");

  // Contact person is known; role, credentials, bio and portrait must be supplied and approved.
  const team = await M.TeamMember.updateOne(
    { name: "Aarmin Monga" },
    { $setOnInsert: { name: "Aarmin Monga", status: "draft", order: 1 } },
    { upsert: true }
  );
  console.log(`✓ Team draft profile ${team.upsertedCount ? "created" : "already present"} (unpublished)`);

  console.log("\nNot seeded on purpose: testimonials, credentials, agreement wording.");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
