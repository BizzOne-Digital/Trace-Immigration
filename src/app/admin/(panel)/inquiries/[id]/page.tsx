import { notFound } from "next/navigation";
import { Types } from "mongoose";
import EntityForm from "@/components/admin/EntityForm";
import ActionButton from "@/components/admin/ActionButton";
import { AdminHeader, Panel, StatusBadge, fmtDate } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/lib/models";
import { telHref } from "@/lib/content";
import { deleteInquiry, retryInquiryEmail, updateInquiry } from "../../ops-actions";

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();
  await connectDB();
  const i = await Inquiry.findById(id).lean();
  if (!i) notFound();

  return (
    <>
      <AdminHeader title={i.name} description={`Received ${fmtDate(i.createdAt)}`} back="/admin/inquiries" action={<StatusBadge status={i.status} />} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Message">
          <dl className="mb-5 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-muted">Email</dt><dd><a href={`mailto:${i.email}`} className="link-gold">{i.email}</a></dd></div>
            <div><dt className="text-muted">Phone</dt><dd>{i.phone ? <a href={telHref(i.phone)} className="link-gold">{i.phone}</a> : "—"}</dd></div>
            <div><dt className="text-muted">Service</dt><dd>{i.service || "—"}</dd></div>
            <div><dt className="text-muted">Notification</dt><dd><StatusBadge status={i.emailStatus} /></dd></div>
          </dl>
          <p className="whitespace-pre-wrap border-t border-line pt-5 leading-relaxed">{i.message}</p>
          {i.emailStatus !== "sent" && (
            <div className="mt-5 border-t border-line pt-4">
              {i.emailError && <p className="mb-2 text-xs text-[#9b1c1c]">{i.emailError}</p>}
              <ActionButton action={retryInquiryEmail.bind(null, id)}>Retry notification email</ActionButton>
            </div>
          )}
        </Panel>
        <div className="space-y-6">
          <Panel title="Follow-up">
            <EntityForm
              fields={[
                { name: "status", label: "Status", type: "select", options: [{ value: "new", label: "New" }, { value: "in_progress", label: "In progress" }, { value: "closed", label: "Closed" }], full: true },
                { name: "adminNotes", label: "Internal notes", type: "textarea", rows: 5 },
              ]}
              initial={{ status: i.status, adminNotes: i.adminNotes }}
              action={updateInquiry.bind(null, id)}
              submitLabel="Update"
            />
          </Panel>
          <ActionButton action={deleteInquiry.bind(null, id)} variant="danger" confirm="Permanently delete this inquiry?" redirectTo="/admin/inquiries">Delete inquiry</ActionButton>
        </div>
      </div>
    </>
  );
}
