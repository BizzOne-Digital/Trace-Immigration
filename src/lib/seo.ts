import type { Metadata } from "next";
import { getPage, getSettings } from "./content";
import { siteUrl } from "./site";

/** Per-page metadata from published page content, with canonical URL from the configured origin. */
export async function pageMetadata(key: string, path: string): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(key), getSettings()]);
  const title = page.metaTitle || settings.seoDefaultTitle || settings.businessName;
  const description = page.metaDescription || settings.seoDefaultDescription;
  return {
    title,
    description,
    alternates: { canonical: siteUrl(path) },
    openGraph: {
      title,
      description,
      url: siteUrl(path),
      siteName: settings.businessName,
      locale: "en_CA",
      type: "website",
      images: settings.ogImage ? [{ url: settings.ogImage }] : undefined,
    },
  };
}
