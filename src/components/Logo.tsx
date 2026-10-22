import Link from "next/link";
import SafeImage from "./SafeImage";

/** Renders the original brand logo artwork at its natural aspect ratio. Never redrawn as text. */
export default function Logo({ src, alt, className = "h-14 w-[152px]", priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <Link href="/" className={`relative block shrink-0 ${className}`} aria-label={`${alt} — home`}>
      <SafeImage src={src} alt={alt} fill sizes="240px" priority={priority} className="object-contain object-left" />
    </Link>
  );
}
