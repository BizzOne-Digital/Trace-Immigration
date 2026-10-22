"use server";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/lib/models";
import { clientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { emailLayout, firmInbox, sendMail } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address.").trim().max(200),
  phone: z.string().trim().max(40).regex(/^[\d\s()+.-]*$/, "Please enter a valid phone number.").optional().default(""),
  service: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10, "Please share a little more detail (at least 10 characters).").max(3000),
});

export type InquiryState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
  values?: Record<string, string>;
};

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const raw = Object.fromEntries(["name", "email", "phone", "service", "message"].map((k) => [k, String(formData.get(k) ?? "")]));
  // Honeypot: real users never fill this hidden field.
  if (String(formData.get("company") ?? "")) return { ok: true, message: "Thank you." };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: InquiryState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof schema>;
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", errors, values: raw };
  }

  try {
    if (!(await rateLimit(`inquiry:${await clientIp()}`, 5, 3600))) {
      return { ok: false, message: "Too many submissions. Please try again later or email us directly.", values: raw };
    }
    await connectDB();
    const inquiry = await Inquiry.create({ ...parsed.data, status: "new", emailStatus: "pending" });

    const d = parsed.data;
    const result = await sendMail({
      to: firmInbox(),
      replyTo: d.email,
      subject: `New website inquiry — ${d.name}`,
      text: `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone || "-"}\nService: ${d.service || "-"}\n\n${d.message}`,
      html: emailLayout("New website inquiry", [
        ["Name", d.name], ["Email", d.email], ["Phone", d.phone || "-"], ["Service", d.service || "-"], ["Message", d.message],
      ]),
    });
    await Inquiry.updateOne({ _id: inquiry._id }, { emailStatus: result.status, emailError: result.error });
    return { ok: true, message: "Inquiry received." };
  } catch (err) {
    console.error("Inquiry submission failed:", (err as Error).message);
    return { ok: false, message: "We could not send your inquiry right now. Please email or call us directly.", values: raw };
  }
}
