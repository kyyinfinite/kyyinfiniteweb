const mongoose = require('mongoose');

const RateLimitHitSchema = new mongoose.Schema({
  bucketKey: { type: String, required: true, index: true },
  windowStart: { type: Date, required: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

RateLimitHitSchema.index({ bucketKey: 1, windowStart: 1 }, { unique: true });
// TTL index: dokumen otomatis kehapus MongoDB setelah expiresAt lewat, tidak perlu cron cleanup manual.
RateLimitHitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimitHit = mongoose.models.RateLimitHit || mongoose.model('RateLimitHit', RateLimitHitSchema);

/**
 * Sliding-window kasar per menit. Mengembalikan { allowed, remaining, limit, resetAt }.
 * bucketKey sebaiknya digabung identitas + jenis limit, misal `license-verify:ip:1.2.3.4`.
 */
async function consumeRateLimit(bucketKey, { limit = 30, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
  const expiresAt = new Date(windowStart.getTime() + windowMs * 2);

  const hit = await RateLimitHit.findOneAndUpdate(
    { bucketKey, windowStart },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, new: true }
  );

  const remaining = Math.max(0, limit - hit.count);
  const resetAt = new Date(windowStart.getTime() + windowMs);

  return { allowed: hit.count <= limit, remaining, limit, resetAt };
}

module.exports = { consumeRateLimit };
