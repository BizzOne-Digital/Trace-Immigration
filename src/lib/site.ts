/** Public origin used for canonical URLs, sitemap, emails and agreement links. */
export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}${path}`;
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

export const SECONDARY_LINKS = [
  { href: "/testimonials", label: "Testimonials" },
] as const;

/** External booking form supplied by the firm. It cannot be framed, so every booking button links out to it. */
export const BOOKING_URL = "https://form.traceimmigration.com/book/PFm3w0OsLPAwMIwdck2z";

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/initial-consultation-agreement", label: "Initial Consultation Agreement" },
] as const;

/** Lucide icon keys an admin may assign to a service. */
export const SERVICE_ICONS = ["rings", "maple-leaf", "file-text", "users", "shield-alert", "home", "landmark", "plane"] as const;
