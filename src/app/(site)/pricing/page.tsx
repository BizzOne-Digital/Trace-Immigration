import Link from "next/link";
import { ArrowRight, Check, Clock } from "lucide-react";
import { PageHero } from "@/components/site/blocks";
import { getConsultationTypes, getPage, getPricingPlans } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("pricing", "/pricing");

export default async function PricingPage() {
  const [{ fields: f }, plans, types] = await Promise.all([getPage("pricing"), getPricingPlans(), getConsultationTypes()]);
  const price = (label: string) => label.trim() || null;

  return (
    <>
      <PageHero eyebrow={f.heroEyebrow} title={f.heroTitle} intro={f.heroIntro} />

      {types.length > 0 && (
        <section className="container-x pt-16" aria-labelledby="consult-heading">
          <h2 id="consult-heading" className="font-serif text-3xl text-charcoal sm:text-4xl">Consultations</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {types.map((t) => (
              <li key={t._id} className="card-line flex flex-col p-8">
                <h3 className="font-serif text-2xl text-charcoal">{t.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <Clock aria-hidden className="h-4 w-4 text-gold" /> {t.durationMinutes} minutes · Virtual
                </p>
                {t.description && <p className="mt-4 leading-relaxed text-muted">{t.description}</p>}
                <p className="mt-6 font-serif text-3xl text-gold-ink">{price(t.priceLabel) ?? <span className="font-sans text-base text-ink">{f.noPriceText}</span>}</p>
                <Link href="/booking" className="link-gold mt-6 self-start text-sm">
                  Book this consultation <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container-x py-16" aria-labelledby="plans-heading">
        <h2 id="plans-heading" className="font-serif text-3xl text-charcoal sm:text-4xl">Professional services</h2>
        {plans.length === 0 ? (
          <div className="card-line mt-8 flex flex-col items-start gap-5 p-8 md:flex-row md:items-center md:justify-between">
            <p className="text-lg text-ink">{f.noPriceText}</p>
            <Link href="/contact" className="btn-dark">Contact us <ArrowRight aria-hidden className="h-4 w-4" /></Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <li key={p._id} className="card-line flex flex-col p-8">
                <h3 className="font-serif text-2xl text-charcoal">{p.name}</h3>
                {p.description && <p className="mt-3 leading-relaxed text-muted">{p.description}</p>}
                <p className="mt-6 font-serif text-3xl text-gold-ink">{price(p.priceLabel) ?? <span className="font-sans text-base text-ink">{f.noPriceText}</span>}</p>
                {p.priceNote && <p className="mt-1 text-sm text-muted">{p.priceNote}</p>}
                {p.features.length > 0 && (
                  <ul className="mt-6 space-y-3 border-t border-line pt-6">
                    {p.features.map((x) => (
                      <li key={x} className="flex gap-3 text-sm text-ink"><Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{x}</li>
                    ))}
                  </ul>
                )}
                <Link href={p.serviceSlug ? `/services/${p.serviceSlug}` : "/contact"} className="link-gold mt-auto self-start pt-8 text-sm">
                  {p.serviceSlug ? "View service" : "Ask about this service"} <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {f.note && <p className="mt-10 text-sm text-muted">{f.note}</p>}
      </section>
    </>
  );
}
