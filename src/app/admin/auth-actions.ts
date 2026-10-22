"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models";
import { clientIp, getSession } from "@/lib/auth";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

// Compared against when the email is unknown, so response time does not reveal valid accounts.
let dummyHash: string | null = null;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash("unused-dummy-password", 12));

const schema = z.object({ email: z.email().trim().toLowerCase().max(200), password: z.string().min(1).max(200) });

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter your email and password." };
  const { email, password } = parsed.data;

  try {
    const ip = await clientIp();
    const [ipOk, emailOk] = await Promise.all([rateLimit(`login-ip:${ip}`, 20, 900), rateLimit(`login-email:${email}`, 5, 900)]);
    if (!ipOk || !emailOk) return { error: "Too many sign-in attempts. Please wait 15 minutes and try again." };

    await connectDB();
    const admin = await Admin.findOne({ email }).select("+passwordHash name email");
    const valid = await bcrypt.compare(password, admin?.passwordHash ?? (await getDummyHash()));
    if (!admin || !valid) return { error: "Incorrect email or password." };

    await resetRateLimit(`login-email:${email}`);
    admin.lastLoginAt = new Date();
    await admin.save();

    const session = await getSession();
    session.adminId = String(admin._id);
    session.email = admin.email;
    session.name = admin.name;
    session.issuedAt = Date.now();
    await session.save();
  } catch (err) {
    console.error("Login failed:", (err as Error).message);
    return { error: "Sign-in is temporarily unavailable. Check the server configuration." };
  }
  redirect("/admin");
}

export async function logout() {
  try {
    const session = await getSession();
    session.destroy();
  } catch {
    // Session secret missing: nothing to destroy.
  }
  redirect("/admin/login");
}
