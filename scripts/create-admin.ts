/**
 * Creates the first admin account from environment variables (never hardcoded).
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a long passphrase' npm run create-admin
 *   npm run create-admin -- --reset     # reset the password of an existing account
 *
 * Remove ADMIN_PASSWORD from your environment after running.
 */
import "./env";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Admin } from "../src/lib/models";

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = (process.env.ADMIN_NAME || "Administrator").trim();
  const reset = process.argv.includes("--reset");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Set ADMIN_EMAIL to a valid email address.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  if (/^(password|admin|changeme|123456)/i.test(password)) throw new Error("Choose a stronger ADMIN_PASSWORD.");

  await connectDB();
  await Admin.syncIndexes();
  const existing = await Admin.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    if (!reset) {
      console.log(`Admin ${email} already exists. Use --reset to change its password.`);
    } else {
      existing.passwordHash = passwordHash;
      await existing.save();
      console.log(`✓ Password reset for ${email}. Existing sessions remain valid until they expire (8h).`);
    }
  } else {
    await Admin.create({ email, name, passwordHash, role: "owner" });
    console.log(`✓ Admin created: ${email}`);
  }
  console.log("Remove ADMIN_PASSWORD from your environment now.");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("create-admin failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
