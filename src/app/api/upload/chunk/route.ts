import { NextResponse } from "next/server";
import { assertSameOrigin, getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { UploadChunk } from "@/lib/models";
import { MAX_CHUNK_BYTES, MAX_CHUNKS, MAX_UPLOAD_BYTES } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (status: number, error: string) => NextResponse.json({ success: false, error }, { status });

/**
 * Receives one chunk (< 3 MB) of a larger image so uploads up to 8 MB work on hosts whose
 * request-body limit is lower (Vercel: 4.5 MB). Chunks expire automatically after one hour.
 * Fields: uploadId (32 hex), index, total, totalSize, chunk (Blob).
 */
export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return fail(403, "Cross-origin request rejected.");
  if (!(await getCurrentAdmin().catch(() => null))) return fail(401, "Please sign in again.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Malformed chunk request.");
  }
  const uploadId = String(form.get("uploadId") ?? "");
  const index = Number(form.get("index"));
  const total = Number(form.get("total"));
  const totalSize = Number(form.get("totalSize"));
  const chunk = form.get("chunk");

  if (!/^[a-f0-9]{32}$/.test(uploadId)) return fail(400, "Invalid upload id.");
  if (!Number.isInteger(totalSize) || totalSize < 1) return fail(400, "Invalid file size.");
  if (totalSize > MAX_UPLOAD_BYTES) return fail(413, "The file exceeds the 8 MB limit.");
  if (!Number.isInteger(total) || total < 1 || total > MAX_CHUNKS) return fail(400, "Invalid chunk count.");
  if (!Number.isInteger(index) || index < 0 || index >= total) return fail(400, "Invalid chunk index.");
  if (!(chunk instanceof Blob) || chunk.size === 0) return fail(400, "Missing chunk data.");
  if (chunk.size > MAX_CHUNK_BYTES) return fail(413, "Chunk too large.");

  try {
    await connectDB();
    const data = Buffer.from(await chunk.arrayBuffer());
    await UploadChunk.updateOne(
      { uploadId, index },
      { $set: { total, totalSize, data }, $setOnInsert: { uploadId, index } },
      { upsert: true }
    );
    return NextResponse.json({ success: true, index });
  } catch (err) {
    console.error("Chunk upload failed:", (err as Error).message);
    return fail(500, "Chunk upload failed.");
  }
}
