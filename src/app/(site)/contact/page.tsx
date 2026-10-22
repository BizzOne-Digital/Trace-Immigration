import Link from "next/link";
import { CalendarDays, Laptop, Mail, Phone } from "lucide-react";
import { PageHero } from "@/components/site/blocks";
import { getPage, getServices, getSettings, telHref } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import ContactForm from "./ContactForm";

export const generateMetadata = () => pageMetadata("contact", "/contact");

export default async function ContactPage() {
  const [{ fields: f }, settings, services] = await Promise.all([getPage("contact"), getSettings(), getServices()]);

  return (
    <>
      <PageHero eyebrow={f.heroEyebrow} title={f.heroTitle} intro={f.heroIntro} />
      <section className="container-x grid gap-12 py-16 md:py-20 lg:grid-cols-[1fr_1.6fr]">
        <aside className="space-y-8">
          <div>
            <h2 className="eyebrow">Get in touch</h2>
            <ul className="mt-5 space-y-5">
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-start gap-4 text-ink hover:text-gold-ink">
                  <Mail aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
                  <span><span className="block text-sm text-muted">Email</span><span className="break-all">{settings.email}</span></span>
                </a>
              </li>
              <li>
                <a href={telHref(settings.phone)} className="flex items-start gap-4 text-ink hover:text-gold-ink">
                  <Phone aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
                  <span><span className="block text-sm text-muted">Phone</span>{settings.phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-4 text-ink">
                <Laptop aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
                <span><span className="block text-sm text-muted">Virtual service</span>{settings.virtualStatement}</span>
              </li>
            </ul>
          </div>
          <div className="card-line p-6">
            <CalendarDays aria-hidden className="h-6 w-6 text-gold" strokeWidth={1.3} />
            <p className="mt-3 font-serif text-2xl text-charcoal">Prefer to book directly?</p>
            <p className="mt-2 text-sm text-muted">Choose a consultation time that suits you.</p>
            <Link href="/booking" className="link-gold mt-4 text-sm">Book a Consultation</Link>
          </div>
        </aside>
        <div>
          <h2 className="font-serif text-3xl text-charcoal">{f.formHeading}</h2>
          <div className="mt-6">
            <ContactForm services={services.map((s) => s.title)} successText={f.successText} />
          </div>
        </div>
      </section>
    </>
  );
}
