import "server-only";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { AuthError, requireAdmin } from "./auth";
import { connectDB } from "./db";

export type ActionResult = { ok: boolean; error?: string; id?: string; message?: string };

export class UserError extends Error {}

/** Wraps every admin mutation: authorizes server-side, connects, and maps errors to safe messages. */
export async function adminAction(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: "Your session has expired. Please sign in again." };
    if (err instanceof UserError) return { ok: false, error: err.message };
    const e = err as { code?: number; name?: string; errors?: Record<string, { message: string }>; message?: string };
    if (e.code === 11000) return { ok: false, error: "A record with that unique value (e.g. slug) already exists." };
    if (e.name === "ValidationError" && e.errors) {
      return { ok: false, error: Object.values(e.errors).map((x) => x.message).join(" ") };
    }
    console.error("Admin action failed:", e.message);
    return { ok: false, error: "Something went wrong while saving. Please try again." };
  }
}

/** Public pages are ISR-cached; any content change invalidates the whole site layout. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

export function assertId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new UserError("Invalid record id.");
  return id;
}

export const str = (fd: FormData, k: string, max = 10000) => String(fd.get(k) ?? "").trim().slice(0, max);
export const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
export const num = (fd: FormData, k: string, fallback = 0) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? n : fallback;
};
export const lines = (fd: FormData, k: string) =>
  str(fd, k, 20000).split("\n").map((s) => s.trim()).filter(Boolean);
export const pairs = (fd: FormData, k: string) =>
  lines(fd, k).map((l) => {
    const [title, ...rest] = l.split("|");
    return { title: title.trim(), description: rest.join("|").trim() };
  });

export function required(value: string, label: string) {
  if (!value) throw new UserError(`${label} is required.`);
  return value;
}

/** Image fields may only hold our upload URLs, approved Unsplash URLs, static brand/generated image assets, or "". */
export function imageUrl(fd: FormData, k: string) {
  const v = str(fd, k, 500);
  if (!v) return "";
  if (/^\/api\/uploads\/(products|gallery|pages|misc)\/[\w.-]+$/.test(v)) return v;
  if (/^\/(brand|images)\/[\w.-]+$/.test(v)) return v;
  if (/^https:\/\/images\.unsplash\.com\/[\w\-./?=&%]+$/.test(v)) return v;
  throw new UserError("Unsupported image URL. Upload the image or use an approved Unsplash URL.");
}

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
