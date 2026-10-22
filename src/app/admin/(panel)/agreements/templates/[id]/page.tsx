import { notFound } from "next/navigation";
import { Types } from "mongoose";
import EntityForm from "@/components/admin/EntityForm";
import ActionButton from "@/components/admin/ActionButton";
import { AdminHeader, Panel, StatusBadge, fmtDate } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AgreementTemplate, SignedAgreement } from "@/lib/models";
import { activateAgreement, createAgreementVersion, deactivateAgreement, deleteAgreementDraft, saveAgreementDraft } from "../../../ops-actions";

export default async function TemplateDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();
  await connectDB();
  const t = await AgreementTemplate.findById(id).lean();
  if (!t) notFound();
  const signedCount = await SignedAgreement.countDocuments({ templateId: t._id });

  return (
    <>
      <AdminHeader
        title={`${t.title} — v${t.version}`}
        description={`${signedCount} signed agreement(s) use this version. Last updated ${fmtDate(t.updatedAt)}.`}
        back="/admin/agreements"
        action={<StatusBadge status={t.status} />}
      />
      {t.status === "draft" ? (
        <>
          <p className="mb-6 rounded-sm border border-[#f0dcae] bg-[#fdf7e9] px-4 py-3 text-sm text-[#6b4a12]">
            Paste the firm&apos;s approved agreement wording. Once activated, a version becomes read-only so every signed record matches exactly what the client saw.
          </p>
          <Panel>
            <EntityForm
              fields={[
                { name: "title", label: "Title", type: "text", required: true, full: true },
                { name: "body", label: "Agreement wording", type: "textarea", rows: 24, help: "Plain text. Line breaks are preserved in the signing page and PDF." },
              ]}
              initial={{ title: t.title, body: t.body }}
              action={saveAgreementDraft.bind(null, id)}
              submitLabel="Save draft"
              extraButtons={
                <>
                  <ActionButton action={activateAgreement.bind(null, id)} variant="primary" confirm="Activate this version? It will be used for all new signatures and become read-only. Save any edits first.">
                    Activate version
                  </ActionButton>
                  <ActionButton action={deleteAgreementDraft.bind(null, id)} variant="danger" confirm="Delete this draft?" redirectTo="/admin/agreements">Delete draft</ActionButton>
                </>
              }
            />
          </Panel>
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <ActionButton action={createAgreementVersion.bind(null, id)} variant="primary" redirectTo="/admin/agreements/templates/:id">Create new version from this</ActionButton>
            {t.status === "active" && (
              <ActionButton action={deactivateAgreement.bind(null, id)} variant="danger" confirm="Deactivate? Clients will not be able to sign until another version is activated.">Deactivate</ActionButton>
            )}
          </div>
          <Panel title="Wording (read-only)">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{t.body}</pre>
          </Panel>
        </>
      )}
    </>
  );
}
