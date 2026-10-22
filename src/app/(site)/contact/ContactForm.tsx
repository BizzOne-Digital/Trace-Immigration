"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitInquiry, type InquiryState } from "./actions";

const initial: InquiryState = { ok: false, message: "" };

export default function ContactForm({ services, successText }: { services: string[]; successText: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);

  if (state.ok) {
    return (
      <div role="status" className="card-line flex flex-col items-center px-6 py-14 text-center">
        <CheckCircle2 aria-hidden className="h-10 w-10 text-gold" strokeWidth={1.3} />
        <p className="mt-5 max-w-sm font-serif text-2xl text-charcoal">{successText}</p>
      </div>
    );
  }

  const err = state.errors ?? {};
  const v = state.values ?? {};
  const fieldProps = (name: keyof typeof err) => ({
    id: name,
    name,
    defaultValue: v[name] ?? "",
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? `${name}-error` : undefined,
    className: "field",
  });
  const Error = ({ name }: { name: keyof typeof err }) =>
    err[name] ? <p id={`${name}-error`} className="mt-1.5 text-sm text-[#b42318]">{err[name]}</p> : null;

  return (
    <form action={action} noValidate className="space-y-5">
      {state.message && !state.ok && (
        <p role="alert" className="border border-[#f2c6c2] bg-[#fdf3f2] px-4 py-3 text-sm text-[#8a1c12]">{state.message}</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">Full name <span aria-hidden className="text-gold">*</span></label>
          <input {...fieldProps("name")} type="text" autoComplete="name" required maxLength={120} />
          <Error name="name" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email <span aria-hidden className="text-gold">*</span></label>
          <input {...fieldProps("email")} type="email" autoComplete="email" required maxLength={200} />
          <Error name="email" />
        </div>
        <div>
          <label htmlFor="phone" className="field-label">Phone</label>
          <input {...fieldProps("phone")} type="tel" autoComplete="tel" maxLength={40} />
          <Error name="phone" />
        </div>
        <div>
          <label htmlFor="service" className="field-label">Service required</label>
          <select {...fieldProps("service")}>
            <option value="">Select a service</option>
            {services.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value="Other / not sure">Other / not sure</option>
          </select>
          <Error name="service" />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="field-label">Brief inquiry <span aria-hidden className="text-gold">*</span></label>
        <textarea {...fieldProps("message")} rows={6} required maxLength={3000} />
        <p className="mt-1.5 text-xs text-muted">Please do not include passport numbers or other sensitive identifiers.</p>
        <Error name="message" />
      </div>
      {/* Honeypot field, hidden from people and assistive technology. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" disabled={pending} className="btn-gold disabled:opacity-70">
        {pending ? <><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Sending…</> : "Send Inquiry"}
      </button>
    </form>
  );
}
