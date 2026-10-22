"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { AgreementTemplate, Booking, SignedAgreement } from "@/lib/models";
import { clientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { hashToken } from "@/lib/booking";
import { generateAgreementPdf } from "@/lib/pdf";
import { getSettings } from "@/lib/content";
import { deliverSignedAgreement } from "@/lib/notifications";

const schema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{40,60}$/),
  templateId: z.string().min(1),
  templateVersion: z.coerce.number().int().min(1),
  clientFullName: z.string().trim().min(2, "Please enter your full legal name.").max(160),
  clientEmail: z.email("Please enter a valid email address.").trim().max(200),
  clientPhone: z.string().trim().max(40).default(""),
  clientAddress: z.string().trim().max(400).default(""),
  signatureName: z.string().trim().min(2, "Please type your full name to sign.").max(160),
  consent: z.literal("on", { error: "Please confirm your consent to sign electronically." }),
});

export type SignState = { ok: boolean; error?: string; fieldErrors?: Record<string, string>; signedAt?: string };

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

export async function signAgreement(_prev: SignState, formData: FormData): Promise<SignState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }
  const d = parsed.data;
  if (norm(d.signatureName) !== norm(d.clientFullName)) {
    return { ok: false, error: "Your typed signature must match your full name.", fieldErrors: { signatureName: "Type your full name exactly as entered above." } };
  }

  try {
    const ip = await clientIp();
    if (!(await rateLimit(`agreement:${ip}`, 10, 3600))) return { ok: false, error: "Too many attempts. Please try again later." };

    await connectDB();
    const booking = await Booking.findOne({ agreementTokenHash: hashToken(d.token) }).lean();
    if (!booking || booking.status === "cancelled") return { ok: false, error: "This agreement link is no longer valid." };
    if (await SignedAgreement.exists({ booking: booking._id })) return { ok: false, error: "This agreement has already been signed." };

    const template = await AgreementTemplate.findOne({ status: "active" }).lean();
    if (!template || !template.body.trim()) return { ok: false, error: "The agreement is not available for signing yet." };
    if (String(template._id) !== d.templateId || template.version !== d.templateVersion) {
      return { ok: false, error: "The agreement wording was updated while you were reviewing it. Please reload the page and review the current version." };
    }

    const settings = await getSettings();
    const signedAt = new Date();
    const userAgent = ((await headers()).get("user-agent") ?? "").slice(0, 400);
    const { buffer, sha256 } = await generateAgreementPdf({
      businessName: settings.businessName,
      legalName: settings.legalName,
      title: template.title,
      version: template.version,
      body: template.body,
      bookingReference: booking.reference,
      consultationName: booking.consultationName,
      clientFullName: d.clientFullName,
      clientEmail: d.clientEmail,
      clientPhone: d.clientPhone,
      clientAddress: d.clientAddress,
      signatureName: d.signatureName,
      signedAt,
      ipAddress: ip,
    });

    let created;
    try {
      created = await SignedAgreement.create({
        booking: booking._id,
        bookingReference: booking.reference,
        templateId: template._id,
        templateVersion: template.version,
        templateTitle: template.title,
        templateBody: template.body,
        clientFullName: d.clientFullName,
        clientEmail: d.clientEmail,
        clientPhone: d.clientPhone,
        clientAddress: d.clientAddress,
        signatureName: d.signatureName,
        consent: true,
        signedAt,
        ipAddress: ip,
        userAgent,
        pdf: buffer,
        pdfSize: buffer.length,
        pdfSha256: sha256,
        emailStatus: "pending",
      });
    } catch (err) {
      // Unique index on booking: a concurrent submission already signed it.
      if ((err as { code?: number }).code === 11000) return { ok: false, error: "This agreement has already been signed." };
      throw err;
    }
    await Booking.updateOne({ _id: booking._id }, { agreementSignedAt: signedAt });
    await deliverSignedAgreement(String(created._id));
    revalidatePath(`/consultation-agreement/${d.token}`);
    return { ok: true, signedAt: signedAt.toISOString() };
  } catch (err) {
    console.error("Agreement signing failed:", (err as Error).message);
    return { ok: false, error: "We could not record your signature right now. Please try again shortly." };
  }
}
