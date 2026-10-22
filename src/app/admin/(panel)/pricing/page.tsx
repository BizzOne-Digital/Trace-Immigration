import Link from "next/link";
import { AdminHeader, EmptyRow, NewButton, StatusBadge, Table } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { PricingPlan } from "@/lib/models";
import { deletePricingPlan } from "../content-actions";

export default async function PricingAdmin() {
  await requireAdminPage();
  await connectDB();
  const items = await PricingPlan.find().sort({ order: 1 }).lean();
  return (
    <>
      <AdminHeader
        title="Pricing"
        description="Professional service fees. Consultation fees are set on each consultation type. Items without an approved price display “Contact us for consultation details.”"
        action={<NewButton href="/admin/pricing/new" label="New pricing item" />}
      />
      <p className="mb-6 text-sm">
        Consultation fees: <Link href="/admin/consultation-types" className="link-gold">manage consultation types</Link>
      </p>
      {items.length === 0 ? (
        <EmptyRow text="No pricing items yet. The Pricing page shows “Contact us for consultation details.” until approved prices are published." />
      ) : (
        <Table head={["Name", "Price", "Status", "Order", ""]}>
          {items.map((p) => (
            <tr key={String(p._id)}>
              <td className="px-4 py-3"><Link href={`/admin/pricing/${p._id}`} className="font-medium hover:text-gold-ink">{p.name}</Link></td>
              <td className="px-4 py-3">{p.priceLabel || <span className="text-muted">Contact us</span>}</td>
              <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
              <td className="px-4 py-3">{p.order}</td>
              <td className="px-4 py-3 text-right">
                <ActionButton action={deletePricingPlan.bind(null, String(p._id))} variant="danger" confirm={`Delete "${p.name}"?`}>Delete</ActionButton>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
