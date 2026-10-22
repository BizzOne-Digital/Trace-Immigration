"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { signAgreement, type SignState } from "./actions";

type Props = { token: string; templateId: string; templateVersion: number; defaults: { name: string; email: string; phone: string } };

export default function SignForm({ token, templateId, templateVersion, defaults }: Props) {
  const [state, action, pending] = useActionState<SignState, FormData>(signAgreement, { ok: false });
  const [signature, setSignature] = useState("");
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div role="status" className="card-line px-6 py-12 text-center">
        <CheckCircle2 aria-hidden className="mx-auto h-12 w-12 text-gold" strokeWidth={1.2} />
        <h2 className="mt-5 font-serif text-3xl text-charcoal">Thank you — your agreement is signed.</h2>
        <p className="mt-3 text-muted">
          Signed {state.signedAt ? new Date(state.signedAt).toLocaleString("en-CA", { dateStyle: "long", timeStyle: "short" }) : ""}. A copy has been securely recorded for the firm.
        </p>
      </div>
    );
  }

  const err = (k: string) => (fe[k] ? <p id={`${k}-err`} className="mt-1.5 text-sm text-[#b42318]">{fe[k]}</p> : null);
  const aria = (k: string) => ({ "aria-invalid": fe[k] ? true : undefined, "aria-describedby": fe[k] ? `${k}-err` : undefined });

  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="templateId" value={templateId} />
      <input type="hidden" name="templateVersion" value={templateVersion} />

      {state.error && <p role="alert" className="border border-[#f2c6c2] bg-[#fdf3f2] px-4 py-3 text-sm text-[#8a1c12]">{state.error}</p>}

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-serif text-2xl text-charcoal">Client details</legend>
        <div className="sm:col-span-2">
          <label htmlFor="clientFullName" className="field-label">Full legal name *</label>
          <input id="clientFullName" name="clientFullName" className="field" defaultValue={defaults.name} autoComplete="name" required maxLength={160} {...aria("clientFullName")} />
          {err("clientFullName")}
        </div>
        <div>
          <label htmlFor="clientEmail" className="field-label">Email *</label>
          <input id="clientEmail" name="clientEmail" type="email" className="field" defaultValue={defaults.email} autoComplete="email" required maxLength={200} {...aria("clientEmail")} />
          {err("clientEmail")}
        </div>
        <div>
          <label htmlFor="clientPhone" className="field-label">Phone</label>
          <input id="clientPhone" name="clientPhone" type="tel" className="field" defaultValue={defaults.phone} autoComplete="tel" maxLength={40} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="clientAddress" className="field-label">Mailing address</label>
          <textarea id="clientAddress" name="clientAddress" rows={2} className="field" autoComplete="street-address" maxLength={400} />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-serif text-2xl text-charcoal">Electronic signature</legend>
        <label htmlFor="signatureName" className="field-label">Type your full legal name to sign *</label>
        <input
          id="signatureName"
          name="signatureName"
          className="field"
          required
          maxLength={160}
          autoComplete="off"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          {...aria("signatureName")}
        />
        {err("signatureName")}
        <div aria-hidden className="mt-4 flex min-h-20 items-end border-b border-charcoal/40 bg-white px-4 pb-2">
          <span className="font-serif text-4xl italic text-charcoal">{signature || " "}</span>
        </div>
        <p className="mt-2 text-xs text-muted">Your typed name serves as your electronic signature.</p>
      </fieldset>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-ink">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-[#8c601d]" {...aria("consent")} />
        <span>I have read and understood this agreement, I agree to its terms, and I consent to signing it electronically. I understand my electronic signature has the same effect as a handwritten signature.</span>
      </label>
      {err("consent")}

      <button type="submit" disabled={pending} className="btn-gold disabled:opacity-60">
        {pending ? <><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Submitting…</> : "Sign Agreement"}
      </button>
    </form>
  );
}
