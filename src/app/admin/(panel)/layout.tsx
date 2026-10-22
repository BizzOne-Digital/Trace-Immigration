import AdminNav from "@/components/admin/AdminNav";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Server-side gate: every page under the panel requires a valid admin session. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  return (
    <div className="lg:flex">
      <AdminNav name={admin.name} />
      <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
