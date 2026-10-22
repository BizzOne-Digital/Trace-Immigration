import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import EntityForm from "@/components/admin/EntityForm";
import ActionButton from "@/components/admin/ActionButton";
import { AdminHeader, Panel, StatusBadge, fmtDate } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Booking, SignedAgreement } from "@/lib/models";
import { formatInZone } from "@/lib/booking";
import { createAgreementLink, deleteBooking, resendBookingEmail, saveBookingNotes, updateBookingStatus } from "../../ops-actions";
import AgreementLinkButton from "./AgreementLinkButton";

export default async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();
  await connectDB();
  const b = await Booking.findById(id).lean();
  if (!b) notFound();
  const signed = await SignedAgreement.findOne({ booking: b._id }).select("signedAt emailStatus").lean();

  const rows: [string, React.ReactNode][] = [
    ["Reference", <span key="r" className="font-mono">{b.reference}</span>],
    ["Consultation", `${b.consultationName} · ${b.durationMinutes} min`],
    ["Firm time", formatInZone(b.startUtc, b.firmTimezone)],
    ["Client time", b.clientTimezone ? formatInZone(b.startUtc, b.clientTimezone) : "Unknown"],
    ["Stored (UTC)", b.startUtc.toISOString()],
    ["Name", b.name],
    ["Email", <a key="e" href={`mailto:${b.email}`} className="link-gold">{b.email}</a>],
    ["Phone", b.phone || "—"],
    ["Service", b.service || "—"],
    ["Client notes", <span key="n" className="whitespace-pre-wrap">{b.notes || "—"}</span>],
    ["Requested", fmtDate(b.createdAt)],
    ["Client email", <StatusBadge key="ce" status={b.clientEmailStatus} />],
    ["Firm email", <StatusBadge key="fe" status={b.firmEmailStatus} />],
  ];
  const status = (s: string, label: string, notify = false, variant: "default" | "primary" | "danger" = "default") =>
    b.status !== s && (
      <ActionButton key={s} action={updateBookingStatus.bind(null, id, s, notify)} variant={variant}>{label}</ActionButton>
    );

  return (
    <>
      <AdminHeader title={b.name} description={`Booking ${b.reference}`} back="/admin/bookings" action={<StatusBadge status={b.status} />} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Details">
          <dl className="divide-y divide-line text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[130px_1fr] gap-3 py-2.5"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          {b.emailError && <p className="mt-3 text-xs text-[#9b1c1c]">Last email error: {b.emailError}</p>}
        </Panel>
        <div className="space-y-6">
          <Panel title="Status">
            <div className="flex flex-wrap gap-2">
              {status("confirmed", "Confirm & email client", true, "primary")}
              {status("completed", "Mark completed")}
              {status("no_show", "Mark no-show")}
              {status("pending", "Set pending")}
              {b.status !== "cancelled" && (
                <ActionButton action={updateBookingStatus.bind(null, id, "cancelled", false)} variant="danger" confirm="Cancel this booking and release the time slot?">Cancel booking</ActionButton>
              )}
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <ActionButton action={resendBookingEmail.bind(null, id)}>Resend client email</ActionButton>
            </div>
          </Panel>
          <Panel title="Consultation agreement">
            {signed ? (
              <p className="text-sm">
                Signed {fmtDate(signed.signedAt)} · <Link href={`/admin/agreements/signed/${signed._id}`} className="link-gold">View record</Link>
              </p>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted">Not signed yet. For security, links are never displayed after creation — create a new one if the client needs it again.</p>
                <AgreementLinkButton create={createAgreementLink.bind(null, id)} />
              </>
            )}
          </Panel>
          <Panel title="Internal notes">
            <EntityForm fields={[{ name: "adminNotes", label: "Notes (not visible to the client)", type: "textarea", rows: 5 }]} initial={{ adminNotes: b.adminNotes }} action={saveBookingNotes.bind(null, id)} submitLabel="Save notes" />
          </Panel>
          {!signed && (
            <ActionButton action={deleteBooking.bind(null, id)} variant="danger" confirm="Permanently delete this booking?" redirectTo="/admin/bookings">Delete booking</ActionButton>
          )}
        </div>
      </div>
    </>
  );
}
