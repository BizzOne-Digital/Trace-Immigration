import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageHero } from "@/components/site/blocks";
import { getConsultationTypes, getPage, getPricingPlans } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import FeeTabs from "./FeeTabs";

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
          <p className="mt-3 max-w-3xl text-muted">Trace Immigration is 100% virtual. Book an appointment with trusted, licensed Canadian immigration experts from the comfort of your home.</p>
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
        <h2 id="plans-heading" className="font-serif text-3xl text-charcoal sm:text-4xl">Application fees</h2>
        {plans.length === 0 ? (
          <div className="card-line mt-8 flex flex-col items-start gap-5 p-8 md:flex-row md:items-center md:justify-between">
            <p className="text-lg text-ink">{f.noPriceText}</p>
            <Link href="/contact" className="btn-dark">Contact us <ArrowRight aria-hidden className="h-4 w-4" /></Link>
          </div>
        ) : (
          <FeeTabs plans={plans} noPriceText={f.noPriceText} />
        )}
        {f.note && <p className="mt-10 text-sm text-muted">{f.note}</p>}
      </section>
    </>
  );
}
