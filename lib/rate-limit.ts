type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory fixed-window rate limiter.
 * Good enough for a single-instance launch deployment; swap the store for a
 * shared one (Redis) when running multiple instances.
 */
export function rateLimit(key: string, windowMs: number, max: number) {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > max) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export const RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, max: 10 },
  register: { windowMs: 60 * 60 * 1000, max: 5 },
  passwordReset: { windowMs: 60 * 60 * 1000, max: 10 },
  apply: { windowMs: 60 * 60 * 1000, max: 20 },
  resumeUpload: { windowMs: 60 * 60 * 1000, max: 20 },
  videoUpload: { windowMs: 60 * 60 * 1000, max: 10 },
  jobPost: { windowMs: 60 * 60 * 1000, max: 30 },
  payment: { windowMs: 60 * 60 * 1000, max: 20 },
  report: { windowMs: 60 * 60 * 1000, max: 10 },
} as const;

export function resetRateLimits() {
  buckets.clear();
}
