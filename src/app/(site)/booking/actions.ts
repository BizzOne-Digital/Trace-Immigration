"use server";

import { z } from "zod";
import { clientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createBooking, formatInZone, issueAgreementToken } from "@/lib/booking";
import { hasActiveAgreement, sendBookingEmails } from "@/lib/notifications";

const schema = z.object({
  consultationTypeId: z.string().min(1, "Please choose a consultation type."),
  startUtc: z.string().min(1, "Please choose a time."),
  clientTimezone: z.string().max(60).default(""),
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address.").trim().max(200),
  phone: z.string().trim().max(40).regex(/^[\d\s()+.-]*$/, "Please enter a valid phone number.").default(""),
  service: z.string().trim().max(120).default(""),
  notes: z.string().trim().max(2000).default(""),
  consent: z.literal("on", { error: "Please confirm you agree to be contacted about this booking." }),
});

export type BookingResult =
  | { ok: true; reference: string; firmTime: string; agreementUrl: string | null; emailSent: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; slotTaken?: boolean };

export async function submitBooking(formData: FormData): Promise<BookingResult> {
  if (String(formData.get("company") ?? "")) return { ok: false, error: "Unable to submit." };
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }
  try {
    if (!(await rateLimit(`booking:${await clientIp()}`, 6, 3600))) {
      return { ok: false, error: "Too many booking attempts. Please try again later or contact us directly." };
    }
    const res = await createBooking(parsed.data);
    if (!res.ok) return { ok: false, error: res.error, slotTaken: true };

    const booking = res.booking.toObject();
    const token = (await hasActiveAgreement()) ? await issueAgreementToken(booking._id) : undefined;
    const emailStatus = await sendBookingEmails(booking, token);
    return {
      ok: true,
      reference: booking.reference,
      firmTime: formatInZone(booking.startUtc, booking.firmTimezone),
      agreementUrl: token ? `/consultation-agreement/${token}` : null,
      emailSent: emailStatus === "sent",
    };
  } catch (err) {
    console.error("Booking failed:", (err as Error).message);
    return { ok: false, error: "We could not complete your booking right now. Please try again or contact us directly." };
  }
}
