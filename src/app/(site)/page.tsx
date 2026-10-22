import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Flag, Globe, HeartHandshake, Laptop, Plus, Quote, ShieldCheck, Users } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { ServiceIcon } from "@/components/Icons";
import { BookingCta, LinkArrow } from "@/components/site/blocks";
import { getPage, getServices, getTestimonials } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

/** Parses admin-edited "Title | Description" lines. */
function pairs(text: string) {
  return text
    .split("\n")
    .map((l) => l.split("|").map((s) => s.trim()))
    .filter(([title]) => title)
    .map(([title, ...rest]) => [title, rest.join(" | ")] as const);
}

export const generateMetadata = () => pageMetadata("home", "/");

export default async function HomePage() {
  const [{ fields: f }, services, testimonials] = await Promise.all([getPage("home"), getServices(), getTestimonials()]);
  const featured = (services.filter((s) => s.featured).length ? services.filter((s) => s.featured) : services).slice(0, 3);
  const more = services.filter((s) => !featured.includes(s));
  const complexService = services.find((s) => s.slug === "refusals-complex-matters");

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ivory" aria-labelledby="hero-heading">
        <div className="relative h-72 sm:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[64%]">
          <SafeImage
            src={f.heroImage}
            alt={f.heroImageAlt}
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 64vw, 100vw"
            className="object-cover object-[60%_center]"
          />
          {/* Ivory blend into the text column (desktop) and into the content below (mobile). */}
          <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-ivory via-ivory/60 via-25% to-transparent to-55% lg:block" />
          <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ivory/90 to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ivory to-transparent lg:hidden" />
        </div>

        <div className="container-x relative pb-14 lg:flex lg:min-h-[640px] lg:items-center lg:pb-20 lg:pt-28">
          <div className="max-w-xl">
            <p className="eyebrow !tracking-[0.3em]">{f.heroEyebrow}</p>
            <h1 id="hero-heading" className="mt-5 font-serif text-[2.75rem] leading-[1.02] text-charcoal sm:text-6xl lg:text-[4.1rem]">
              <span className="text-gold">{f.heroTitleAccent}</span> {f.heroTitleRest}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-snug text-ink sm:text-xl">{f.heroSubtitle}</p>
            <p className="mt-8 text-[0.95rem] text-ink">{f.heroPrompt}</p>
            <Link href="/booking" className="btn-gold mt-4">
              {f.heroCta} <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section aria-label="Why clients choose us" className="bg-cream">
        <ul className="container-x grid divide-y divide-line py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-7">
          {[
            { icon: Users, label: f.trust1 },
            { icon: Laptop, label: f.trust2 },
            { icon: Globe, label: f.trust3 },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center justify-center gap-4 py-5 sm:py-1">
              <Icon aria-hidden className="h-8 w-8 text-gold" strokeWidth={1} />
              <span className="text-[0.9rem] text-ink">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* SERVICES */}
      <section className="bg-ivory py-16 md:py-20" aria-labelledby="services-heading">
        <div className="container-x">
          <p className="eyebrow text-center">{f.servicesEyebrow}</p>
          <h2 id="services-heading" className="mt-4 text-center font-serif text-4xl leading-tight text-charcoal sm:text-5xl">
            {f.servicesHeading}
          </h2>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <li key={s.slug} className="card-line flex flex-col items-center px-7 py-10 text-center transition-colors hover:border-champagne">
                <ServiceIcon name={s.icon} className="h-12 w-12 text-gold" strokeWidth={1.1} />
                <h3 className="mt-5 font-serif text-[1.7rem] leading-tight text-charcoal">{s.title}</h3>
                <p className="mt-3 max-w-[16rem] leading-relaxed text-muted">{s.tagline}</p>
                <LinkArrow href={`/services/${s.slug}`} className="mt-auto pt-6 text-sm">
                  Explore Service<span className="sr-only">: {s.title}</span>
                </LinkArrow>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center">
            <LinkArrow href={complexService ? `/services/${complexService.slug}` : "/booking"} className="text-sm !font-normal !text-ink">
              {f.complexText}
            </LinkArrow>
          </p>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="grid bg-ivory lg:grid-cols-[54%_46%]" aria-labelledby="about-heading">
        <div className="relative min-h-72 sm:min-h-96 lg:min-h-[420px]">
          <SafeImage src={f.aboutImage} alt={f.aboutImageAlt} fill sizes="(min-width: 1024px) 54vw, 100vw" className="object-cover" />
        </div>
        <div className="flex items-center px-5 py-14 md:px-14 lg:py-16">
          <div className="max-w-md">
            <h2 id="about-heading" className="font-serif text-4xl leading-[1.1] text-charcoal sm:text-[2.8rem]">{f.aboutHeading}</h2>
            <p className="mt-5 leading-relaxed text-muted">{f.aboutBody}</p>
            <LinkArrow href="/about" className="mt-7 font-serif text-lg">{f.aboutLink}</LinkArrow>
          </div>
        </div>
      </section>

      {/* WHO WE HELP */}
      <section className="bg-cream py-16 md:py-20" aria-labelledby="who-heading">
        <div className="container-x">
          <p className="eyebrow text-center">{f.whoEyebrow}</p>
          <h2 id="who-heading" className="mt-4 text-center font-serif text-4xl leading-tight text-charcoal sm:text-5xl">{f.whoHeading}</h2>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pairs(f.whoItems).map(([title, desc], i) => {
              const Icon = [HeartHandshake, Briefcase, Flag, ShieldCheck][i % 4];
              return (
                <li key={title} className="card-line p-7">
                  <Icon aria-hidden className="h-9 w-9 text-gold" strokeWidth={1.1} />
                  <h3 className="mt-5 font-serif text-2xl text-charcoal">{title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{desc}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* MORE SERVICES */}
      {more.length > 0 && (
        <section className="bg-ivory py-14" aria-labelledby="more-heading">
          <div className="container-x">
            <h2 id="more-heading" className="text-center font-serif text-3xl text-charcoal">More ways we can help</h2>
            <ul className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
              {more.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="card-line group flex items-center gap-4 p-5 transition-colors hover:border-gold">
                    <ServiceIcon name={s.icon} className="h-8 w-8 shrink-0 text-gold" strokeWidth={1.2} />
                    <span className="flex-1">
                      <span className="block font-serif text-xl text-charcoal">{s.title}</span>
                      <span className="block text-sm text-muted">{s.tagline}</span>
                    </span>
                    <ArrowRight aria-hidden className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="bg-ivory py-16 md:py-20" aria-labelledby="process-heading">
        <div className="container-x">
          <p className="eyebrow text-center">{f.processEyebrow}</p>
          <h2 id="process-heading" className="mt-4 text-center font-serif text-4xl leading-tight text-charcoal sm:text-5xl">{f.processHeading}</h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pairs(f.processSteps).map(([title, desc], i) => (
              <li key={title} className="relative border-t border-gold pt-6">
                <span className="font-serif text-5xl leading-none text-champagne">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-serif text-2xl text-charcoal">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-12 text-center">
            <Link href="/booking" className="btn-gold">{f.heroCta} <ArrowRight aria-hidden className="h-4 w-4" /></Link>
          </p>
        </div>
      </section>

      {/* WHY US */}
      <section className="grid bg-cream lg:grid-cols-2" aria-labelledby="why-heading">
        <div className="flex items-center px-5 py-16 md:px-14 lg:order-1">
          <div className="max-w-xl">
            <p className="eyebrow">{f.whyEyebrow}</p>
            <h2 id="why-heading" className="mt-4 font-serif text-4xl leading-tight text-charcoal sm:text-5xl">{f.whyHeading}</h2>
            <ul className="mt-8 space-y-6">
              {pairs(f.whyItems).map(([title, desc]) => (
                <li key={title} className="flex gap-4">
                  <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                  <span>
                    <span className="block font-serif text-xl text-charcoal">{title}</span>
                    <span className="block leading-relaxed text-muted">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative min-h-72 sm:min-h-96 lg:order-2">
          <SafeImage src={f.whyImage} alt={f.whyImageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      {/* TESTIMONIALS (approved only) */}
      {testimonials.length > 0 && (
        <section className="bg-ivory py-16 md:py-20" aria-labelledby="t-heading">
          <div className="container-x">
            <h2 id="t-heading" className="text-center font-serif text-4xl text-charcoal">In our clients’ words</h2>
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <li key={t._id} className="card-line p-7">
                  <figure>
                    <Quote aria-hidden className="h-6 w-6 text-champagne" strokeWidth={1.2} />
                    <blockquote className="mt-3 font-serif text-lg leading-relaxed text-charcoal">{t.quote}</blockquote>
                    <figcaption className="mt-4 text-sm font-semibold text-ink">{t.clientName}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center"><LinkArrow href="/testimonials" className="text-sm">Read more testimonials</LinkArrow></p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-ivory py-16 md:py-20" aria-labelledby="faq-heading">
        <div className="container-x max-w-3xl">
          <h2 id="faq-heading" className="text-center font-serif text-4xl text-charcoal sm:text-5xl">{f.faqHeading}</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {pairs(f.faqItems).map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-xl text-charcoal [&::-webkit-details-marker]:hidden">
                  {q}
                  <Plus aria-hidden className="h-5 w-5 shrink-0 text-gold transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted">
            Have another question? <Link href="/contact" className="link-gold">Contact us</Link>
          </p>
        </div>
      </section>

      <BookingCta eyebrow={f.ctaEyebrow} heading={f.ctaHeading} text={f.ctaText} button={f.ctaButton} />
    </>
  );
}
