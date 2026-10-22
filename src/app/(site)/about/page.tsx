import SafeImage from "@/components/SafeImage";
import { BookingCta, PageHero, RichText } from "@/components/site/blocks";
import { getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("about", "/about");

export default async function AboutPage() {
  const [{ fields: f }, { fields: home }] = await Promise.all([getPage("about"), getPage("home")]);
  const values = f.values
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter(([title]) => title);

  return (
    <>
      <PageHero eyebrow={f.heroEyebrow} title={f.heroTitle} intro={f.heroIntro} />

      <section className="relative h-64 sm:h-96" aria-hidden={!f.heroImageAlt}>
        <SafeImage src={f.heroImage} alt={f.heroImageAlt} fill sizes="100vw" className="object-cover" />
      </section>

      <section className="container-x grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="story-heading">
        <h2 id="story-heading" className="font-serif text-4xl leading-tight text-charcoal sm:text-5xl">{f.storyHeading}</h2>
        <RichText text={f.storyBody} className="text-lg" />
      </section>

      <section className="bg-cream py-16 md:py-24" aria-labelledby="values-heading">
        <div className="container-x">
          <h2 id="values-heading" className="text-center font-serif text-4xl text-charcoal sm:text-5xl">{f.valuesHeading}</h2>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(([title, desc]) => (
              <li key={title} className="card-line p-8">
                <span aria-hidden className="block h-px w-10 bg-gold" />
                <h3 className="mt-5 font-serif text-2xl text-charcoal">{title}</h3>
                {desc && <p className="mt-2 leading-relaxed text-muted">{desc}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid lg:grid-cols-2" aria-labelledby="virtual-heading">
        <div className="flex items-center px-5 py-16 md:px-14 lg:order-2">
          <div className="max-w-lg">
            <p className="eyebrow">How we work</p>
            <h2 id="virtual-heading" className="mt-4 font-serif text-4xl text-charcoal sm:text-5xl">{f.virtualHeading}</h2>
            <RichText text={f.virtualBody} className="mt-6" />
          </div>
        </div>
        <div className="relative min-h-72 sm:min-h-96 lg:order-1">
          <SafeImage src={f.virtualImage} alt={f.virtualImageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <BookingCta eyebrow={home.ctaEyebrow} heading={home.ctaHeading} text={home.ctaText} button={home.ctaButton} />
    </>
  );
}
