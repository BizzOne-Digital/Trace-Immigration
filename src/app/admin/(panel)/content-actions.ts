"use server";

import {
  ConsultationType, PageContent, PricingPlan, Service, SiteSettings, TeamMember, Testimonial, type PublishStatus,
} from "@/lib/models";
import {
  adminAction, assertId, bool, imageUrl, lines, num, pairs, required, revalidateSite, slugify, str, UserError,
  type ActionResult,
} from "@/lib/admin-helpers";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { getPageDef } from "@/lib/page-schemas";
import { SERVICE_ICONS } from "@/lib/site";

const publish = (fd: FormData): PublishStatus => (str(fd, "status") === "published" ? "published" : "draft");

/* ---------------- Services ---------------- */
export async function saveService(id: string | null, fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    const icon = str(fd, "icon");
    const data = {
      title: required(str(fd, "title", 120), "Title"),
      slug: slugify(str(fd, "slug") || str(fd, "title")),
      tagline: str(fd, "tagline", 200),
      summary: str(fd, "summary", 600),
      body: str(fd, "body"),
      scope: lines(fd, "scope"),
      process: pairs(fd, "process"),
      icon: (SERVICE_ICONS as readonly string[]).includes(icon) ? icon : "file-text",
      image: imageUrl(fd, "image"),
      imageAlt: str(fd, "imageAlt", 200),
      featured: bool(fd, "featured"),
      order: num(fd, "order"),
      status: publish(fd),
      metaTitle: str(fd, "metaTitle", 120),
      metaDescription: str(fd, "metaDescription", 320),
    };
    if (!data.slug) throw new UserError("A valid slug is required.");
    if (data.image && !data.imageAlt) throw new UserError("Please add alt text describing the image.");
    if (id) {
      const before = await Service.findById(assertId(id)).lean();
      if (!before) throw new UserError("Service not found.");
      const after = await Service.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
      await cleanupReplacedUploads(before, after);
      revalidateSite();
      return { ok: true, id };
    }
    const created = await Service.create(data);
    revalidateSite();
    return { ok: true, id: String(created._id), message: "Service created." };
  });
}

export async function deleteService(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    const doc = await Service.findByIdAndDelete(assertId(id)).lean();
    if (doc) await cleanupReplacedUploads(doc, null);
    revalidateSite();
    return { ok: true, message: "Service deleted." };
  });
}

/* ---------------- Team ---------------- */
export async function saveTeamMember(id: string | null, fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    const data = {
      name: required(str(fd, "name", 120), "Name"),
      role: str(fd, "role", 120),
      credentials: str(fd, "credentials", 300),
      bio: str(fd, "bio", 4000),
      portrait: imageUrl(fd, "portrait"),
      portraitAlt: str(fd, "portraitAlt", 200),
      order: num(fd, "order"),
      status: publish(fd),
    };
    if (data.portrait.startsWith("https://images.unsplash.com/")) {
      throw new UserError("Team portraits must be approved photos of the actual person, not stock images.");
    }
    if (id) {
      const before = await TeamMember.findById(assertId(id)).lean();
      if (!before) throw new UserError("Team member not found.");
      const after = await TeamMember.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
      await cleanupReplacedUploads(before, after);
      revalidateSite();
      return { ok: true, id };
    }
    const created = await TeamMember.create(data);
    revalidateSite();
    return { ok: true, id: String(created._id), message: "Team member created." };
  });
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    const doc = await TeamMember.findByIdAndDelete(assertId(id)).lean();
    if (doc) await cleanupReplacedUploads(doc, null);
    revalidateSite();
    return { ok: true, message: "Team member deleted." };
  });
}

/* ---------------- Testimonials ---------------- */
export async function saveTestimonial(id: string | null, fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    const status = (["pending", "approved", "hidden"] as const).find((s) => s === str(fd, "status")) ?? "pending";
    const consentConfirmed = bool(fd, "consentConfirmed");
    if (status === "approved" && !consentConfirmed) {
      throw new UserError("Record the client's written consent before approving a testimonial for publication.");
    }
    const data = {
      clientName: required(str(fd, "clientName", 120), "Client name"),
      context: str(fd, "context", 160),
      quote: required(str(fd, "quote", 2000), "Quote"),
      consentConfirmed,
      status,
      order: num(fd, "order"),
    };
    if (id) {
      await Testimonial.findByIdAndUpdate(assertId(id), data, { runValidators: true });
      revalidateSite();
      return { ok: true, id };
    }
    const created = await Testimonial.create(data);
    revalidateSite();
    return { ok: true, id: String(created._id), message: "Testimonial created." };
  });
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    await Testimonial.findByIdAndDelete(assertId(id));
    revalidateSite();
    return { ok: true, message: "Testimonial deleted." };
  });
}

/* ---------------- Pricing ---------------- */
export async function savePricingPlan(id: string | null, fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    const data = {
      name: required(str(fd, "name", 120), "Name"),
      description: str(fd, "description", 600),
      priceLabel: str(fd, "priceLabel", 60),
      priceNote: str(fd, "priceNote", 200),
      features: lines(fd, "features"),
      serviceSlug: slugify(str(fd, "serviceSlug")),
      order: num(fd, "order"),
      status: publish(fd),
    };
    if (id) {
      await PricingPlan.findByIdAndUpdate(assertId(id), data, { runValidators: true });
      revalidateSite();
      return { ok: true, id };
    }
    const created = await PricingPlan.create(data);
    revalidateSite();
    return { ok: true, id: String(created._id), message: "Pricing item created." };
  });
}

export async function deletePricingPlan(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    await PricingPlan.findByIdAndDelete(assertId(id));
    revalidateSite();
    return { ok: true, message: "Pricing item deleted." };
  });
}

/* ---------------- Consultation types ---------------- */
export async function saveConsultationType(id: string | null, fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    const data = {
      name: required(str(fd, "name", 120), "Name"),
      slug: slugify(str(fd, "slug") || str(fd, "name")),
      description: str(fd, "description", 600),
      durationMinutes: num(fd, "durationMinutes", 60),
      priceLabel: str(fd, "priceLabel", 60),
      order: num(fd, "order"),
      status: publish(fd),
    };
    if (id) {
      await ConsultationType.findByIdAndUpdate(assertId(id), data, { runValidators: true });
      revalidateSite();
      return { ok: true, id };
    }
    const created = await ConsultationType.create(data);
    revalidateSite();
    return { ok: true, id: String(created._id), message: "Consultation type created." };
  });
}

export async function deleteConsultationType(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    // Bookings keep a snapshot of name and duration, so deleting a type never alters history.
    await ConsultationType.findByIdAndDelete(assertId(id));
    revalidateSite();
    return { ok: true, message: "Consultation type deleted." };
  });
}

/* ---------------- Page content ---------------- */
export async function savePage(key: string, mode: "draft" | "publish", fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    const def = getPageDef(key);
    if (!def) throw new UserError("Unknown page.");
    const fields: Record<string, string> = {};
    for (const f of def.fields) fields[f.name] = f.type === "image" ? imageUrl(fd, f.name) : str(fd, f.name, 20000);
    const version = { metaTitle: str(fd, "metaTitle", 120), metaDescription: str(fd, "metaDescription", 320), fields };

    const before = await PageContent.findOne({ key }).lean();
    const update =
      mode === "publish"
        ? { draft: version, published: version, status: "published", publishedAt: new Date() }
        : { draft: version, status: "draft" };
    const after = await PageContent.findOneAndUpdate({ key }, { $set: update }, { upsert: true, new: true }).lean();
    await cleanupReplacedUploads(before, after);
    if (mode === "publish") revalidateSite();
    return { ok: true, message: mode === "publish" ? "Published to the website." : "Draft saved (not yet live)." };
  });
}

export async function discardPageDraft(key: string): Promise<ActionResult> {
  return adminAction(async () => {
    const before = await PageContent.findOne({ key }).lean();
    if (!before) return { ok: true, message: "Nothing to discard." };
    const after = await PageContent.findOneAndUpdate(
      { key },
      { $set: { draft: before.published ?? { metaTitle: "", metaDescription: "", fields: {} }, status: "published" } },
      { new: true }
    ).lean();
    await cleanupReplacedUploads(before, after);
    return { ok: true, message: "Draft discarded." };
  });
}

/* ---------------- Site settings ---------------- */
const SOCIAL_KEYS = ["facebook", "instagram", "linkedin", "youtube", "x", "tiktok"] as const;

export async function saveSettings(fd: FormData): Promise<ActionResult> {
  return adminAction(async () => {
    const social: Record<string, string> = {};
    for (const k of SOCIAL_KEYS) {
      const v = str(fd, `social_${k}`, 300);
      if (v && !/^https:\/\/[^\s]+$/.test(v)) throw new UserError(`The ${k} link must be a full https:// URL.`);
      social[k] = v;
    }
    const email = required(str(fd, "email", 200), "Email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UserError("Please enter a valid email address.");
    const data = {
      businessName: required(str(fd, "businessName", 120), "Business name"),
      legalName: required(str(fd, "legalName", 200), "Legal name"),
      logoUrl: imageUrl(fd, "logoUrl") || "/brand/logo-transparent.png",
      logoAlt: str(fd, "logoAlt", 120) || "Trace Immigration",
      email,
      phone: required(str(fd, "phone", 40), "Phone"),
      contactPerson: str(fd, "contactPerson", 120),
      virtualStatement: str(fd, "virtualStatement", 200),
      social,
      seoDefaultTitle: str(fd, "seoDefaultTitle", 120),
      seoDefaultDescription: str(fd, "seoDefaultDescription", 320),
      ogImage: imageUrl(fd, "ogImage"),
    };
    const before = await SiteSettings.findOne({ key: "site" }).lean();
    const after = await SiteSettings.findOneAndUpdate({ key: "site" }, { $set: data }, { upsert: true, new: true, runValidators: true }).lean();
    await cleanupReplacedUploads(before, after);
    revalidateSite();
    return { ok: true, message: "Settings saved." };
  });
}
