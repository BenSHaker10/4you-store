import rateLimit from "express-rate-limit";
import helmet from "helmet";
import type { Express, Request, Response, NextFunction } from "express";

// ─── Rate Limiters ──────────────────────────────────────────

/** General API rate limiter - 100 requests per minute per IP */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

/** Auth rate limiter - 10 attempts per 15 minutes per IP */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." },
});

/** Upload rate limiter - 20 uploads per hour per IP */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many uploads. Please try again later." },
});

// ─── Security Headers ───────────────────────────────────────

export function setupSecurityHeaders(app: Express) {
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for SPA compatibility
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // Additional security headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });
}

// ─── Input Sanitization Helpers ─────────────────────────────

/** Strip HTML tags from string to prevent XSS */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

/** Validate and sanitize URL */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

/** Validate file upload content type */
export function isAllowedImageType(contentType: string): boolean {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  return allowed.includes(contentType.toLowerCase());
}

/** Max file size in bytes (5MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Validate base64 file size */
export function isWithinSizeLimit(base64: string, maxBytes: number = MAX_FILE_SIZE): boolean {
  // Base64 encodes 3 bytes into 4 characters
  const estimatedBytes = Math.ceil(base64.length * 3 / 4);
  return estimatedBytes <= maxBytes;
}
