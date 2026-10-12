import { NextResponse } from "next/server";

/**
 * Mask internal errors in production — never leak stack / DB details to clients.
 */
export function apiError(
  error: unknown,
  fallbackMessage = "Internal server error",
  status = 500
): NextResponse {
  console.error("[API]", error);
  const message =
    process.env.NODE_ENV === "production"
      ? fallbackMessage
      : error instanceof Error
        ? error.message || fallbackMessage
        : fallbackMessage;

  return NextResponse.json({ success: false, message }, { status });
}

export function tooManyRequests(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: "Too many requests. Please try again later.",
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}
