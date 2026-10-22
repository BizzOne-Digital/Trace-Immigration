"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminImageField, { type UploadFolder } from "@/components/admin/AdminImageField";

/** Upload straight into the library. Unused uploads are removed by the 24-hour cleanup. */
export default function MediaUploader() {
  const router = useRouter();
  const [folder, setFolder] = useState<UploadFolder>("gallery");
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <label htmlFor="media-folder" className="field-label">Folder</label>
        <select id="media-folder" className="field" value={folder} onChange={(e) => setFolder(e.target.value as UploadFolder)}>
          {(["gallery", "pages", "misc", "products"] as const).map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <AdminImageField
        label="Upload image"
        value={url}
        folder={folder}
        onChange={(u) => {
          setUrl(u);
          router.refresh();
        }}
        help="Images not used in content within 24 hours are cleaned up automatically"
      />
    </div>
  );
}
