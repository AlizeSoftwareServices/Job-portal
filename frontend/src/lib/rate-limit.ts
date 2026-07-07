import { NextRequest } from 'next/server';

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const rateLimiterStore = new Map<string, RateLimitTracker>();

// A generic rate limiter check function
export function checkRateLimit(req: NextRequest, limit: number, windowMs: number): { success: boolean, ip: string } {
  // Try to get the real IP from standard proxy headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  // Use forwarded IP, real IP, or a fallback 'unknown' string
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || 'unknown-ip');
  
  const now = Date.now();
  const tracker = rateLimiterStore.get(ip);
  
  if (!tracker || now > tracker.resetTime) {
    // Reset or initialize the tracker for this IP
    rateLimiterStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, ip };
  }

  // Increment the request count
  tracker.count++;

  if (tracker.count > limit) {
    return { success: false, ip }; // Rate limit exceeded
  }

  return { success: true, ip };
}
