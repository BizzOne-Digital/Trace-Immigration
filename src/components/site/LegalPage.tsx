import { RichText } from "./blocks";
import { getPage } from "@/lib/content";

export default async function LegalPage({ pageKey }: { pageKey: "privacy" | "terms" }) {
  const { fields: f } = await getPage(pageKey);
  return (
    <article className="container-x max-w-3xl py-16 md:py-24">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 font-serif text-5xl text-charcoal">{f.title}</h1>
      {f.updated && <p className="mt-3 text-sm text-muted">Last updated: {f.updated}</p>}
      <RichText text={f.body} className="mt-10" />
    </article>
  );
}
