import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import PageEditor from "@/components/admin/PageEditor";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { PageContent } from "@/lib/models";
import { getPageDef } from "@/lib/page-schemas";
import { discardPageDraft, savePage } from "../../content-actions";

export default async function EditPage({ params }: { params: Promise<{ key: string }> }) {
  await requireAdminPage();
  const { key } = await params;
  const def = getPageDef(key);
  if (!def) notFound();
  await connectDB();
  const doc = await PageContent.findOne({ key }).lean();
  const draft = doc?.draft ?? { metaTitle: "", metaDescription: "", fields: {} };

  return (
    <>
      <AdminHeader
        title={def.label}
        description={doc?.status === "draft" ? "You have unpublished changes. The website still shows the last published version." : "Edits are saved as a draft until you publish."}
        back="/admin/pages"
        action={<Link href={def.path} target="_blank" className="admin-btn"><ExternalLink aria-hidden className="h-4 w-4" /> View live page</Link>}
      />
      <PageEditor
        key={String(doc?.publishedAt ?? "") + (doc?.status ?? "")}
        fields={def.fields}
        initial={JSON.parse(JSON.stringify(draft))}
        defaults={{ metaTitle: def.metaTitle, metaDescription: def.metaDescription }}
        save={savePage.bind(null, key)}
        discard={discardPageDraft.bind(null, key)}
        hasDraft={doc?.status === "draft"}
      />
    </>
  );
}
