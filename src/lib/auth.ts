import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";
import { connectDB } from "./db";
import { Admin } from "./models";

export type AdminSession = {
  adminId?: string;
  email?: string;
  name?: string;
  issuedAt?: number;
};

const MAX_AGE_SECONDS = 60 * 60 * 8; // 8-hour admin sessions

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  return {
    password,
    cookieName: "trace_admin",
    ttl: MAX_AGE_SECONDS,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}

/** Returns the signed-in admin (re-validated against the database) or null. */
export async function getCurrentAdmin() {
  let session;
  try {
    session = await getSession();
  } catch {
    return null;
  }
  if (!session.adminId || !session.issuedAt) return null;
  if (Date.now() - session.issuedAt > MAX_AGE_SECONDS * 1000) return null;
  await connectDB();
  const admin = await Admin.findById(session.adminId).select("email name role").lean();
  if (!admin) return null;
  return { id: String(admin._id), email: admin.email, name: admin.name, role: admin.role };
}

/** For server components/pages: redirects to login when unauthenticated. */
export async function requireAdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export class AuthError extends Error {
  status = 401;
}

/** For server actions and route handlers: throws when unauthenticated. */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AuthError("Not authorized");
  return admin;
}

/**
 * CSRF defence for route handlers: mutations must come from our own origin.
 * (Server Actions get an equivalent built-in check from Next.js.)
 */
export async function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim().slice(0, 100);
}
