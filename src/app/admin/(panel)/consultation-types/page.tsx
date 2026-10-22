import Link from "next/link";
import { AdminHeader, EmptyRow, NewButton, StatusBadge, Table } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ConsultationType } from "@/lib/models";
import { deleteConsultationType } from "../content-actions";

export default async function ConsultationTypesAdmin() {
  await requireAdminPage();
  await connectDB();
  const items = await ConsultationType.find().sort({ order: 1 }).lean();
  return (
    <>
      <AdminHeader
        title="Consultation types"
        description="Bookable consultations shown on the booking and pricing pages."
        action={<NewButton href="/admin/consultation-types/new" label="New type" />}
      />
      {items.length === 0 ? (
        <EmptyRow text="No consultation types yet. Online booking stays closed until one is published." />
      ) : (
        <Table head={["Name", "Duration", "Price", "Status", ""]}>
          {items.map((t) => (
            <tr key={String(t._id)}>
              <td className="px-4 py-3"><Link href={`/admin/consultation-types/${t._id}`} className="font-medium hover:text-gold-ink">{t.name}</Link></td>
              <td className="px-4 py-3">{t.durationMinutes} min</td>
              <td className="px-4 py-3">{t.priceLabel || <span className="text-muted">Contact us</span>}</td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3 text-right">
                <ActionButton action={deleteConsultationType.bind(null, String(t._id))} variant="danger" confirm={`Delete "${t.name}"? Existing bookings keep their details.`}>Delete</ActionButton>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
