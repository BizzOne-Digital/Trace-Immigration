import "server-only";
import { connectDB } from "./db";
import { AgreementTemplate, Booking, SignedAgreement, type BookingDoc } from "./models";
import { emailLayout, firmInbox, sendMail } from "./email";
import { formatInZone } from "./booking";
import { toBuffer } from "./binary";
import { getSettings } from "./content";
import { siteUrl } from "./site";

export async function hasActiveAgreement() {
  await connectDB();
  const t = await AgreementTemplate.findOne({ status: "active" }).select("body").lean();
  return Boolean(t?.body?.trim());
}

type BookingLike = BookingDoc & { _id: unknown };

/** Sends the client confirmation and firm notification; records statuses on the booking. */
export async function sendBookingEmails(booking: BookingLike, agreementToken?: string, kind: "received" | "confirmed" = "received") {
  const settings = await getSettings();
  const firmTime = formatInZone(booking.startUtc, booking.firmTimezone);
  const clientTime =
    booking.clientTimezone && booking.clientTimezone !== booking.firmTimezone ? formatInZone(booking.startUtc, booking.clientTimezone) : "";
  const agreementUrl = agreementToken ? siteUrl(`/consultation-agreement/${agreementToken}`) : "";

  const rows: [string, string][] = [
    ["Reference", booking.reference],
    ["Consultation", `${booking.consultationName} (${booking.durationMinutes} min, virtual)`],
    ["Time", firmTime],
  ];
  if (clientTime) rows.push(["Your local time", clientTime]);
  if (agreementUrl) rows.push(["Consultation agreement", agreementUrl]);

  const title = kind === "confirmed" ? "Your consultation is confirmed" : "We have received your consultation request";
  const intro =
    kind === "confirmed"
      ? `Thank you, ${booking.name}. Your consultation is confirmed. Meeting details will be shared with you before the appointment.`
      : `Thank you, ${booking.name}. Your request has been received and we will confirm your consultation by email.`;
  const client = await sendMail({
    to: booking.email,
    replyTo: settings.email,
    subject: `${title} — ${booking.reference}`,
    text: `${intro}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${settings.businessName}\n${settings.email} | ${settings.phone}`,
    html: emailLayout(title, rows, intro),
  });

  let firmStatus = booking.firmEmailStatus;
  if (kind === "received") {
    const firm = await sendMail({
      to: firmInbox(),
      replyTo: booking.email,
      subject: `New booking request — ${booking.reference} — ${booking.name}`,
      text: [
        `Reference: ${booking.reference}`, `Consultation: ${booking.consultationName}`, `Time: ${firmTime}`,
        `Name: ${booking.name}`, `Email: ${booking.email}`, `Phone: ${booking.phone || "-"}`,
        `Service: ${booking.service || "-"}`, `Client timezone: ${booking.clientTimezone || "-"}`, ``, booking.notes || "",
      ].join("\n"),
      html: emailLayout("New booking request", [
        ["Reference", booking.reference], ["Consultation", booking.consultationName], ["Time", firmTime],
        ["Name", booking.name], ["Email", booking.email], ["Phone", booking.phone || "-"],
        ["Service", booking.service || "-"], ["Client timezone", booking.clientTimezone || "-"], ["Notes", booking.notes || "-"],
      ]),
    });
    firmStatus = firm.status;
  }

  await Booking.updateOne(
    { _id: booking._id },
    { clientEmailStatus: client.status, firmEmailStatus: firmStatus, emailError: client.error }
  );
  return client.status;
}

/** Emails the signed PDF to the firm inbox. Safe to call repeatedly (retry). */
export async function deliverSignedAgreement(agreementId: string) {
  await connectDB();
  const doc = await SignedAgreement.findById(agreementId).select("+pdf").lean();
  if (!doc) return { status: "failed" as const, error: "Agreement not found" };
  const settings = await getSettings();
  const result = await sendMail({
    to: firmInbox(),
    replyTo: doc.clientEmail,
    subject: `Signed consultation agreement — ${doc.bookingReference} — ${doc.clientFullName}`,
    text: `A consultation agreement was signed.\n\nReference: ${doc.bookingReference}\nClient: ${doc.clientFullName}\nSigned: ${doc.signedAt.toISOString()}\nAgreement version: ${doc.templateVersion}\n\nThe signed PDF is attached.\n\n${settings.businessName}`,
    html: emailLayout("Signed consultation agreement", [
      ["Reference", doc.bookingReference], ["Client", doc.clientFullName], ["Email", doc.clientEmail],
      ["Signed (UTC)", doc.signedAt.toISOString().replace("T", " ").slice(0, 19)], ["Agreement version", String(doc.templateVersion)],
    ], "The signed PDF is attached."),
    attachments: [{
      filename: `consultation-agreement-${doc.bookingReference}.pdf`,
      content: toBuffer(doc.pdf),
      contentType: "application/pdf",
    }],
  });
  await SignedAgreement.updateOne(
    { _id: doc._id },
    {
      $set: { emailStatus: result.status, emailLastError: result.error ?? "", ...(result.status === "sent" ? { emailSentAt: new Date() } : {}) },
      $inc: { emailAttempts: 1 },
    }
  );
  return result;
}
