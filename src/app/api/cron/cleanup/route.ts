import { NextResponse } from "next/server";
import { cleanupAbandonedUploads } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Daily cleanup of unreferenced uploads older than 24 hours. Requires CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await cleanupAbandonedUploads(24);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Cleanup failed:", (err as Error).message);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
