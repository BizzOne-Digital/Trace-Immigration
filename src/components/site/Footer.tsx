import Link from "next/link";
import { Mail, Phone, Laptop } from "lucide-react";
import Logo from "../Logo";
import { NAV_LINKS, SECONDARY_LINKS, LEGAL_LINKS } from "@/lib/site";
import { socialLinks, telHref } from "@/lib/content";
import type { SiteSettingsDoc } from "@/lib/models";

export default function Footer({ settings }: { settings: SiteSettingsDoc }) {
  const socials = socialLinks(settings);
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ivory">
      <div className="container-x grid gap-8 border-b border-line py-10 md:grid-cols-[auto_1fr] md:items-center lg:grid-cols-[auto_1fr_1fr_1fr]">
        <Logo src={settings.logoUrl} alt={settings.logoAlt} className="h-14 w-[152px]" />
        <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-sm text-ink hover:text-gold-ink lg:border-l lg:border-line lg:pl-8">
          <Mail aria-hidden className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
          <span className="break-all">{settings.email}</span>
        </a>
        <a href={telHref(settings.phone)} className="flex items-center gap-3 text-sm text-ink hover:text-gold-ink">
          <Phone aria-hidden className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
          {settings.phone}
        </a>
        <p className="flex items-center gap-3 text-sm text-ink lg:border-l lg:border-line lg:pl-8">
          <Laptop aria-hidden className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
          {settings.virtualStatement}
        </p>
      </div>

      <div className="container-x grid gap-8 py-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <nav aria-label="Footer">
          <h2 className="eyebrow mb-4">Explore</h2>
          <ul className="space-y-2">
            {[...NAV_LINKS, SECONDARY_LINKS[0]].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted hover:text-gold-ink">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="eyebrow mb-4">Consultations</h2>
          <ul className="space-y-2">
            <li><Link href="/booking" className="text-muted hover:text-gold-ink">Book a Consultation</Link></li>
            <li><Link href="/contact" className="text-muted hover:text-gold-ink">Send an Inquiry</Link></li>
            <li><Link href="/pricing" className="text-muted hover:text-gold-ink">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="eyebrow mb-4">Legal</h2>
          <ul className="space-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="text-muted hover:text-gold-ink">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        {socials.length > 0 && (
          <div>
            <h2 className="eyebrow mb-4">Follow</h2>
            <ul className="space-y-2">
              {socials.map((s) => (
                <li key={s.key}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold-ink">
                    {s.label}<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-line">
        <p className="container-x py-5 text-xs text-muted">
          © {year} {settings.legalName}. Operating as {settings.businessName}.
        </p>
      </div>
    </footer>
  );
}
