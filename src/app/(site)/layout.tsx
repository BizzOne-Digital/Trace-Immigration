import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { JsonLd } from "@/components/site/blocks";
import ChatWidget from "@/components/site/ChatWidget";
import { getServices, getSettings, socialLinks } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  // Structured data limited to verified business facts only.
  const org = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: settings.businessName,
    legalName: settings.legalName,
    url: siteUrl(),
    logo: siteUrl(settings.logoUrl.startsWith("/") ? settings.logoUrl : "/brand/logo-transparent.png"),
    email: settings.email,
    telephone: settings.phone,
    areaServed: "Worldwide",
    sameAs: socialLinks(settings).map((s) => s.url),
  };
  return (
    <>
      <Header logoUrl={settings.logoUrl} logoAlt={settings.logoAlt} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <JsonLd data={org} />
      <ChatWidget
        services={services.map((s) => ({ title: s.title, slug: s.slug, tagline: s.tagline }))}
        email={settings.email}
        phone={settings.phone}
        virtualStatement={settings.virtualStatement}
      />
    </>
  );
}
