import Link from "next/link";
import { Plus } from "lucide-react";
import ActionButton from "@/components/admin/ActionButton";
import { AdminHeader, EmptyRow, Panel, StatusBadge, Table, fmtDate } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AgreementTemplate, SignedAgreement } from "@/lib/models";
import { createAgreementVersion } from "../ops-actions";

export default async function AgreementsAdmin() {
  await requireAdminPage();
  await connectDB();
  const [templates, signed] = await Promise.all([
    AgreementTemplate.find().sort({ version: -1 }).select("version title status activatedAt updatedAt").lean(),
    SignedAgreement.find().sort({ signedAt: -1 }).limit(200).select("bookingReference clientFullName signedAt templateVersion emailStatus emailAttempts").lean(),
  ]);
  const active = templates.find((t) => t.status === "active");

  return (
    <>
      <AdminHeader title="Consultation agreements" description="Versioned agreement wording and completed, signed agreements." />

      {!active && (
        <p className="mb-6 rounded-sm border border-[#f0dcae] bg-[#fdf7e9] px-4 py-3 text-sm text-[#6b4a12]">
          No agreement is active, so clients cannot sign yet. Enter the firm&apos;s approved wording in a draft and activate it. No default legal wording is provided.
        </p>
      )}

      <Panel title="Agreement versions" className="mb-8">
        <div className="mb-4">
          <ActionButton action={createAgreementVersion.bind(null, undefined)} variant="primary" redirectTo="/admin/agreements/templates/:id">
            <Plus aria-hidden className="h-4 w-4" /> New blank draft
          </ActionButton>
        </div>
        {templates.length === 0 ? <p className="text-sm text-muted">No versions yet.</p> : (
          <Table head={["Version", "Title", "Status", "Activated", "Updated"]}>
            {templates.map((t) => (
              <tr key={String(t._id)}>
                <td className="px-4 py-3">v{t.version}</td>
                <td className="px-4 py-3"><Link href={`/admin/agreements/templates/${t._id}`} className="font-medium hover:text-gold-ink">{t.title}</Link></td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3 text-muted">{fmtDate(t.activatedAt)}</td>
                <td className="px-4 py-3 text-muted">{fmtDate(t.updatedAt)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <h2 className="mb-4 font-serif text-2xl">Signed agreements</h2>
      {signed.length === 0 ? <EmptyRow text="No agreements have been signed yet." /> : (
        <Table head={["Signed", "Client", "Booking", "Version", "Firm email"]}>
          {signed.map((s) => (
            <tr key={String(s._id)}>
              <td className="px-4 py-3 whitespace-nowrap text-muted">{fmtDate(s.signedAt)}</td>
              <td className="px-4 py-3"><Link href={`/admin/agreements/signed/${s._id}`} className="font-medium hover:text-gold-ink">{s.clientFullName}</Link></td>
              <td className="px-4 py-3 font-mono text-xs">{s.bookingReference}</td>
              <td className="px-4 py-3">v{s.templateVersion}</td>
              <td className="px-4 py-3"><StatusBadge status={s.emailStatus} /> <span className="text-xs text-muted">({s.emailAttempts} attempt{s.emailAttempts === 1 ? "" : "s"})</span></td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
