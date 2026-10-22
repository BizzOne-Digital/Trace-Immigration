import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { ConsultationType } from "@/lib/models";
import { computeSlots } from "@/lib/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const typeId = new URL(req.url).searchParams.get("type") ?? "";
  if (!Types.ObjectId.isValid(typeId)) return NextResponse.json({ error: "Invalid consultation type." }, { status: 400 });
  try {
    await connectDB();
    const type = await ConsultationType.findOne({ _id: typeId, status: "published" }).select("durationMinutes").lean();
    if (!type) return NextResponse.json({ error: "Consultation type not found." }, { status: 404 });
    const slots = await computeSlots(type.durationMinutes);
    return NextResponse.json(slots, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Slot lookup failed:", (err as Error).message);
    return NextResponse.json({ error: "Availability is temporarily unavailable." }, { status: 503 });
  }
}
