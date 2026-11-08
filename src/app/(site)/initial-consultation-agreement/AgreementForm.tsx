"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { submitAgreement, type AgreementState } from "./actions";
import { BOOKING_URL } from "@/lib/site";

const initial: AgreementState = { ok: false };

export default function AgreementForm({ agreeLabel, successText }: { agreeLabel: string; successText: string }) {
  const [state, action, pending] = useActionState(submitAgreement, initial);

  if (state.ok) {
    return (
      <div role="status" className="card-line flex flex-col items-center px-6 py-14 text-center">
        <CheckCircle2 aria-hidden className="h-10 w-10 text-gold" strokeWidth={1.3} />
        <p className="mt-5 max-w-md font-serif text-2xl text-charcoal">{successText}</p>
        <a href={BOOKING_URL} className="btn-gold mt-8">Book a Consultation <ArrowRight aria-hidden className="h-4 w-4" /></a>
      </div>
    );
  }

  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const field = (name: string) => ({
    id: name,
    name,
    defaultValue: v[name] ?? "",
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? `${name}-error` : undefined,
    className: "field",
  });
  const Error = ({ name }: { name: string }) =>
    err[name] ? <p id={`${name}-error`} className="mt-1.5 text-sm text-[#b42318]">{err[name]}</p> : null;

  return (
    <form action={action} noValidate className="card-line space-y-6 p-6 md:p-8">
      {state.error && (
        <p role="alert" className="border border-[#f2c6c2] bg-[#fdf3f2] px-4 py-3 text-sm text-[#8a1c12]">{state.error}</p>
      )}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <fieldset>
        <legend className="field-label">Agree <span aria-hidden className="text-gold">*</span></legend>
        <label className="mt-2 flex items-start gap-3 text-ink">
          <input
            type="checkbox"
            name="agree"
            required
            aria-invalid={err.agree ? true : undefined}
            aria-describedby={err.agree ? "agree-error" : undefined}
            className="mt-1 h-4 w-4 shrink-0 accent-[#aa7725]"
          />
          <span>{agreeLabel}</span>
        </label>
        <Error name="agree" />
      </fieldset>

      <fieldset>
        <legend className="field-label">Full Legal Name <span aria-hidden className="text-gold">*</span></legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="firstName" className="sr-only">First name</label>
            <input {...field("firstName")} type="text" placeholder="First Name" autoComplete="given-name" required maxLength={60} />
            <Error name="firstName" />
          </div>
          <div>
            <label htmlFor="middleName" className="sr-only">Middle name (optional)</label>
            <input {...field("middleName")} type="text" placeholder="Middle Name" autoComplete="additional-name" maxLength={60} />
          </div>
          <div>
            <label htmlFor="lastName" className="sr-only">Last name</label>
            <input {...field("lastName")} type="text" placeholder="Last Name" autoComplete="family-name" required maxLength={60} />
            <Error name="lastName" />
          </div>
        </div>
      </fieldset>

      <button type="submit" disabled={pending} className="btn-gold disabled:opacity-70">
        {pending ? <><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit"}
      </button>
    </form>
  );
}
