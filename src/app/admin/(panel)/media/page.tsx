import SafeImage from "@/components/SafeImage";
import ActionButton from "@/components/admin/ActionButton";
import { AdminHeader, EmptyRow, Panel, fmtDate } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/lib/models";
import { getReferencedUploadUrls } from "@/lib/uploads";
import { deleteMedia, runMediaCleanup } from "../ops-actions";
import MediaUploader from "./MediaUploader";

export default async function MediaAdmin() {
  await requireAdminPage();
  await connectDB();
  // Binary data is excluded by the schema (select: false) — list queries stay small.
  const [items, refs] = await Promise.all([
    StoredUpload.find().sort({ createdAt: -1 }).limit(300).select("folder filename mimeType size createdAt").lean(),
    getReferencedUploadUrls(),
  ]);

  return (
    <>
      <AdminHeader
        title="Media library"
        description="Images are stored in MongoDB and served from /api/uploads, so they persist across deployments."
        action={<ActionButton action={runMediaCleanup} confirm="Delete all unused images older than 24 hours?">Clean up unused images</ActionButton>}
      />
      <Panel title="Upload" className="mb-8"><MediaUploader /></Panel>
      {items.length === 0 ? <EmptyRow text="No uploaded images yet." /> : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((m) => {
            const url = `/api/uploads/${m.folder}/${m.filename}`;
            const used = refs.has(url);
            return (
              <li key={String(m._id)} className="overflow-hidden rounded-sm border border-line bg-white">
                <div className="relative aspect-[4/3] bg-cream">
                  <SafeImage src={url} alt={m.filename} fill sizes="300px" className="object-cover" />
                </div>
                <div className="space-y-1 p-3 text-xs">
                  <p className="truncate font-mono" title={url}>{url}</p>
                  <p className="text-muted">{m.folder} · {(m.size / 1024).toFixed(0)} KB · {fmtDate(m.createdAt)}</p>
                  <p className={used ? "text-[#1f6b35]" : "text-muted"}>{used ? "In use" : "Not used"}</p>
                  {!used && (
                    <div className="pt-2">
                      <ActionButton action={deleteMedia.bind(null, String(m._id))} variant="danger" confirm="Delete this image?">Delete</ActionButton>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
