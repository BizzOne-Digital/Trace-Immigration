import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export function AdminHeader({ title, description, back, action }: { title: string; description?: string; back?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-gold-ink">
            <ArrowLeft aria-hidden className="h-4 w-4" /> Back
          </Link>
        )}
        <h1 className="font-serif text-4xl text-charcoal">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function NewButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="admin-btn admin-btn-primary self-start">
      <Plus aria-hidden className="h-4 w-4" /> {label}
    </Link>
  );
}

const TONES: Record<string, string> = {
  published: "bg-[#e7f3ea] text-[#1f6b35]",
  approved: "bg-[#e7f3ea] text-[#1f6b35]",
  active: "bg-[#e7f3ea] text-[#1f6b35]",
  confirmed: "bg-[#e7f3ea] text-[#1f6b35]",
  sent: "bg-[#e7f3ea] text-[#1f6b35]",
  completed: "bg-[#eef1f6] text-[#334155]",
  closed: "bg-[#eef1f6] text-[#334155]",
  archived: "bg-[#eef1f6] text-[#334155]",
  draft: "bg-[#fbf1dc] text-[#7a5419]",
  pending: "bg-[#fbf1dc] text-[#7a5419]",
  new: "bg-[#fbf1dc] text-[#7a5419]",
  in_progress: "bg-[#e8eefb] text-[#1e40af]",
  hidden: "bg-[#eef1f6] text-[#334155]",
  not_configured: "bg-[#eef1f6] text-[#334155]",
  failed: "bg-[#fdecea] text-[#9b1c1c]",
  cancelled: "bg-[#fdecea] text-[#9b1c1c]",
  no_show: "bg-[#fdecea] text-[#9b1c1c]",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-medium ${TONES[status] ?? "bg-cream text-ink"}`}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-sm border border-line bg-white p-6 ${className}`}>
      {title && <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-gold-ink">{title}</h2>}
      {children}
    </section>
  );
}

export function EmptyRow({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-dashed border-line bg-white px-6 py-12 text-center">
      <p className="text-sm text-muted">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line bg-cream/60 text-xs uppercase tracking-wider text-muted">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" });
}
