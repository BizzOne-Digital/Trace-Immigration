import Link from "next/link";
import { CalendarX } from "lucide-react";
import { EmptyState, PageHero } from "@/components/site/blocks";
import { getConsultationTypes, getPage, getServices } from "@/lib/content";
import { getAvailability } from "@/lib/booking";
import { pageMetadata } from "@/lib/seo";
import BookingFlow from "./BookingFlow";

export const dynamic = "force-dynamic";
export const generateMetadata = () => pageMetadata("booking", "/booking");

async function bookingOpen() {
  try {
    const av = await getAvailability();
    return av.acceptingBookings && av.weekly.length > 0;
  } catch {
    return false;
  }
}

export default async function BookingPage() {
  const [{ fields: f }, types, services, open, { fields: pricing }] = await Promise.all([
    getPage("booking"), getConsultationTypes(), getServices(), bookingOpen(), getPage("pricing"),
  ]);

  return (
    <>
      <PageHero eyebrow={f.heroEyebrow} title={f.heroTitle} intro={f.heroIntro} />
      <section className="container-x py-14 md:py-20">
        {!open || types.length === 0 ? (
          <EmptyState
            icon={<CalendarX aria-hidden className="h-6 w-6" strokeWidth={1.3} />}
            heading="Let’s find a time together"
            text={f.closedText}
            action={<Link href="/contact" className="btn-dark">Send an Inquiry</Link>}
          />
        ) : (
          <BookingFlow
            types={types.map((t) => ({ _id: t._id, name: t.name, description: t.description, durationMinutes: t.durationMinutes, priceLabel: t.priceLabel }))}
            services={services.map((s) => s.title)}
            confirmationText={f.confirmationText}
            paymentNote={f.paymentNote}
            noPriceText={pricing.noPriceText}
          />
        )}
      </section>
    </>
  );
}
