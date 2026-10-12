import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/csrf";
import { clientIp, rateLimit, READ_LIMIT } from "@/lib/rateLimit";
import { tooManyRequests } from "@/lib/apiError";

export function middleware(req: NextRequest) {
  // CSRF: block cross-origin mutations to /api/*
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const csrfBlock = assertSameOrigin(req);
    if (csrfBlock) return csrfBlock;

    // Light read-rate limit for public catalog APIs
    if (
      req.method === "GET" &&
      (req.nextUrl.pathname.startsWith("/api/products") ||
        req.nextUrl.pathname.startsWith("/api/blog") ||
        req.nextUrl.pathname.startsWith("/api/gallery"))
    ) {
      const ip = clientIp(req);
      const result = rateLimit(
        `read:${ip}:${req.nextUrl.pathname.split("/")[2] || "api"}`,
        READ_LIMIT.limit,
        READ_LIMIT.windowMs
      );
      if (!result.ok) return tooManyRequests(result.retryAfterSec);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
