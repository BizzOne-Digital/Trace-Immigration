import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { ServiceIcon } from "@/components/Icons";
import { BookingCta, LinkArrow, PageHero } from "@/components/site/blocks";
import { getPage, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("services", "/services");

export default async function ServicesPage() {
  const [{ fields: f }, { fields: home }, services] = await Promise.all([getPage("services"), getPage("home"), getServices()]);

  return (
    <>
      <PageHero eyebrow={f.heroEyebrow} title={f.heroTitle} intro={f.heroIntro} />

      <section className="container-x py-16 md:py-20" aria-label="Services">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug} className="card-line group flex flex-col overflow-hidden">
              <div className="relative aspect-[16/10] bg-cream">
                <SafeImage src={s.image} alt={s.imageAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <ServiceIcon name={s.icon} className="h-9 w-9 text-gold" strokeWidth={1.2} />
                <h2 className="mt-4 font-serif text-[1.7rem] leading-tight text-charcoal">{s.title}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{s.summary}</p>
                <LinkArrow href={`/services/${s.slug}`} className="mt-6 self-start text-sm">
                  Explore Service<span className="sr-only">: {s.title}</span>
                </LinkArrow>
              </div>
            </li>
          ))}
        </ul>
        {services.length === 0 && <p className="text-center text-muted">Service information is being updated. Please contact us for details.</p>}
      </section>

      <section className="border-y border-line bg-cream" aria-labelledby="complex-heading">
        <div className="container-x flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 id="complex-heading" className="font-serif text-3xl text-charcoal sm:text-4xl">{f.complexHeading}</h2>
            <p className="mt-3 leading-relaxed text-muted">{f.complexBody}</p>
          </div>
          <Link href="/booking" className="btn-dark shrink-0">
            Book a Consultation <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <BookingCta eyebrow={home.ctaEyebrow} heading={home.ctaHeading} text={home.ctaText} button={home.ctaButton} />
    </>
  );
}
