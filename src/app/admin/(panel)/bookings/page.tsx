import Link from "next/link";
import { AdminHeader, EmptyRow, StatusBadge, Table } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Booking, BOOKING_STATUSES } from "@/lib/models";
import { formatInZone } from "@/lib/booking";

type Props = { searchParams: Promise<{ status?: string; view?: string }> };

export default async function BookingsAdmin({ searchParams }: Props) {
  await requireAdminPage();
  const { status, view = "upcoming" } = await searchParams;
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (status && (BOOKING_STATUSES as readonly string[]).includes(status)) filter.status = status;
  if (view === "upcoming") filter.startUtc = { $gte: new Date() };
  if (view === "past") filter.startUtc = { $lt: new Date() };
  const items = await Booking.find(filter).sort({ startUtc: view === "past" ? -1 : 1 }).limit(200).lean();

  const tab = (label: string, v: string) => (
    <Link
      href={`/admin/bookings?view=${v}${status ? `&status=${status}` : ""}`}
      aria-current={view === v ? "page" : undefined}
      className={`border-b-2 px-1 pb-2 text-sm ${view === v ? "border-gold font-medium text-charcoal" : "border-transparent text-muted hover:text-charcoal"}`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <AdminHeader title="Bookings" description="Times are shown in the firm timezone. All times are stored in UTC." />
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <nav aria-label="Booking views" className="flex gap-6">{tab("Upcoming", "upcoming")}{tab("Past", "past")}{tab("All", "all")}</nav>
        <form className="flex items-center gap-2" action="/admin/bookings">
          <input type="hidden" name="view" value={view} />
          <label htmlFor="status" className="text-sm text-muted">Status</label>
          <select id="status" name="status" defaultValue={status ?? ""} className="field !w-auto !py-1.5 text-sm">
            <option value="">All</option>
            {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <button className="admin-btn" type="submit">Filter</button>
        </form>
      </div>
      {items.length === 0 ? (
        <EmptyRow text="No bookings match this view." />
      ) : (
        <Table head={["When", "Client", "Consultation", "Status", "Agreement", "Ref"]}>
          {items.map((b) => (
            <tr key={String(b._id)}>
              <td className="px-4 py-3 whitespace-nowrap">{formatInZone(b.startUtc, b.firmTimezone).replace(/^\w+, /, "")}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/bookings/${b._id}`} className="font-medium hover:text-gold-ink">{b.name}</Link>
                <span className="block text-xs text-muted">{b.email}</span>
              </td>
              <td className="px-4 py-3">{b.consultationName}</td>
              <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
              <td className="px-4 py-3">{b.agreementSignedAt ? <StatusBadge status="completed" label="signed" /> : <span className="text-xs text-muted">—</span>}</td>
              <td className="px-4 py-3 font-mono text-xs">{b.reference}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
