import Link from "next/link";
import { AdminHeader, StatusBadge, Table, fmtDate } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { PageContent } from "@/lib/models";
import { PAGE_DEFS } from "@/lib/page-schemas";

export default async function PagesAdmin() {
  await requireAdminPage();
  await connectDB();
  const docs = await PageContent.find().select("key status publishedAt").lean();
  const byKey = new Map(docs.map((d) => [d.key, d]));
  return (
    <>
      <AdminHeader title="Pages" description="Edit page text, images and SEO. Changes go live only when published." />
      <Table head={["Page", "Path", "State", "Last published"]}>
        {PAGE_DEFS.map((p) => {
          const doc = byKey.get(p.key);
          const state = !doc?.publishedAt ? "Default content" : doc.status === "draft" ? "Unpublished changes" : "Published";
          return (
            <tr key={p.key}>
              <td className="px-4 py-3"><Link href={`/admin/pages/${p.key}`} className="font-medium hover:text-gold-ink">{p.label}</Link></td>
              <td className="px-4 py-3 text-muted">{p.path}</td>
              <td className="px-4 py-3"><StatusBadge status={doc?.status === "draft" ? "draft" : doc?.publishedAt ? "published" : "not_configured"} label={state} /></td>
              <td className="px-4 py-3 text-muted">{fmtDate(doc?.publishedAt)}</td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
