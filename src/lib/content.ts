import "server-only";
import { cache } from "react";
import { connectDB } from "./db";
import {
  PageContent, Service, SiteSettings, TeamMember, Testimonial, PricingPlan, ConsultationType,
  type ServiceDoc, type SiteSettingsDoc,
} from "./models";
import { getPageDef, pageDefaults } from "./page-schemas";
import { DEFAULT_SERVICES } from "./default-content";

type Plain<T> = T extends (infer U)[] ? Plain<U>[] : Omit<T, "_id"> & { _id: string };

/** Converts lean Mongo docs into plain serializable objects with string ids. */
export function plain<T>(doc: T): Plain<T> {
  return JSON.parse(JSON.stringify(doc));
}

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    await connectDB();
    return await fn();
  } catch (err) {
    console.error(`[content] ${label} unavailable:`, (err as Error).message);
    return fallback;
  }
}

export const DEFAULT_SETTINGS: SiteSettingsDoc = {
  key: "site",
  businessName: "Trace Immigration",
  legalName: "Trace-Canada Immigration Services Inc.",
  logoUrl: "/brand/logo-transparent.png",
  logoAlt: "Trace Immigration",
  email: "myvisa@traceimmigration.com",
  phone: "+1 (647) 980-2535",
  contactPerson: "Aarmin Monga",
  virtualStatement: "Consultations are conducted 100% virtually.",
  social: { facebook: "", instagram: "", linkedin: "", youtube: "", x: "", tiktok: "" },
  seoDefaultTitle: "",
  seoDefaultDescription: "",
  ogImage: "",
};

export const getSettings = cache(async (): Promise<SiteSettingsDoc> => {
  const doc = await safe(() => SiteSettings.findOne({ key: "site" }).lean(), null, "settings");
  if (!doc) return DEFAULT_SETTINGS;
  const merged = { ...DEFAULT_SETTINGS, ...plain(doc), social: { ...DEFAULT_SETTINGS.social, ...(doc.social || {}) } };
  if (!merged.logoUrl) merged.logoUrl = DEFAULT_SETTINGS.logoUrl;
  return merged;
});

/** Published page content merged over built-in defaults (empty values fall back to defaults). */
export const getPage = cache(async (key: string) => {
  const def = getPageDef(key);
  const defaults = pageDefaults(key);
  const doc = await safe(() => PageContent.findOne({ key }).lean(), null, `page:${key}`);
  const published = doc?.published;
  const fields = { ...defaults };
  for (const [k, v] of Object.entries(published?.fields ?? {})) {
    if (typeof v === "string" && v.trim() !== "") fields[k] = v;
  }
  return {
    fields,
    metaTitle: published?.metaTitle || def?.metaTitle || "",
    metaDescription: published?.metaDescription || def?.metaDescription || "",
  };
});

export type PublicService = ServiceDoc & { _id: string };

export const getServices = cache(async (): Promise<PublicService[]> => {
  const fallback = DEFAULT_SERVICES.map((s, i) => ({ ...s, _id: `default-${i}` }));
  return safe(async () => plain(await Service.find({ status: "published" }).sort({ order: 1, title: 1 }).lean()), fallback, "services");
});

export const getService = cache(async (slug: string): Promise<PublicService | null> => {
  const fallback = DEFAULT_SERVICES.find((s) => s.slug === slug);
  return safe(
    async () => {
      const doc = await Service.findOne({ slug, status: "published" }).lean();
      return doc ? plain(doc) : null;
    },
    fallback ? ({ ...fallback, _id: "default" } as PublicService) : null,
    `service:${slug}`
  );
});

export const getTeam = cache(async () =>
  safe(async () => plain(await TeamMember.find({ status: "published" }).sort({ order: 1, name: 1 }).lean()), [], "team")
);

export const getTestimonials = cache(async () =>
  safe(
    async () => plain(await Testimonial.find({ status: "approved", consentConfirmed: true }).sort({ order: 1, createdAt: -1 }).lean()),
    [],
    "testimonials"
  )
);

export const getPricingPlans = cache(async () =>
  safe(async () => plain(await PricingPlan.find({ status: "published" }).sort({ order: 1 }).lean()), [], "pricing")
);

export const getConsultationTypes = cache(async () =>
  safe(async () => plain(await ConsultationType.find({ status: "published" }).sort({ order: 1 }).lean()), [], "consultation types")
);

export function socialLinks(s: SiteSettingsDoc) {
  const labels: Record<string, string> = {
    facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", youtube: "YouTube", x: "X", tiktok: "TikTok",
  };
  return Object.entries(s.social || {})
    .filter(([, url]) => typeof url === "string" && /^https:\/\/[^\s]+$/.test(url))
    .map(([key, url]) => ({ key, label: labels[key] ?? key, url: url as string }));
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
