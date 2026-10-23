"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export type FeePlan = {
  _id: string;
  name: string;
  description: string;
  priceLabel: string;
  priceNote: string;
  features: string[];
  serviceSlug: string;
};

/** Tabbed fee list: one tab per published plan, matching the client's example layout. */
export default function FeeTabs({ plans, noPriceText }: { plans: FeePlan[]; noPriceText: string }) {
  const [active, setActive] = useState(0);
  const p = plans[active];

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Service fees" className="flex flex-wrap gap-2">
        {plans.map((x, i) => (
          <button
            key={x._id}
            id={`fee-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls="fee-panel"
            onClick={() => setActive(i)}
            className={`rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors ${
              i === active ? "border-charcoal bg-charcoal text-white" : "border-line bg-white text-ink hover:border-gold"
            }`}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div id="fee-panel" role="tabpanel" aria-labelledby={`fee-tab-${active}`} className="card-line mt-6 p-8 md:p-12">
        <h3 className="font-serif text-3xl text-charcoal">{p.name}</h3>
        {p.description && <p className="mt-3 max-w-3xl leading-relaxed text-muted">{p.description}</p>}
        {p.features.length > 0 && (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {p.features.map((x) => (
              <li key={x} className="flex gap-3 text-ink"><Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-gold" />{x}</li>
            ))}
          </ul>
        )}
        <div className="mt-10 border-t border-line pt-8">
          <p className="font-serif text-4xl text-gold-ink">{p.priceLabel.trim() || <span className="font-sans text-lg text-ink">{noPriceText}</span>}</p>
          {p.priceNote && <p className="mt-2 text-sm text-muted">{p.priceNote}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href="/booking" className="btn-gold">Start with a consultation <ArrowRight aria-hidden className="h-4 w-4" /></Link>
            {p.serviceSlug && (
              <Link href={`/services/${p.serviceSlug}`} className="link-gold text-sm">
                View service <ArrowRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
