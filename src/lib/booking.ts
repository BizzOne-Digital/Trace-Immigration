import "server-only";
import { randomBytes, createHash } from "crypto";
import { DateTime } from "luxon";
import { Types } from "mongoose";
import { connectDB } from "./db";
import { Availability, Booking, BookingLock, ConsultationType, type AvailabilityDoc } from "./models";

const BLOCK_MINUTES = 15;

export async function getAvailability(): Promise<AvailabilityDoc> {
  await connectDB();
  const doc = await Availability.findOne({ key: "default" }).lean();
  return (
    doc ?? {
      key: "default",
      timezone: "America/Toronto",
      weekly: [],
      blackoutDates: [],
      slotStepMinutes: 30,
      minNoticeHours: 24,
      maxDaysAhead: 45,
      bufferMinutes: 0,
      acceptingBookings: false,
    }
  );
}

export function isValidTimezone(tz: string) {
  return Boolean(tz) && DateTime.local().setZone(tz).isValid;
}

/** 15-minute UTC block starts covering [start, start + minutes). */
export function blocksFor(startUtc: Date, minutes: number) {
  const out: Date[] = [];
  for (let m = 0; m < minutes; m += BLOCK_MINUTES) out.push(new Date(startUtc.getTime() + m * 60_000));
  return out;
}

type Slot = { startUtc: string; label: string };

/** Computes open slots per firm-local date (YYYY-MM-DD) across the bookable window. */
export async function computeSlots(durationMinutes: number, onlyDate?: string) {
  const av = await getAvailability();
  const result: Record<string, Slot[]> = {};
  if (!av.acceptingBookings || av.weekly.length === 0) return { timezone: av.timezone, days: result };

  const tz = av.timezone;
  const now = DateTime.utc();
  const earliest = now.plus({ hours: av.minNoticeHours });
  const firstDay = now.setZone(tz).startOf("day");
  const lastDay = firstDay.plus({ days: av.maxDaysAhead });
  const blocked = new Set(av.blackoutDates);

  const windowStart = onlyDate ? DateTime.fromISO(onlyDate, { zone: tz }).startOf("day") : firstDay;
  const windowEnd = onlyDate ? windowStart.endOf("day") : lastDay.endOf("day");
  if (!windowStart.isValid || windowStart > lastDay || windowEnd < firstDay) return { timezone: tz, days: result };

  await connectDB();
  const locks = await BookingLock.find({
    blockStart: { $gte: windowStart.minus({ hours: 4 }).toJSDate(), $lte: windowEnd.plus({ hours: 4 }).toJSDate() },
  })
    .select("blockStart")
    .lean();
  const taken = new Set(locks.map((l) => l.blockStart.getTime()));
  const span = durationMinutes + av.bufferMinutes;

  for (let day = windowStart; day <= windowEnd; day = day.plus({ days: 1 })) {
    const iso = day.toISODate()!;
    if (blocked.has(iso)) continue;
    const weekday = day.weekday % 7; // luxon: Mon=1..Sun=7 -> Sun=0..Sat=6
    const slots: Slot[] = [];
    for (const rule of av.weekly.filter((r) => r.day === weekday)) {
      const [sh, sm] = rule.start.split(":").map(Number);
      const [eh, em] = rule.end.split(":").map(Number);
      const ruleEnd = day.set({ hour: eh, minute: em });
      for (let t = day.set({ hour: sh, minute: sm }); t.plus({ minutes: durationMinutes }) <= ruleEnd; t = t.plus({ minutes: av.slotStepMinutes })) {
        if (t.toUTC() < earliest) continue;
        const start = t.toUTC().toJSDate();
        if (start.getUTCMinutes() % BLOCK_MINUTES !== 0) continue;
        if (blocksFor(start, span).some((b) => taken.has(b.getTime()))) continue;
        slots.push({ startUtc: start.toISOString(), label: t.toFormat("h:mm a") });
      }
    }
    if (slots.length) {
      slots.sort((a, b) => a.startUtc.localeCompare(b.startUtc));
      result[iso] = slots;
    }
  }
  return { timezone: tz, days: result };
}

export function newReference() {
  return `TI-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Issues a new agreement link token; only its hash is stored. */
export async function issueAgreementToken(bookingId: string | Types.ObjectId) {
  const token = randomBytes(32).toString("base64url");
  await Booking.updateOne({ _id: bookingId }, { agreementTokenHash: hashToken(token), agreementTokenCreatedAt: new Date() });
  return token;
}

/**
 * Atomically claims every 15-minute block of the booking (plus buffer).
 * Any overlap with another active booking hits the unique index and is rolled back.
 */
export async function acquireLocks(bookingId: Types.ObjectId, startUtc: Date, minutes: number) {
  const av = await getAvailability();
  const docs = blocksFor(startUtc, minutes + av.bufferMinutes).map((blockStart) => ({ blockStart, booking: bookingId }));
  try {
    await BookingLock.insertMany(docs, { ordered: true });
    return true;
  } catch (err) {
    await BookingLock.deleteMany({ booking: bookingId });
    if ((err as { code?: number }).code === 11000 || (err as { writeErrors?: unknown }).writeErrors) return false;
    throw err;
  }
}

export async function releaseLocks(bookingId: Types.ObjectId | string) {
  await BookingLock.deleteMany({ booking: bookingId });
}

export type CreateBookingInput = {
  consultationTypeId: string;
  startUtc: string;
  clientTimezone: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  notes: string;
};

export async function createBooking(input: CreateBookingInput) {
  await connectDB();
  if (!Types.ObjectId.isValid(input.consultationTypeId)) return { ok: false as const, error: "Please choose a consultation type." };
  const type = await ConsultationType.findOne({ _id: input.consultationTypeId, status: "published" }).lean();
  if (!type) return { ok: false as const, error: "That consultation type is not available." };

  const start = DateTime.fromISO(input.startUtc, { zone: "utc" });
  if (!start.isValid) return { ok: false as const, error: "Please choose a valid time." };
  const av = await getAvailability();
  const localDate = start.setZone(av.timezone).toISODate()!;
  const { days } = await computeSlots(type.durationMinutes, localDate);
  if (!days[localDate]?.some((s) => s.startUtc === start.toJSDate().toISOString())) {
    return { ok: false as const, error: "That time is no longer available. Please choose another." };
  }

  const startUtc = start.toJSDate();
  const booking = await Booking.create({
    reference: newReference(),
    consultationType: type._id,
    consultationName: type.name,
    durationMinutes: type.durationMinutes,
    startUtc,
    endUtc: new Date(startUtc.getTime() + type.durationMinutes * 60_000),
    firmTimezone: av.timezone,
    clientTimezone: isValidTimezone(input.clientTimezone) ? input.clientTimezone : "",
    name: input.name,
    email: input.email,
    phone: input.phone,
    service: input.service,
    notes: input.notes,
    status: "pending",
  });

  const locked = await acquireLocks(booking._id, startUtc, type.durationMinutes);
  if (!locked) {
    await Booking.deleteOne({ _id: booking._id });
    return { ok: false as const, error: "That time was just booked by someone else. Please choose another." };
  }
  return { ok: true as const, booking };
}

export function formatInZone(date: Date, tz: string) {
  return DateTime.fromJSDate(date).setZone(tz || "UTC").toFormat("cccc, LLLL d, yyyy 'at' h:mm a ZZZZ");
}
