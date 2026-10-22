"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, Clock, FileSignature, Globe, Loader2 } from "lucide-react";
import { submitBooking, type BookingResult } from "./actions";

type Type = { _id: string; name: string; description: string; durationMinutes: number; priceLabel: string };
type Slot = { startUtc: string; label: string };
type SlotData = { timezone: string; days: Record<string, Slot[]> };

function tzName(tz: string) {
  try {
    const part = new Intl.DateTimeFormat("en-CA", { timeZone: tz, timeZoneName: "long" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName");
    return part?.value ?? tz;
  } catch {
    return tz;
  }
}

export default function BookingFlow({
  types, services, confirmationText, paymentNote, noPriceText,
}: { types: Type[]; services: string[]; confirmationText: string; paymentNote: string; noPriceText: string }) {
  const [typeId, setTypeId] = useState(types.length === 1 ? types[0]._id : "");
  const [data, setData] = useState<SlotData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [clientTz, setClientTz] = useState("");
  const [result, setResult] = useState<BookingResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [reload, setReload] = useState(0);

  useEffect(() => setClientTz(Intl.DateTimeFormat().resolvedOptions().timeZone || ""), []);

  useEffect(() => {
    if (!typeId) return;
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    fetch(`/api/booking/slots?type=${encodeURIComponent(typeId)}`, { cache: "no-store" })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "Unable to load availability.");
        return json as SlotData;
      })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setDate((cur) => (cur && d.days[cur] ? cur : Object.keys(d.days)[0] ?? ""));
        setSlot("");
      })
      .catch((e: Error) => !cancelled && setLoadError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [typeId, reload]);

  const dates = useMemo(() => Object.keys(data?.days ?? {}), [data]);
  const showLocal = Boolean(clientTz && data && clientTz !== data.timezone);
  const localTime = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: clientTz, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  const dateLabel = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 12));
    return {
      weekday: new Intl.DateTimeFormat("en-CA", { weekday: "short", timeZone: "UTC" }).format(dt),
      day: new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", timeZone: "UTC" }).format(dt),
      full: new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(dt),
    };
  };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("consultationTypeId", typeId);
    fd.set("startUtc", slot);
    fd.set("clientTimezone", clientTz);
    startTransition(async () => {
      const res = await submitBooking(fd);
      setResult(res);
      if (!res.ok && res.slotTaken) {
        setSlot("");
        setReload((n) => n + 1);
      }
      if (res.ok) window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (result?.ok) {
    return (
      <div role="status" className="card-line mx-auto max-w-2xl px-6 py-12 text-center sm:px-12">
        <CheckCircle2 aria-hidden className="mx-auto h-12 w-12 text-gold" strokeWidth={1.2} />
        <h2 className="mt-5 font-serif text-4xl text-charcoal">Request received</h2>
        <p className="mt-3 text-muted">{confirmationText}</p>
        <dl className="mx-auto mt-8 grid max-w-md gap-3 text-left text-sm">
          <div className="flex justify-between gap-4 border-b border-line pb-3"><dt className="text-muted">Reference</dt><dd className="font-semibold">{result.reference}</dd></div>
          <div className="flex justify-between gap-4 border-b border-line pb-3"><dt className="text-muted">Requested time</dt><dd className="text-right">{result.firmTime}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted">Status</dt><dd>Pending confirmation</dd></div>
        </dl>
        {!result.emailSent && (
          <p className="mt-6 text-sm text-muted">Please keep your reference number. We will contact you using the details you provided.</p>
        )}
        {result.agreementUrl && (
          <div className="mt-8 border-t border-line pt-8">
            <FileSignature aria-hidden className="mx-auto h-8 w-8 text-gold" strokeWidth={1.2} />
            <p className="mt-3 text-sm text-muted">Please review and sign the Initial Consultation Agreement before your consultation.</p>
            <Link href={result.agreementUrl} className="btn-dark mt-4">Review &amp; sign agreement</Link>
          </div>
        )}
        <p className="mt-8 text-xs text-muted">{paymentNote}</p>
      </div>
    );
  }

  const fe = (!result?.ok && result?.fieldErrors) || {};

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1.5fr_1fr]" noValidate>
      <div className="space-y-10">
        {/* Step 1 */}
        <fieldset>
          <legend className="font-serif text-2xl text-charcoal"><span className="text-gold">1.</span> Choose a consultation</legend>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {types.map((t) => (
              <label key={t._id} className={`card-line cursor-pointer p-5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${typeId === t._id ? "!border-gold bg-cream" : "hover:border-champagne"}`}>
                <input type="radio" name="type" value={t._id} checked={typeId === t._id} onChange={() => { setTypeId(t._id); setDate(""); setSlot(""); }} className="sr-only" />
                <span className="block font-serif text-xl text-charcoal">{t.name}</span>
                <span className="mt-1 flex items-center gap-2 text-sm text-muted"><Clock aria-hidden className="h-4 w-4 text-gold" />{t.durationMinutes} minutes · Virtual</span>
                {t.description && <span className="mt-2 block text-sm text-muted">{t.description}</span>}
                <span className="mt-3 block text-sm font-medium text-gold-ink">{t.priceLabel || noPriceText}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Step 2 */}
        {typeId && (
          <fieldset aria-busy={loading}>
            <legend className="font-serif text-2xl text-charcoal"><span className="text-gold">2.</span> Choose a date and time</legend>
            {data && (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
                <Globe aria-hidden className="h-4 w-4 text-gold" />
                Times shown in <strong className="font-semibold text-ink">{tzName(data.timezone)}</strong>
                {showLocal && <> · your local time ({tzName(clientTz)}) shown beneath</>}
              </p>
            )}
            {loading && <p className="mt-5 flex items-center gap-2 text-sm text-muted"><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Loading availability…</p>}
            {loadError && (
              <p role="alert" className="mt-5 text-sm text-[#8a1c12]">
                {loadError} <button type="button" className="underline" onClick={() => setReload((n) => n + 1)}>Try again</button>
              </p>
            )}
            {!loading && !loadError && data && dates.length === 0 && (
              <p className="mt-5 text-muted">There are no open times in the booking window right now. Please <Link href="/contact" className="link-gold">send us an inquiry</Link> and we will arrange a time with you.</p>
            )}
            {!loading && dates.length > 0 && (
              <>
                <div role="radiogroup" aria-label="Available dates" className="mt-5 flex gap-3 overflow-x-auto pb-2">
                  {dates.map((d) => {
                    const l = dateLabel(d);
                    const active = d === date;
                    return (
                      <button
                        key={d}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={l.full}
                        onClick={() => { setDate(d); setSlot(""); }}
                        className={`flex w-20 shrink-0 flex-col items-center border px-2 py-3 text-sm transition-colors ${active ? "border-gold bg-charcoal text-white" : "border-line bg-white text-ink hover:border-gold"}`}
                      >
                        <span className={active ? "text-champagne" : "text-muted"}>{l.weekday}</span>
                        <span className="mt-1 font-medium">{l.day}</span>
                      </button>
                    );
                  })}
                </div>
                {date && (
                  <div role="radiogroup" aria-label={`Available times on ${dateLabel(date).full}`} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {data!.days[date]?.map((s) => {
                      const active = s.startUtc === slot;
                      return (
                        <button
                          key={s.startUtc}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSlot(s.startUtc)}
                          className={`border px-3 py-3 text-center text-sm transition-colors ${active ? "border-gold bg-charcoal text-white" : "border-line bg-white hover:border-gold"}`}
                        >
                          <span className="block font-medium">{s.label}</span>
                          {showLocal && <span className={`block text-xs ${active ? "text-champagne" : "text-muted"}`}>{localTime(s.startUtc)} your time</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </fieldset>
        )}

        {/* Step 3 */}
        {slot && (
          <fieldset className="space-y-5">
            <legend className="font-serif text-2xl text-charcoal"><span className="text-gold">3.</span> Your details</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="b-name" className="field-label">Full name *</label>
                <input id="b-name" name="name" className="field" autoComplete="name" required maxLength={120} aria-invalid={fe.name ? true : undefined} aria-describedby={fe.name ? "b-name-err" : undefined} />
                {fe.name && <p id="b-name-err" className="mt-1.5 text-sm text-[#b42318]">{fe.name}</p>}
              </div>
              <div>
                <label htmlFor="b-email" className="field-label">Email *</label>
                <input id="b-email" name="email" type="email" className="field" autoComplete="email" required maxLength={200} aria-invalid={fe.email ? true : undefined} aria-describedby={fe.email ? "b-email-err" : undefined} />
                {fe.email && <p id="b-email-err" className="mt-1.5 text-sm text-[#b42318]">{fe.email}</p>}
              </div>
              <div>
                <label htmlFor="b-phone" className="field-label">Phone</label>
                <input id="b-phone" name="phone" type="tel" className="field" autoComplete="tel" maxLength={40} aria-invalid={fe.phone ? true : undefined} />
                {fe.phone && <p className="mt-1.5 text-sm text-[#b42318]">{fe.phone}</p>}
              </div>
              <div>
                <label htmlFor="b-service" className="field-label">Service of interest</label>
                <select id="b-service" name="service" className="field">
                  <option value="">Select a service</option>
                  {services.map((s) => <option key={s}>{s}</option>)}
                  <option>Other / not sure</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="b-notes" className="field-label">Anything we should know beforehand?</label>
              <textarea id="b-notes" name="notes" rows={4} className="field" maxLength={2000} />
              <p className="mt-1.5 text-xs text-muted">Please do not include passport numbers or other sensitive identifiers.</p>
            </div>
            <label className="flex items-start gap-3 text-sm text-ink">
              <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[#8c601d]" required aria-invalid={fe.consent ? true : undefined} />
              <span>I agree to be contacted about this booking and have read the <Link href="/privacy" className="underline hover:text-gold-ink">privacy policy</Link>.</span>
            </label>
            {fe.consent && <p className="text-sm text-[#b42318]">{fe.consent}</p>}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <input name="company" tabIndex={-1} autoComplete="off" />
            </div>
          </fieldset>
        )}
      </div>

      {/* Summary */}
      <aside className="h-fit lg:sticky lg:top-28">
        <div className="card-line p-7">
          <h2 className="eyebrow">Your booking</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-muted">Consultation</dt><dd className="mt-0.5 font-medium text-ink">{types.find((t) => t._id === typeId)?.name ?? "—"}</dd></div>
            <div><dt className="text-muted">Date</dt><dd className="mt-0.5 font-medium text-ink">{date ? dateLabel(date).full : "—"}</dd></div>
            <div>
              <dt className="text-muted">Time</dt>
              <dd className="mt-0.5 font-medium text-ink">
                {slot && data ? `${data.days[date]?.find((s) => s.startUtc === slot)?.label} (${tzName(data.timezone)})` : "—"}
                {slot && showLocal && <span className="block text-xs font-normal text-muted">{localTime(slot)} your time</span>}
              </dd>
            </div>
            <div><dt className="text-muted">Format</dt><dd className="mt-0.5 font-medium text-ink">Virtual consultation</dd></div>
          </dl>
          {result && !result.ok && <p role="alert" className="mt-5 border border-[#f2c6c2] bg-[#fdf3f2] px-3 py-2 text-sm text-[#8a1c12]">{result.error}</p>}
          <button type="submit" disabled={!slot || pending} className="btn-gold mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50">
            {pending ? <><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Booking…</> : <><CalendarCheck aria-hidden className="h-4 w-4" /> Request Booking</>}
          </button>
          <p className="mt-4 text-xs leading-relaxed text-muted">{paymentNote}</p>
        </div>
      </aside>
    </form>
  );
}
