"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FileText, Briefcase, Users, Quote, BadgeDollarSign, CalendarClock, CalendarDays, Clock,
  Inbox, FileSignature, Images, Settings, Menu, X, ExternalLink, LogOut,
} from "lucide-react";
import { logout } from "@/app/admin/auth-actions";

const GROUPS = [
  { label: "", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Content",
    items: [
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/services", label: "Services", icon: Briefcase },
      { href: "/admin/team", label: "Team", icon: Users },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/pricing", label: "Pricing", icon: BadgeDollarSign },
      { href: "/admin/media", label: "Media library", icon: Images },
    ],
  },
  {
    label: "Clients",
    items: [
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/admin/consultation-types", label: "Consultation types", icon: Clock },
      { href: "/admin/availability", label: "Availability", icon: CalendarClock },
      { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
      { href: "/admin/agreements", label: "Agreements", icon: FileSignature },
    ],
  },
  { label: "System", items: [{ href: "/admin/settings", label: "Site settings", icon: Settings }] },
];

export default function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <span className="font-serif text-xl">Trace Admin</span>
        <button type="button" className="admin-btn" aria-expanded={open} aria-controls="admin-sidebar" onClick={() => setOpen((v) => !v)}>
          {open ? <X aria-hidden className="h-4 w-4" /> : <Menu aria-hidden className="h-4 w-4" />}
          <span>Menu</span>
        </button>
      </div>
      <aside
        id="admin-sidebar"
        className={`${open ? "block" : "hidden"} fixed inset-y-0 left-0 top-14 z-20 w-64 overflow-y-auto border-r border-line bg-white lg:sticky lg:top-0 lg:block lg:h-screen`}
      >
        <div className="hidden px-6 pb-2 pt-6 lg:block">
          <p className="font-serif text-2xl text-charcoal">Trace Admin</p>
          <p className="truncate text-xs text-muted">Signed in as {name}</p>
        </div>
        <nav aria-label="Admin" className="px-3 py-4">
          {GROUPS.map((g) => (
            <div key={g.label || "main"} className="mb-4">
              {g.label && <p className="px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">{g.label}</p>}
              <ul>
                {g.items.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active(href) ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm ${active(href) ? "bg-cream font-medium text-charcoal" : "text-muted hover:bg-ivory hover:text-charcoal"}`}
                    >
                      <Icon aria-hidden className={`h-4 w-4 ${active(href) ? "text-gold" : ""}`} strokeWidth={1.6} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-6 space-y-1 border-t border-line pt-4">
            <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted hover:bg-ivory hover:text-charcoal">
              <ExternalLink aria-hidden className="h-4 w-4" /> View website
            </a>
            <form action={logout}>
              <button type="submit" className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm text-muted hover:bg-ivory hover:text-charcoal">
                <LogOut aria-hidden className="h-4 w-4" /> Sign out
              </button>
            </form>
          </div>
        </nav>
      </aside>
    </>
  );
}
