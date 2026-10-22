import type { MetadataRoute } from "next";
import { getServices } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["/", "/about", "/services", "/team", "/testimonials", "/pricing", "/contact", "/booking", "/privacy", "/terms"];
  const services = await getServices();
  return [
    ...pages.map((p) => ({ url: siteUrl(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: siteUrl(`/services/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
