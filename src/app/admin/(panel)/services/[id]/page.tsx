import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { ExternalLink } from "lucide-react";
import EntityForm from "@/components/admin/EntityForm";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models";
import { plain } from "@/lib/content";
import { SERVICE_FIELDS } from "@/lib/admin-fields";
import { saveService } from "../../content-actions";

export default async function EditService({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const isNew = id === "new";
  let initial: Record<string, unknown> = { status: "draft", icon: "file-text", order: 0 };
  if (!isNew) {
    if (!Types.ObjectId.isValid(id)) notFound();
    await connectDB();
    const doc = await Service.findById(id).lean();
    if (!doc) notFound();
    initial = plain(doc);
  }

  return (
    <>
      <AdminHeader
        title={isNew ? "New service" : String(initial.title)}
        back="/admin/services"
        action={!isNew && initial.status === "published" ? (
          <Link href={`/services/${initial.slug}`} target="_blank" className="admin-btn"><ExternalLink aria-hidden className="h-4 w-4" /> View live</Link>
        ) : undefined}
      />
      <Panel>
        <EntityForm
          fields={SERVICE_FIELDS}
          initial={initial}
          action={saveService.bind(null, isNew ? null : id)}
          redirectTo={isNew ? "/admin/services/:id" : undefined}
          submitLabel={isNew ? "Create service" : "Save changes"}
        />
      </Panel>
    </>
  );
}
