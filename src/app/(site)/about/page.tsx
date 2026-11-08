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
      <PageHero eyebrow={f.heroEyebrow} title={f.heroTitle} intro={f.heroIntro}>
        <RichText text={f.heroBody} className="mt-6 max-w-3xl text-muted" />
      </PageHero>

      <section className="bg-cream py-16 md:py-24" aria-labelledby="founder-heading">
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_1.2fr] lg:gap-16">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md self-start overflow-hidden rounded-sm lg:sticky lg:top-32">
            <SafeImage src={f.founderImage} alt={f.founderImageAlt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">{f.founderEyebrow}</p>
            <h2 id="founder-heading" className="mt-4 font-serif text-4xl text-charcoal sm:text-5xl">{f.founderName}</h2>
            <p className="mt-2 text-sm font-medium text-gold-ink">{f.founderRole}</p>
            <h3 className="mt-8 font-serif text-2xl text-charcoal sm:text-3xl">{f.founderHeading}</h3>
            <RichText text={f.founderBody} className="mt-5" />
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="story-heading">
        <h2 id="story-heading" className="font-serif text-4xl leading-tight text-charcoal sm:text-5xl">{f.storyHeading}</h2>
        <RichText text={f.storyBody} className="text-lg" />
      </section>

      <section className="bg-cream py-16 md:py-24" aria-labelledby="values-heading">
        <div className="container-x">
          <p className="eyebrow text-center">{f.valuesEyebrow}</p>
          <h2 id="values-heading" className="mt-4 text-center font-serif text-4xl text-charcoal sm:text-5xl">{f.valuesHeading}</h2>
          {f.valuesIntro && <p className="mx-auto mt-5 max-w-3xl text-center leading-relaxed text-muted">{f.valuesIntro}</p>}
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

      <BookingCta eyebrow={home.ctaEyebrow} heading={home.ctaHeading} text={home.ctaText} button={home.ctaButton} />
    </>
  );
}
