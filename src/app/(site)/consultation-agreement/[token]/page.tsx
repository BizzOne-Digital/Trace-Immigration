import type { Metadata } from "next";
import { CheckCircle2, FileClock, Link2Off } from "lucide-react";
import { EmptyState } from "@/components/site/blocks";
import { connectDB } from "@/lib/db";
import { AgreementTemplate, Booking, SignedAgreement } from "@/lib/models";
import { formatInZone, hashToken } from "@/lib/booking";
import SignForm from "./SignForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Initial Consultation Agreement | Trace Immigration",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

type Props = { params: Promise<{ token: string }> };

async function load(token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  await connectDB();
  const booking = await Booking.findOne({ agreementTokenHash: hashToken(token) }).lean();
  if (!booking) return null;
  const [signed, template] = await Promise.all([
    SignedAgreement.findOne({ booking: booking._id }).select("signedAt templateVersion").lean(),
    AgreementTemplate.findOne({ status: "active" }).lean(),
  ]);
  return { booking, signed, template };
}

export default async function AgreementPage({ params }: Props) {
  const { token } = await params;
  let data: Awaited<ReturnType<typeof load>> = null;
  try {
    data = await load(token);
  } catch (err) {
    console.error("Agreement page failed:", (err as Error).message);
  }

  return (
    <section className="container-x max-w-4xl py-14 md:py-20">
      <p className="eyebrow">Private document</p>
      <h1 className="mt-4 font-serif text-4xl text-charcoal sm:text-5xl">Initial Consultation Agreement</h1>

      <div className="mt-10">
        {!data || data.booking.status === "cancelled" ? (
          <EmptyState
            icon={<Link2Off aria-hidden className="h-6 w-6" strokeWidth={1.3} />}
            heading="This link is not valid"
            text="The agreement link may have expired or been replaced. Please contact us and we will send you a new link."
          />
        ) : data.signed ? (
          <EmptyState
            icon={<CheckCircle2 aria-hidden className="h-6 w-6" strokeWidth={1.3} />}
            heading="Agreement signed"
            text={`This agreement was signed on ${data.signed.signedAt.toLocaleDateString("en-CA", { dateStyle: "long" })}. Thank you.`}
          />
        ) : !data.template || !data.template.body.trim() ? (
          <EmptyState
            icon={<FileClock aria-hidden className="h-6 w-6" strokeWidth={1.3} />}
            heading="Agreement not yet available"
            text="The agreement for your consultation is being prepared. We will let you know when it is ready to review and sign."
          />
        ) : (
          <>
            <dl className="grid gap-4 border-y border-line py-5 text-sm sm:grid-cols-3">
              <div><dt className="text-muted">Booking reference</dt><dd className="mt-1 font-medium">{data.booking.reference}</dd></div>
              <div><dt className="text-muted">Consultation</dt><dd className="mt-1 font-medium">{data.booking.consultationName}</dd></div>
              <div><dt className="text-muted">Scheduled</dt><dd className="mt-1 font-medium">{formatInZone(data.booking.startUtc, data.booking.firmTimezone)}</dd></div>
            </dl>
            <article aria-labelledby="agreement-title" className="card-line mt-8 p-6 sm:p-10">
              <h2 id="agreement-title" className="font-serif text-3xl text-charcoal">{data.template.title}</h2>
              <p className="mt-1 text-xs text-muted">Version {data.template.version}</p>
              <div tabIndex={0} aria-label="Agreement text" className="mt-6 max-h-[28rem] overflow-y-auto whitespace-pre-wrap border border-line bg-ivory p-5 text-[0.95rem] leading-relaxed text-ink">
                {data.template.body}
              </div>
            </article>
            <div className="mt-10">
              <SignForm
                token={token}
                templateId={String(data.template._id)}
                templateVersion={data.template.version}
                defaults={{ name: data.booking.name, email: data.booking.email, phone: data.booking.phone }}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
