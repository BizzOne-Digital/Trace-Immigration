import Link from "next/link";
import { PageHero, RichText } from "@/components/site/blocks";
import { getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import AgreementForm from "./AgreementForm";

export const generateMetadata = () => pageMetadata("agreement", "/initial-consultation-agreement");

export default async function InitialConsultationAgreementPage() {
  const { fields: f } = await getPage("agreement");

  return (
    <>
      <PageHero eyebrow="Trace Immigration" title={f.title} />
      <section className="container-x max-w-4xl py-14 md:py-20">
        <RichText text={f.body} />
        <p className="text-sm text-muted">
          Read our <Link href="/privacy" className="link-gold">Privacy Policy</Link> and{" "}
          <Link href="/terms" className="link-gold">Terms &amp; Conditions</Link>.
        </p>
        <div className="mt-12">
          <AgreementForm agreeLabel={f.agreeLabel} successText={f.successText} />
        </div>
      </section>
    </>
  );
}
