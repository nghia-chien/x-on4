/**
 * In-memory sliding-window rate limiter (demo / single-node).
 * Adapter-ready shape for Redis later.
 */

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

function getBucket(key: string): Bucket {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  return bucket;
}

function prune(bucket: Bucket, windowMs: number, now: number) {
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; remaining: 0; retryAfterSec: number };

/** Check without recording a hit */
export function peekRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = getBucket(key);
  prune(bucket, windowMs, now);
  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowMs - (now - oldest)) / 1000)
    );
    return { ok: false, remaining: 0, retryAfterSec };
  }
  return { ok: true, remaining: Math.max(0, limit - bucket.hits.length) };
}

/** Record a hit (e.g. failed login or form submit) */
export function hitRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const peek = peekRateLimit(key, limit, windowMs);
  if (!peek.ok) return peek;
  getBucket(key).hits.push(Date.now());
  return peekRateLimit(key, limit, windowMs);
}

/** Check + record in one call (forms / read APIs) */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  return hitRateLimit(key, limit, windowMs);
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

export function clientIp(req: { headers: Headers }): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") || "unknown";
}

/** Login: 5 failed attempts / 15 min per IP+email */
export const LOGIN_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

/** Contact / Wholesale: 5 req / 10 min per IP */
export const FORM_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

/** Public read APIs: 60 req / min per IP */
export const READ_LIMIT = { limit: 60, windowMs: 60 * 1000 };
