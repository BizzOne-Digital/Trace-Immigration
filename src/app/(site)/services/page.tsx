import { ArrowUpRight } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { ServiceIcon } from "@/components/Icons";
import { BookingCta, PageHero, RichText } from "@/components/site/blocks";
import { getPage, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { BOOKING_URL } from "@/lib/site";

export const generateMetadata = () => pageMetadata("services", "/services");

/** Refusals and complex matters have their own section below instead of a card. */
const COMPLEX_SLUG = "refusals-complex-matters";

export default async function ServicesPage() {
  const [{ fields: f }, { fields: home }, all] = await Promise.all([getPage("services"), getPage("home"), getServices()]);
  const services = all.filter((s) => s.slug !== COMPLEX_SLUG);

  return (
    <>
      <PageHero eyebrow={f.heroEyebrow} intro={f.heroIntro} />

      <section className="container-x py-16 md:py-20" aria-label="Services">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug} className="card-line flex flex-col overflow-hidden">
              <div className="relative aspect-[16/10] bg-cream">
                <SafeImage src={s.image} alt={s.imageAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <ServiceIcon name={s.icon} className="h-9 w-9 text-gold" strokeWidth={1.2} />
                <h2 className="mt-4 font-serif text-[1.7rem] leading-tight text-charcoal">{s.title}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{s.summary}</p>
              </div>
            </li>
          ))}
        </ul>
        {services.length === 0 && <p className="text-center text-muted">Service information is being updated. Please contact us for details.</p>}
      </section>

      <section className="container-x pb-16 md:pb-24" aria-labelledby="complex-heading">
        <div className="rounded-md bg-charcoal px-7 py-10 text-white md:px-14 md:py-14">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-champagne">{f.complexEyebrow}</p>
          <h2 id="complex-heading" className="mt-4 scroll-mt-32 font-serif text-3xl leading-tight sm:text-4xl">{f.complexHeading}</h2>
          <RichText text={f.complexBody} className="mt-5 max-w-3xl text-white/85 [&_p]:text-white/85" />
          <a href={BOOKING_URL} className="btn-gold mt-8">
            {f.complexButton} <ArrowUpRight aria-hidden className="h-4 w-4" />
          </a>
        </div>
      </section>

      <BookingCta eyebrow={home.ctaEyebrow} heading={home.ctaHeading} text={home.ctaText} button={home.ctaButton} />
    </>
  );
}
