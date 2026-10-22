import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/lib/models";
import { toBuffer } from "@/lib/binary";
import { isUploadFolder, isValidStoredFilename } from "@/lib/uploads";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ folder: string; filename: string }> };

const notFound = () =>
  new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" } });

/** Public delivery of stored images. Filenames are unique per upload, so responses are immutable. */
export async function GET(_req: Request, { params }: Ctx) {
  const { folder, filename } = await params;
  if (!isUploadFolder(folder) || !isValidStoredFilename(filename)) return notFound();

  try {
    await connectDB();
    const doc = await StoredUpload.findOne({ folder, filename }).select("+data mimeType size").lean();
    if (!doc) return notFound();
    const data = toBuffer(doc.data);
    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(doc.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
      },
    });
  } catch (err) {
    console.error("Image delivery failed:", (err as Error).message);
    return new Response("Temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
