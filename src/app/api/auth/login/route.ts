import { NextRequest, NextResponse } from "next/server";
import { generateToken, verifyPassword } from "@/lib/auth";
import {
  getAdminByEmail,
  getAdminById,
  isBcryptHash,
  MongoUnavailableError,
  updateAdmin,
} from "@/lib/adminUserRepository";
import type { AdminUserWithPassword } from "@/types/admin";
import { AUTH_COOKIE } from "@/lib/csrf";
import { apiError, tooManyRequests } from "@/lib/apiError";
import {
  clearRateLimit,
  clientIp,
  hitRateLimit,
  LOGIN_LIMIT,
  peekRateLimit,
} from "@/lib/rateLimit";
import { isValidEmail, sanitizePlainText } from "@/lib/sanitize";

function failAuth(limitKey: string) {
  hitRateLimit(limitKey, LOGIN_LIMIT.limit, LOGIN_LIMIT.windowMs);
  return NextResponse.json(
    { success: false, message: "Invalid email or password" },
    { status: 401 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = sanitizePlainText(String(body.email || ""), 254).toLowerCase();
    const password = String(body.password || "");

    if (!email || !password || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const ip = clientIp(req);
    const limitKey = `login:${ip}:${email}`;
    const limited = peekRateLimit(
      limitKey,
      LOGIN_LIMIT.limit,
      LOGIN_LIMIT.windowMs
    );
    if (!limited.ok) {
      return tooManyRequests(limited.retryAfterSec);
    }

    const DUMMY_HASH =
      "$2b$10$wT5iKz9r5eN2i3mO5uXp7OG4t3Zq5l0o9y4z3x2w1v0u9t8s7r6q5";

    const user = (await getAdminByEmail(
      email,
      true
    )) as AdminUserWithPassword | null;
    if (!user) {
      await verifyPassword(password, DUMMY_HASH);
      return failAuth(limitKey);
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Account is inactive. Please contact Admin." },
        { status: 403 }
      );
    }

    if (!user.passwordHash || !isBcryptHash(user.passwordHash)) {
      await verifyPassword(password, DUMMY_HASH);
      return failAuth(limitKey);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return failAuth(limitKey);
    }

    clearRateLimit(limitKey);
    await updateAdmin(user.id, { lastLogin: new Date().toISOString() });

    const safeUser = await getAdminById(user.id);
    if (!safeUser) {
      return NextResponse.json(
        { success: false, message: "User account could not be retrieved" },
        { status: 500 }
      );
    }

    const token = generateToken(safeUser);
    // Session lives only in HttpOnly cookie — do not return JWT to JS
    const response = NextResponse.json({
      success: true,
      data: { user: safeUser },
    });
    response.cookies.set("admin_token", token, AUTH_COOKIE);
    return response;
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "Auth database unavailable" },
        { status: 503 }
      );
    }
    return apiError(error, "Internal server error during login");
  }
}
