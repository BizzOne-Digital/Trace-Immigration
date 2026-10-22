import { Types } from "mongoose";
import { getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { SignedAgreement } from "@/lib/models";
import { toBuffer } from "@/lib/binary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Private download of a signed agreement PDF. Admin session required. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin().catch(() => null);
  if (!admin) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return new Response("Not found", { status: 404 });

  await connectDB();
  const doc = await SignedAgreement.findById(id).select("+pdf bookingReference pdfSize").lean();
  if (!doc) return new Response("Not found", { status: 404 });
  const pdf = toBuffer(doc.pdf);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.length),
      "Content-Disposition": `attachment; filename="consultation-agreement-${doc.bookingReference}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
