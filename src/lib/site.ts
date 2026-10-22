/** Public origin used for canonical URLs, sitemap, emails and agreement links. */
export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}${path}`;
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/team", label: "Our Team" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

export const SECONDARY_LINKS = [
  { href: "/testimonials", label: "Testimonials" },
  { href: "/booking", label: "Book a Consultation" },
] as const;

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
] as const;

/** Lucide icon keys an admin may assign to a service. */
export const SERVICE_ICONS = ["rings", "maple-leaf", "file-text", "users", "shield-alert", "home", "landmark", "plane"] as const;
