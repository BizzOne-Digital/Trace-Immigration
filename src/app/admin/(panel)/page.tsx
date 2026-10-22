import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { AdminHeader, Panel, StatusBadge, fmtDate } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  AgreementTemplate, Availability, Booking, Inquiry, Service, SignedAgreement, StoredUpload, TeamMember, Testimonial,
} from "@/lib/models";
import { isEmailConfigured } from "@/lib/email";

export default async function Dashboard() {
  await requireAdminPage();
  await connectDB();
  const now = new Date();
  const [
    newInquiries, upcoming, pendingBookings, services, team, pendingTestimonials, signed, failedAgreementEmails,
    media, activeTemplate, availability, recentBookings, recentInquiries,
  ] = await Promise.all([
    Inquiry.countDocuments({ status: "new" }),
    Booking.countDocuments({ status: { $in: ["pending", "confirmed"] }, startUtc: { $gte: now } }),
    Booking.countDocuments({ status: "pending" }),
    Service.countDocuments({ status: "published" }),
    TeamMember.countDocuments({ status: "published" }),
    Testimonial.countDocuments({ status: "pending" }),
    SignedAgreement.countDocuments(),
    SignedAgreement.countDocuments({ emailStatus: { $in: ["failed", "not_configured"] } }),
    StoredUpload.countDocuments(),
    AgreementTemplate.exists({ status: "active" }),
    Availability.findOne({ key: "default" }).select("acceptingBookings weekly").lean(),
    Booking.find({ startUtc: { $gte: now }, status: { $in: ["pending", "confirmed"] } }).sort({ startUtc: 1 }).limit(5).lean(),
    Inquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const warnings: { text: string; href: string }[] = [];
  if (!isEmailConfigured()) warnings.push({ text: "Email (SMTP) is not configured — notifications are saved but not sent.", href: "/admin/settings" });
  if (!availability?.acceptingBookings || !availability.weekly.length) warnings.push({ text: "Online booking is closed or has no weekly hours.", href: "/admin/availability" });
  if (!activeTemplate) warnings.push({ text: "No active consultation agreement — clients cannot sign agreements yet.", href: "/admin/agreements" });
  if (failedAgreementEmails) warnings.push({ text: `${failedAgreementEmails} signed agreement email(s) not delivered.`, href: "/admin/agreements" });

  const stats = [
    { label: "New inquiries", value: newInquiries, href: "/admin/inquiries" },
    { label: "Upcoming bookings", value: upcoming, href: "/admin/bookings" },
    { label: "Awaiting confirmation", value: pendingBookings, href: "/admin/bookings?status=pending" },
    { label: "Signed agreements", value: signed, href: "/admin/agreements" },
    { label: "Published services", value: services, href: "/admin/services" },
    { label: "Published team profiles", value: team, href: "/admin/team" },
    { label: "Testimonials to review", value: pendingTestimonials, href: "/admin/testimonials" },
    { label: "Media files", value: media, href: "/admin/media" },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" description="An overview of activity across the website." />
      {warnings.length > 0 && (
        <ul className="mb-8 space-y-2">
          {warnings.map((w) => (
            <li key={w.text}>
              <Link href={w.href} className="flex items-center gap-3 rounded-sm border border-[#f0dcae] bg-[#fdf7e9] px-4 py-3 text-sm text-[#6b4a12] hover:border-gold">
                <AlertTriangle aria-hidden className="h-4 w-4 shrink-0" /> {w.text}
                <ArrowRight aria-hidden className="ml-auto h-4 w-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block rounded-sm border border-line bg-white p-5 hover:border-gold">
              <p className="text-xs uppercase tracking-wider text-muted">{s.label}</p>
              <p className="mt-2 font-serif text-4xl text-charcoal">{s.value}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Next bookings">
          {recentBookings.length === 0 ? <p className="text-sm text-muted">No upcoming bookings.</p> : (
            <ul className="divide-y divide-line text-sm">
              {recentBookings.map((b) => (
                <li key={String(b._id)} className="flex items-center justify-between gap-3 py-3">
                  <Link href={`/admin/bookings/${b._id}`} className="hover:text-gold-ink">
                    <span className="font-medium">{b.name}</span>
                    <span className="block text-xs text-muted">{fmtDate(b.startUtc)} · {b.consultationName}</span>
                  </Link>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Latest inquiries">
          {recentInquiries.length === 0 ? <p className="text-sm text-muted">No inquiries yet.</p> : (
            <ul className="divide-y divide-line text-sm">
              {recentInquiries.map((i) => (
                <li key={String(i._id)} className="flex items-center justify-between gap-3 py-3">
                  <Link href={`/admin/inquiries/${i._id}`} className="min-w-0 hover:text-gold-ink">
                    <span className="font-medium">{i.name}</span>
                    <span className="block truncate text-xs text-muted">{fmtDate(i.createdAt)} · {i.service || "General"}</span>
                  </Link>
                  <StatusBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
