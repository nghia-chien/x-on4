import { NextRequest, NextResponse } from "next/server";

const MUTATION = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function allowedOrigins(): string[] {
  const origins = new Set<string>();
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    try {
      origins.add(new URL(site).origin);
    } catch {
      // ignore invalid
    }
  }
  // Local / preview hosts
  origins.add("http://localhost:3000");
  origins.add("http://127.0.0.1:3000");
  return [...origins];
}

/**
 * Reject cross-site mutation requests (CSRF defense for cookie sessions).
 * Allows requests with no Origin/Referer only when SameSite cookies block
 * cross-site automatically — still reject clear cross-origin mismatches.
 */
export function assertSameOrigin(req: NextRequest): NextResponse | null {
  if (!MUTATION.has(req.method)) return null;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const requestOrigin = host ? `${proto}://${host}` : null;

  const allowed = new Set(allowedOrigins());
  if (requestOrigin) allowed.add(requestOrigin);

  const candidate = origin || (referer ? safeOrigin(referer) : null);

  // Same-origin browser forms always send Origin (modern) or Referer
  if (!candidate) {
    // Non-browser clients (scripts, curl) — allow in development only
    if (process.env.NODE_ENV !== "production") return null;
    return NextResponse.json(
      { success: false, message: "Forbidden: missing origin" },
      { status: 403 }
    );
  }

  if (!allowed.has(candidate)) {
    return NextResponse.json(
      { success: false, message: "Forbidden: cross-origin request blocked" },
      { status: 403 }
    );
  }

  return null;
}

function safeOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};
