import "server-only";
import { connectDB } from "./db";
import { RateLimit } from "./models";

/**
 * Fixed-window limiter stored in MongoDB so it holds across serverless instances.
 * Returns true when the request is allowed.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  await connectDB();
  const now = new Date();
  // Reset an expired window (TTL cleanup may lag behind).
  await RateLimit.deleteOne({ key, expiresAt: { $lte: now } });
  try {
    const doc = await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + windowSeconds * 1000) } },
      { upsert: true, new: true }
    ).lean();
    return (doc?.count ?? 0) <= limit;
  } catch (err) {
    // Concurrent upsert race on the unique key: retry once as a plain increment.
    if ((err as { code?: number }).code === 11000) {
      const doc = await RateLimit.findOneAndUpdate({ key }, { $inc: { count: 1 } }, { new: true }).lean();
      return (doc?.count ?? 0) <= limit;
    }
    throw err;
  }
}

export async function resetRateLimit(key: string) {
  await connectDB();
  await RateLimit.deleteOne({ key });
}
