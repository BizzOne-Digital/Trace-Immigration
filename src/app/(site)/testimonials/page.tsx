import Link from "next/link";
import { Quote } from "lucide-react";
import { EmptyState, PageHero } from "@/components/site/blocks";
import { getPage, getTestimonials } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("testimonials", "/testimonials");

export default async function TestimonialsPage() {
  const [{ fields: f }, items] = await Promise.all([getPage("testimonials"), getTestimonials()]);

  return (
    <>
      <PageHero eyebrow={f.heroEyebrow} title={f.heroTitle} intro={f.heroIntro} />
      <section className="container-x py-16 md:py-20" aria-label="Testimonials">
        {items.length === 0 ? (
          <EmptyState
            icon={<Quote aria-hidden className="h-6 w-6" strokeWidth={1.3} />}
            heading={f.emptyHeading}
            text={f.emptyText}
            action={<Link href="/booking" className="btn-dark">Book a Consultation</Link>}
          />
        ) : (
          <ul className="columns-1 gap-6 md:columns-2 lg:columns-3">
            {items.map((t) => (
              <li key={t._id} className="card-line mb-6 break-inside-avoid p-8">
                <figure>
                  <Quote aria-hidden className="h-7 w-7 text-champagne" strokeWidth={1.2} />
                  <blockquote className="mt-4 font-serif text-xl leading-relaxed text-charcoal">{t.quote}</blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-semibold text-ink">{t.clientName}</span>
                    {t.context && <span className="block text-muted">{t.context}</span>}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
