import { SocialIcon } from "../Icons";

export type Social = { key: string; label: string; url: string };

/** Row of icon-only social links; labels stay available to screen readers. */
export default function SocialLinks({ socials, className = "" }: { socials: Social[]; className?: string }) {
  if (socials.length === 0) return null;
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {socials.map((s) => (
        <li key={s.key}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-gold-ink transition-colors hover:border-gold hover:bg-gold hover:text-white"
          >
            <SocialIcon name={s.key} className="h-4 w-4" />
            <span className="sr-only">{s.label} (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
