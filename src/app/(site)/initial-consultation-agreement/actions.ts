"use server";

import { randomBytes } from "crypto";
import { z } from "zod";
import { clientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { generateAgreementPdf } from "@/lib/pdf";
import { emailLayout, firmInbox, sendMail } from "@/lib/email";
import { getPage, getSettings } from "@/lib/content";

const schema = z.object({
  firstName: z.string().trim().min(1, "Please enter your first name.").max(60),
  middleName: z.string().trim().max(60).default(""),
  lastName: z.string().trim().min(1, "Please enter your last name.").max(60),
  agree: z.literal("on", { error: "Please confirm that you agree to the agreement." }),
});

export type AgreementState = { ok: boolean; error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };

/** Signs the public Initial Consultation Agreement and emails the PDF to the firm inbox. Nothing is stored on the site. */
export async function submitAgreement(_prev: AgreementState, formData: FormData): Promise<AgreementState> {
  const raw = Object.fromEntries(["firstName", "middleName", "lastName"].map((k) => [k, String(formData.get(k) ?? "")]));
  // Honeypot: real users never fill this hidden field.
  if (String(formData.get("company") ?? "")) return { ok: true };

  const parsed = schema.safeParse({ ...raw, agree: formData.get("agree") ?? undefined });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors, values: raw };
  }
  const d = parsed.data;
  const fullName = [d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ");

  try {
    const ip = await clientIp();
    if (!(await rateLimit(`ica:${ip}`, 10, 3600))) return { ok: false, error: "Too many attempts. Please try again later.", values: raw };

    const [{ fields: f }, settings] = await Promise.all([getPage("agreement"), getSettings()]);
    const signedAt = new Date();
    const reference = `ICA-${signedAt.toISOString().slice(0, 10).replace(/-/g, "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const { buffer } = await generateAgreementPdf({
      businessName: settings.businessName,
      legalName: settings.legalName,
      title: f.title,
      version: 1,
      body: `${f.body}\n\n${f.agreeLabel}`.replace(/^## /gm, "").replace(/^- /gm, "-  "),
      bookingReference: reference,
      consultationName: "Initial Consultation",
      clientFullName: fullName,
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      signatureName: fullName,
      signedAt,
      ipAddress: ip,
    });

    const result = await sendMail({
      to: firmInbox(),
      subject: `Initial Consultation Agreement / ${fullName}`,
      text: `${fullName} agreed to and signed the Initial Consultation Agreement on the website.\n\nReference: ${reference}\nSigned (UTC): ${signedAt.toISOString()}\n\nThe signed PDF is attached.`,
      html: emailLayout("Initial Consultation Agreement", [
        ["Client", fullName], ["Reference", reference], ["Signed (UTC)", signedAt.toISOString().replace("T", " ").slice(0, 19)],
      ], "The signed agreement is attached as a PDF."),
      attachments: [{ filename: `Initial Consultation Agreement - ${fullName.replace(/[^\w .-]/g, "")}.pdf`, content: buffer, contentType: "application/pdf" }],
    });
    // The email is the only record, so the client must retry if it did not go out.
    if (result.status !== "sent") throw new Error(result.error || result.status);
    return { ok: true };
  } catch (err) {
    console.error("Initial consultation agreement failed:", (err as Error).message);
    return { ok: false, error: "We could not submit your agreement right now. Please try again shortly or email us.", values: raw };
  }
}
