import Link from "next/link";
import { UserRound } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { EmptyState, PageHero, RichText } from "@/components/site/blocks";
import { getPage, getTeam } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("team", "/team");

export default async function TeamPage() {
  const [{ fields: f }, team] = await Promise.all([getPage("team"), getTeam()]);

  return (
    <>
      <PageHero eyebrow={f.heroEyebrow} title={f.heroTitle} intro={f.heroIntro} />
      <section className="container-x py-16 md:py-20" aria-label="Team members">
        {team.length === 0 ? (
          <EmptyState
            icon={<UserRound aria-hidden className="h-6 w-6" strokeWidth={1.3} />}
            heading="Meet us in a consultation"
            text={f.emptyText}
            action={<Link href="/booking" className="btn-dark">Book a Consultation</Link>}
          />
        ) : (
          <ul className="grid gap-10 md:grid-cols-2">
            {team.map((m) => (
              <li key={m._id} className="card-line grid gap-6 p-6 sm:grid-cols-[180px_1fr] sm:p-8">
                <div className="relative aspect-[4/5] w-full max-w-[220px] overflow-hidden bg-cream">
                  {m.portrait ? (
                    <SafeImage src={m.portrait} alt={m.portraitAlt || `Portrait of ${m.name}`} fill sizes="220px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gold" aria-hidden>
                      <UserRound className="h-12 w-12" strokeWidth={1} />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-serif text-3xl text-charcoal">{m.name}</h2>
                  {m.role && <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-gold-ink">{m.role}</p>}
                  {m.credentials && <p className="mt-2 text-sm text-muted">{m.credentials}</p>}
                  {m.bio && <RichText text={m.bio} className="mt-4 text-[0.95rem]" />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
