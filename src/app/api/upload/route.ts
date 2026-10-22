import { NextResponse } from "next/server";
import { assertSameOrigin, getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { UploadChunk } from "@/lib/models";
import { toBuffer } from "@/lib/binary";
import { isUploadFolder, MAX_CHUNKS, MAX_UPLOAD_BYTES, saveImageBuffer } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (status: number, error: string) => NextResponse.json({ success: false, error }, { status });

/**
 * POST multipart/form-data
 *  - Direct:   file + folder               (files that fit the host's request-body limit)
 *  - Finalize: uploadId + folder           (assembles chunks sent to /api/upload/chunk)
 * Both paths validate signatures and store the image in MongoDB (StoredUpload).
 */
export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return fail(403, "Cross-origin request rejected.");
  let admin;
  try {
    admin = await getCurrentAdmin();
  } catch {
    return fail(500, "Authentication is not configured.");
  }
  if (!admin) return fail(401, "Please sign in again.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Malformed upload request.");
  }

  const folder = form.get("folder");
  if (!isUploadFolder(folder)) return fail(400, "Invalid folder. Allowed: products, gallery, pages, misc.");

  try {
    const uploadId = form.get("uploadId");
    let buf: Buffer;

    if (typeof uploadId === "string" && uploadId) {
      if (!/^[a-f0-9]{32}$/.test(uploadId)) return fail(400, "Invalid upload id.");
      await connectDB();
      const chunks = await UploadChunk.find({ uploadId }).sort({ index: 1 }).lean();
      if (chunks.length === 0) return fail(400, "Upload expired or not found. Please try again.");
      const { total, totalSize } = chunks[0];
      const complete =
        total <= MAX_CHUNKS &&
        chunks.length === total &&
        chunks.every((c, i) => c.index === i && c.total === total && c.totalSize === totalSize);
      if (!complete) return fail(400, "Upload is incomplete. Please try again.");
      if (totalSize > MAX_UPLOAD_BYTES) return fail(413, "The file exceeds the 8 MB limit.");
      buf = Buffer.concat(chunks.map((c) => toBuffer(c.data)));
      await UploadChunk.deleteMany({ uploadId });
      if (buf.length !== totalSize) return fail(400, "Upload size mismatch. Please try again.");
    } else {
      const file = form.get("file");
      if (!(file instanceof File)) return fail(400, "No file was provided.");
      if (file.size === 0) return fail(400, "The file is empty.");
      if (file.size > MAX_UPLOAD_BYTES) return fail(413, "The file exceeds the 8 MB limit.");
      buf = Buffer.from(await file.arrayBuffer());
    }

    const saved = await saveImageBuffer(buf, folder);
    if (!saved.ok) return fail(saved.status, saved.error);
    return NextResponse.json(
      { success: true, url: saved.url, filename: saved.filename, size: saved.size, folder: saved.folder },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload failed:", (err as Error).message);
    return fail(500, "Upload failed. Please try again.");
  }
}
