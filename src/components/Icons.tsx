import { FileText, Users, ShieldAlert, Home, Landmark, Plane, type LucideProps } from "lucide-react";

/** Two interlocking rings (line art, Lucide-compatible stroke style). */
export function RingsIcon({ size = 24, strokeWidth = 1.5, className, ...rest }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      <circle cx="8.5" cy="14" r="6" />
      <circle cx="15.5" cy="14" r="6" />
      <path d="M7 5.5 8.5 3.5 10 5.5" />
    </svg>
  );
}

const LEAF =
  "M50 4 57 17 64 13 61 35 71 25 74 31 86 29 82 41 90 45 73 58 76 66 55 62 53 63 53 95 47 95 47 63 45 62 24 66 27 58 10 45 18 41 14 29 26 31 29 25 39 35 36 13 43 17Z";

export function MapleLeafIcon({ size = 24, strokeWidth = 1.5, className, ...rest }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={Number(strokeWidth) * 4}
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      <path d={LEAF} />
    </svg>
  );
}

/** Large decorative maple leaf for the booking panel (filled, low contrast). */
export function MapleLeafDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      <path d={LEAF} fill="currentColor" />
      <path d="M50 20V92M50 52 70 40M50 52 30 40M50 66 68 60M50 66 32 60" stroke="#171719" strokeOpacity="0.35" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

const MAP: Record<string, (p: LucideProps) => React.ReactElement> = {
  rings: RingsIcon,
  "maple-leaf": MapleLeafIcon,
  "file-text": (p) => <FileText {...p} />,
  users: (p) => <Users {...p} />,
  "shield-alert": (p) => <ShieldAlert {...p} />,
  home: (p) => <Home {...p} />,
  landmark: (p) => <Landmark {...p} />,
  plane: (p) => <Plane {...p} />,
};

export function ServiceIcon({ name, ...p }: { name: string } & LucideProps) {
  const Cmp = MAP[name] ?? MAP["file-text"];
  return <Cmp aria-hidden {...p} />;
}

/** Brand marks for social links (Lucide no longer ships brand icons). Sized and coloured like Lucide icons. */
export function SocialIcon({ name, className }: { name: string; className?: string }) {
  const common = { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", className, "aria-hidden": true, focusable: "false" } as const;
  if (name === "instagram") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
      </svg>
    );
  }
  if (name === "google") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M21.6 10.2H12v3.9h5.5c-.5 2.5-2.6 3.9-5.5 3.9a6 6 0 1 1 3.9-10.6l2.9-2.8A10 10 0 1 0 12 22c5.8 0 9.8-4.1 9.8-9.8 0-.7-.1-1.3-.2-2Z" />
      </svg>
    );
  }
  return null;
}
