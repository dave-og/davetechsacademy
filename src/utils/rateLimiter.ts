export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // in milliseconds
  message: string;
}

export const RATE_LIMIT_PRESETS: Record<string, RateLimitConfig> = {
  "auth:login": {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: "Too many consecutive login attempts. Please wait 5 minutes before trying again.",
  },
  "auth:signup": {
    maxAttempts: 4,
    windowMs: 10 * 60 * 1000, // 10 minutes
    message: "Account creation rate limit reached. Please wait a few minutes before submitting again.",
  },
  "auth:forgot-password": {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many password reset requests. For security reasons, please wait 15 minutes.",
  },
  "contact:submit": {
    maxAttempts: 4,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: "You have submitted multiple contact inquiries. Please wait a few moments before sending another.",
  },
  "payment:init": {
    maxAttempts: 6,
    windowMs: 10 * 60 * 1000, // 10 minutes
    message: "Too many payment initialization attempts. Please wait a moment or contact academy support.",
  },
};

const STORAGE_PREFIX = "devtechs_rate_limit_";

interface StoredAttempts {
  timestamps: number[];
}

function getStoredAttempts(action: string): number[] {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${action}`);
    if (!raw) return [];
    const parsed: StoredAttempts = JSON.parse(raw);
    return Array.isArray(parsed.timestamps) ? parsed.timestamps : [];
  } catch {
    return [];
  }
}

function saveAttempts(action: string, timestamps: number[]): void {
  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${action}`,
      JSON.stringify({ timestamps })
    );
  } catch {
    // Storage quota or disabled fallback
  }
}

/**
 * Checks whether an action is allowed under the rate limit policy.
 */
export function checkRateLimit(
  action: string,
  customConfig?: Partial<RateLimitConfig>
): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  message?: string;
} {
  const preset = RATE_LIMIT_PRESETS[action] || {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000,
    message: "Rate limit exceeded. Please try again later.",
  };

  const config: RateLimitConfig = { ...preset, ...customConfig };
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const validTimestamps = getStoredAttempts(action).filter((t) => t > windowStart);

  if (validTimestamps.length >= config.maxAttempts) {
    const oldestTimestamp = Math.min(...validTimestamps);
    const retryAfterMs = oldestTimestamp + config.windowMs - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      message: `${config.message} (Try again in ${retryAfterSeconds}s)`,
    };
  }

  return {
    allowed: true,
    remaining: config.maxAttempts - validTimestamps.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Records an attempt for the specified rate-limited action.
 */
export function recordRateLimitAttempt(action: string): void {
  const preset = RATE_LIMIT_PRESETS[action] || {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000,
    message: "Rate limit exceeded",
  };

  const now = Date.now();
  const windowStart = now - preset.windowMs;
  const validTimestamps = getStoredAttempts(action).filter((t) => t > windowStart);

  validTimestamps.push(now);
  saveAttempts(action, validTimestamps);
}

/**
 * Resets the rate limit tracker for an action (e.g. after successful login).
 */
export function resetRateLimit(action: string): void {
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${action}`);
  } catch {
    // Ignore
  }
}
