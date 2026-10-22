import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MapleLeafDecor } from "../Icons";

/** Inner-page hero: editorial heading on ivory. */
export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="border-b border-line/70 bg-ivory">
      <div className="container-x py-16 md:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.08] text-charcoal sm:text-5xl md:text-6xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

/** Renders admin-authored plain text: blank-line paragraphs, "## " headings, "- " bullets. No HTML is trusted. */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`prose-trace ${className}`}>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          const [head, ...rest] = block.split("\n");
          return (
            <div key={i}>
              <h2>{head.slice(3)}</h2>
              {rest.length > 0 && <RichText text={rest.join("\n")} />}
            </div>
          );
        }
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}
            </ul>
          );
        }
        return <p key={i}>{lines.join(" ")}</p>;
      })}
    </div>
  );
}

/** Full-width charcoal booking panel from the reference design. */
export function BookingCta({ eyebrow, heading, text, button }: { eyebrow: string; heading: string; text: string; button: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-charcoal text-white" aria-labelledby="cta-heading">
      <MapleLeafDecor className="pointer-events-none absolute -right-16 -top-10 -z-10 h-[130%] w-auto rotate-[18deg] text-[#5b4423] opacity-60 sm:-right-6" />
      <div className="container-x py-16 text-center md:py-20">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-champagne">{eyebrow}</p>
        <span aria-hidden className="mx-auto mt-3 block h-px w-10 bg-champagne" />
        <h2 id="cta-heading" className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">{heading}</h2>
        <p className="mt-3 text-white/85">{text}</p>
        <Link href="/booking" className="btn-gold mt-8">
          {button} <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function EmptyState({ icon, heading, text, action }: { icon: React.ReactNode; heading: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="card-line mx-auto max-w-2xl px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line text-gold">{icon}</div>
      <h2 className="mt-6 font-serif text-3xl text-charcoal">{heading}</h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">{text}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function LinkArrow({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`link-gold ${className}`}>
      {children} <ArrowRight aria-hidden className="h-3.5 w-3.5" />
    </Link>
  );
}
