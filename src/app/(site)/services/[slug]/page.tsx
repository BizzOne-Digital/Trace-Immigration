import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { ServiceIcon } from "@/components/Icons";
import { BookingCta, JsonLd, LinkArrow, RichText } from "@/components/site/blocks";
import { getPage, getService, getServices, getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return { title: "Service not found", robots: { index: false } };
  const title = s.metaTitle || `${s.title} | Trace Immigration`;
  const description = s.metaDescription || s.summary;
  return {
    title,
    description,
    alternates: { canonical: siteUrl(`/services/${s.slug}`) },
    openGraph: { title, description, url: siteUrl(`/services/${s.slug}`), images: s.image ? [{ url: s.image }] : undefined },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [service, all, { fields: home }, settings] = await Promise.all([getService(slug), getServices(), getPage("home"), getSettings()]);
  if (!service) notFound();
  const others = all.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <section className="border-b border-line/70 bg-ivory">
        <div className="container-x grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Link href="/services" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold-ink">
              <ArrowLeft aria-hidden className="h-4 w-4" /> All services
            </Link>
            <ServiceIcon name={service.icon} className="mt-8 h-12 w-12 text-gold" strokeWidth={1.1} />
            <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-charcoal sm:text-5xl md:text-6xl">{service.title}</h1>
            <p className="mt-4 font-serif text-2xl italic text-gold-ink">{service.tagline}</p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{service.summary}</p>
            <Link href="/booking" className="btn-gold mt-8">
              Book a Consultation <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-cream">
            <SafeImage src={service.image} alt={service.imageAlt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="container-x grid gap-12 py-16 md:py-20 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="font-serif text-3xl text-charcoal sm:text-4xl">Overview</h2>
          <RichText text={service.body} className="mt-5 text-lg" />
        </div>
        {service.scope.length > 0 && (
          <aside className="card-line h-fit p-8" aria-labelledby="scope-heading">
            <h2 id="scope-heading" className="eyebrow">How we can help</h2>
            <ul className="mt-5 space-y-4">
              {service.scope.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-ink">
                  <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </section>

      {service.process.length > 0 && (
        <section className="bg-cream py-16 md:py-20" aria-labelledby="process-heading">
          <div className="container-x">
            <p className="eyebrow text-center">The process</p>
            <h2 id="process-heading" className="mt-4 text-center font-serif text-4xl text-charcoal">A considered, step-by-step approach</h2>
            <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.process.map((step, i) => (
                <li key={step.title} className="card-line p-7">
                  <span className="font-serif text-3xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-serif text-2xl text-charcoal">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-center text-sm text-muted">{settings.virtualStatement}</p>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="container-x py-16" aria-labelledby="other-heading">
          <h2 id="other-heading" className="font-serif text-3xl text-charcoal">Other services</h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug} className="card-line p-7">
                <ServiceIcon name={s.icon} className="h-8 w-8 text-gold" strokeWidth={1.2} />
                <h3 className="mt-4 font-serif text-2xl text-charcoal">{s.title}</h3>
                <p className="mt-2 text-muted">{s.tagline}</p>
                <LinkArrow href={`/services/${s.slug}`} className="mt-5 text-sm">
                  Explore Service<span className="sr-only">: {s.title}</span>
                </LinkArrow>
              </li>
            ))}
          </ul>
        </section>
      )}

      <BookingCta eyebrow={home.ctaEyebrow} heading={home.ctaHeading} text={home.ctaText} button={home.ctaButton} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.summary,
          url: siteUrl(`/services/${service.slug}`),
          provider: { "@type": "ProfessionalService", name: settings.businessName, url: siteUrl() },
        }}
      />
    </>
  );
}
