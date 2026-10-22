import Link from "next/link";
import { AdminHeader, EmptyRow, StatusBadge, Table, fmtDate } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/lib/models";

export default async function InquiriesAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdminPage();
  const { status } = await searchParams;
  await connectDB();
  const filter: Record<string, unknown> = status && ["new", "in_progress", "closed"].includes(status) ? { status } : {};
  const items = await Inquiry.find(filter).sort({ createdAt: -1 }).limit(300).lean();
  const tabs = [["", "All"], ["new", "New"], ["in_progress", "In progress"], ["closed", "Closed"]];

  return (
    <>
      <AdminHeader title="Inquiries" description="Messages submitted through the contact form." />
      <nav aria-label="Inquiry filters" className="mb-5 flex gap-6">
        {tabs.map(([v, l]) => (
          <Link key={v} href={v ? `/admin/inquiries?status=${v}` : "/admin/inquiries"} aria-current={(status ?? "") === v ? "page" : undefined}
            className={`border-b-2 px-1 pb-2 text-sm ${(status ?? "") === v ? "border-gold font-medium" : "border-transparent text-muted hover:text-charcoal"}`}>{l}</Link>
        ))}
      </nav>
      {items.length === 0 ? <EmptyRow text="No inquiries here yet." /> : (
        <Table head={["Received", "Name", "Service", "Status", "Email"]}>
          {items.map((i) => (
            <tr key={String(i._id)}>
              <td className="px-4 py-3 whitespace-nowrap text-muted">{fmtDate(i.createdAt)}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/inquiries/${i._id}`} className="font-medium hover:text-gold-ink">{i.name}</Link>
                <span className="block text-xs text-muted">{i.email}</span>
              </td>
              <td className="px-4 py-3">{i.service || "—"}</td>
              <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
              <td className="px-4 py-3"><StatusBadge status={i.emailStatus} /></td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
