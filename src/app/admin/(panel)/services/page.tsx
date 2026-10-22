import Link from "next/link";
import { AdminHeader, EmptyRow, NewButton, StatusBadge, Table } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models";
import { deleteService } from "../content-actions";

export default async function ServicesAdmin() {
  await requireAdminPage();
  await connectDB();
  const items = await Service.find().sort({ order: 1, title: 1 }).select("title slug status featured order").lean();

  return (
    <>
      <AdminHeader title="Services" description="Service cards, overview and detail pages." action={<NewButton href="/admin/services/new" label="New service" />} />
      {items.length === 0 ? (
        <EmptyRow text="No services yet. Run the seed script or create one." action={<NewButton href="/admin/services/new" label="New service" />} />
      ) : (
        <Table head={["Title", "URL", "Status", "Order", ""]}>
          {items.map((s) => (
            <tr key={String(s._id)}>
              <td className="px-4 py-3">
                <Link href={`/admin/services/${s._id}`} className="font-medium hover:text-gold-ink">{s.title}</Link>
                {s.featured && <span className="ml-2 text-xs text-gold-ink">Featured</span>}
              </td>
              <td className="px-4 py-3 text-muted">/services/{s.slug}</td>
              <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
              <td className="px-4 py-3">{s.order}</td>
              <td className="px-4 py-3 text-right">
                <ActionButton action={deleteService.bind(null, String(s._id))} variant="danger" confirm={`Delete "${s.title}"? This cannot be undone.`}>Delete</ActionButton>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
