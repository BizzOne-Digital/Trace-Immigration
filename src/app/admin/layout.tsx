import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Trace Immigration",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f7f3ea]">{children}</div>;
}
