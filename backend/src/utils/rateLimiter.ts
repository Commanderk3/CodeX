// submitRateLimiter.ts
type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const LIMIT = 5;            // submissions
const WINDOW_MS = 60_000;   // per 1 minute

const submitMap = new Map<string, RateLimitEntry>();

export const canSubmitCode = (userId: string) => {
  const now = Date.now();
  const entry = submitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    submitMap.set(userId, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { allowed: true };
  }

  if (entry.count >= LIMIT) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true };
};
