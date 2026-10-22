import Link from "next/link";
import { AdminHeader, EmptyRow, NewButton, StatusBadge, Table } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Testimonial } from "@/lib/models";
import { deleteTestimonial } from "../content-actions";

export default async function TestimonialsAdmin() {
  await requireAdminPage();
  await connectDB();
  const items = await Testimonial.find().sort({ status: 1, order: 1, createdAt: -1 }).lean();
  return (
    <>
      <AdminHeader
        title="Testimonials"
        description="Only approved testimonials with recorded client consent are published."
        action={<NewButton href="/admin/testimonials/new" label="New testimonial" />}
      />
      {items.length === 0 ? (
        <EmptyRow text="No testimonials yet. The public page shows an empty state until one is approved." />
      ) : (
        <Table head={["Client", "Excerpt", "Consent", "Status", ""]}>
          {items.map((t) => (
            <tr key={String(t._id)}>
              <td className="px-4 py-3"><Link href={`/admin/testimonials/${t._id}`} className="font-medium hover:text-gold-ink">{t.clientName}</Link></td>
              <td className="max-w-xs truncate px-4 py-3 text-muted">{t.quote}</td>
              <td className="px-4 py-3">{t.consentConfirmed ? "Recorded" : <span className="text-[#9b1c1c]">Missing</span>}</td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3 text-right">
                <ActionButton action={deleteTestimonial.bind(null, String(t._id))} variant="danger" confirm="Delete this testimonial?">Delete</ActionButton>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
