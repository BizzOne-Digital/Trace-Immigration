"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "../Logo";
import { NAV_LINKS, SECONDARY_LINKS } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({ logoUrl, logoAlt }: { logoUrl: string; logoAlt: string }) {
  const pathname = usePathname();
  // On the homepage the header floats over the hero photograph, as in the reference design.
  const overlay = pathname === "/";
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`${overlay ? "absolute inset-x-0 top-0" : "sticky top-0 border-b border-line/70 bg-ivory"} z-40`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-charcoal focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="container-x flex h-20 items-center justify-between gap-6 lg:h-24">
        <Logo src={logoUrl} alt={logoAlt} priority className="h-12 w-[130px] sm:h-14 sm:w-[152px] lg:h-16 lg:w-[174px]" />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[0.82rem]">
            {NAV_LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative py-2 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-gold after:transition-transform ${
                      active ? "text-gold-ink after:scale-x-100" : "text-charcoal after:scale-x-0 hover:text-gold-ink hover:after:scale-x-100"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/booking" className="btn-dark hidden sm:inline-flex">
            Book a Consultation <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-line bg-ivory text-charcoal lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" ref={panelRef} role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 overflow-y-auto bg-ivory lg:hidden">
          <div className="container-x flex h-20 items-center justify-between border-b border-line">
            <span className="font-serif text-xl text-charcoal">Menu</span>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-line text-charcoal"
              aria-label="Close menu"
              onClick={() => {
                setOpen(false);
                toggleRef.current?.focus();
              }}
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label="Mobile" className="container-x py-6">
            <ul className="divide-y divide-line">
              {[...NAV_LINKS, SECONDARY_LINKS[0]].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(pathname, l.href) ? "page" : undefined}
                    className={`block py-4 font-serif text-2xl ${isActive(pathname, l.href) ? "text-gold-ink" : "text-charcoal"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/booking" className="btn-gold mt-8 w-full justify-center">
              Book a Consultation <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
