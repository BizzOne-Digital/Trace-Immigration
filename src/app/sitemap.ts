import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/about", "/services", "/testimonials", "/contact", "/initial-consultation-agreement", "/privacy", "/terms"];
  return pages.map((p) => ({ url: siteUrl(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.7 }));
}
