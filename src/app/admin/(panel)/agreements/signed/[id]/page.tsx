import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { Download } from "lucide-react";
import ActionButton from "@/components/admin/ActionButton";
import { AdminHeader, Panel, StatusBadge, fmtDate } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { SignedAgreement } from "@/lib/models";
import { retryAgreementEmail } from "../../../ops-actions";

export default async function SignedDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();
  await connectDB();
  const s = await SignedAgreement.findById(id).lean(); // pdf excluded by default
  if (!s) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Client", s.clientFullName],
    ["Email", s.clientEmail],
    ["Phone", s.clientPhone || "—"],
    ["Address", s.clientAddress || "—"],
    ["Typed signature", <span key="s" className="font-serif text-xl italic">{s.signatureName}</span>],
    ["Consent", s.consent ? "Confirmed" : "No"],
    ["Signed (UTC)", s.signedAt.toISOString()],
    ["Booking", <Link key="b" href={`/admin/bookings/${s.booking}`} className="link-gold">{s.bookingReference}</Link>],
    ["Agreement version", `v${s.templateVersion} — ${s.templateTitle}`],
    ["Signer IP", s.ipAddress || "—"],
    ["PDF SHA-256", <span key="h" className="break-all font-mono text-xs">{s.pdfSha256}</span>],
  ];

  return (
    <>
      <AdminHeader
        title={s.clientFullName}
        description={`Signed ${fmtDate(s.signedAt)}`}
        back="/admin/agreements"
        action={<a href={`/api/admin/agreements/${id}/pdf`} className="admin-btn admin-btn-primary"><Download aria-hidden className="h-4 w-4" /> Download PDF</a>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Panel title="Record">
            <dl className="divide-y divide-line text-sm">
              {rows.map(([k, v]) => <div key={k} className="grid grid-cols-[130px_1fr] gap-3 py-2.5"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </Panel>
          <Panel title="Firm email delivery">
            <p className="text-sm"><StatusBadge status={s.emailStatus} /> · {s.emailAttempts} attempt(s){s.emailSentAt ? ` · sent ${fmtDate(s.emailSentAt)}` : ""}</p>
            {s.emailLastError && <p className="mt-2 text-xs text-[#9b1c1c]">{s.emailLastError}</p>}
            <div className="mt-4"><ActionButton action={retryAgreementEmail.bind(null, id)}>{s.emailStatus === "sent" ? "Send again" : "Retry delivery"}</ActionButton></div>
          </Panel>
        </div>
        <Panel title="Signed wording (snapshot)">
          <pre className="max-h-[36rem] overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed">{s.templateBody}</pre>
        </Panel>
      </div>
    </>
  );
}
