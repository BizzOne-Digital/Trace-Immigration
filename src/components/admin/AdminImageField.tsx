"use client";

import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import SafeImage from "../SafeImage";

export type UploadFolder = "products" | "gallery" | "pages" | "misc";

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024;
/** Files above this go through the chunked transport (Vercel rejects bodies over 4.5 MB). */
const DIRECT_LIMIT = 3.5 * 1024 * 1024;
const CHUNK_BYTES = 2.5 * 1024 * 1024;

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: UploadFolder;
  help?: string;
  disabled?: boolean;
};

async function readJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return { success: false, error: res.status === 413 ? "The file is too large for the server." : `Upload failed (${res.status}).` };
  }
}

async function uploadFile(file: File, folder: UploadFolder): Promise<string> {
  if (file.size <= DIRECT_LIMIT) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await readJson(res);
    if (!res.ok || !json.success) throw new Error(json.error || "Upload failed.");
    return json.url as string;
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const uploadId = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const total = Math.ceil(file.size / CHUNK_BYTES);
  for (let i = 0; i < total; i++) {
    const fd = new FormData();
    fd.append("uploadId", uploadId);
    fd.append("index", String(i));
    fd.append("total", String(total));
    fd.append("totalSize", String(file.size));
    fd.append("chunk", file.slice(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES));
    const res = await fetch("/api/upload/chunk", { method: "POST", body: fd });
    const json = await readJson(res);
    if (!res.ok || !json.success) throw new Error(json.error || "Upload failed.");
  }
  const fd = new FormData();
  fd.append("uploadId", uploadId);
  fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await readJson(res);
  if (!res.ok || !json.success) throw new Error(json.error || "Upload failed.");
  return json.url as string;
}

/**
 * Reusable admin image field. Uploads to /api/upload and returns the saved public URL
 * via onChange. A failed replacement keeps the existing image; Remove returns "".
 */
export default function AdminImageField({ label, value, onChange, folder = "pages", help, disabled }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPT.includes(file.type)) {
      toast.error("Please choose a PNG, JPEG, WebP or GIF image.");
      return;
    }
    if (file.size === 0) {
      toast.error("That file is empty.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Images must be 8 MB or smaller.");
      return;
    }
    const temp = URL.createObjectURL(file);
    setPreview(temp);
    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
      toast.success("Image uploaded. Save to apply the change.");
    } catch (err) {
      toast.error((err as Error).message || "Upload failed. The previous image was kept.");
    } finally {
      setUploading(false);
      setPreview(null); // effect cleanup revokes the object URL
    }
  }

  const shown = preview ?? value;
  const busy = uploading || disabled;

  return (
    <div>
      <span id={`${id}-label`} className="field-label">{label}</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-32 w-48 shrink-0 overflow-hidden border border-line bg-cream" aria-live="polite">
          {shown ? (
            preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
              <img src={preview} alt="Selected image preview" className="h-full w-full object-cover" />
            ) : (
              <SafeImage src={shown} alt={`${label} preview`} fill sizes="192px" className="object-cover" />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 aria-label="Uploading" className="h-6 w-6 animate-spin text-gold" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <input ref={inputRef} id={id} type="file" accept={ACCEPT.join(",")} className="sr-only" onChange={onFile} disabled={busy} aria-labelledby={`${id}-label`} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="admin-btn">
              {value ? <RefreshCw aria-hidden className="h-4 w-4" /> : <ImagePlus aria-hidden className="h-4 w-4" />}
              {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} disabled={busy} className="admin-btn admin-btn-danger">
                <Trash2 aria-hidden className="h-4 w-4" /> Remove
              </button>
            )}
          </div>
          <p className="text-xs text-muted">PNG, JPEG, WebP or GIF · max 8 MB{help ? ` · ${help}` : ""}</p>
          {value && <p className="max-w-xs truncate text-xs text-muted" title={value}>{value}</p>}
        </div>
      </div>
    </div>
  );
}
