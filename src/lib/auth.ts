import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AdminRole, AdminUser } from "@/types/admin";
import { getAdminById } from "./adminUserRepository";

if (!process.env.JWT_SECRET) {
  throw new Error(
    "[SECURITY CRITICAL] JWT_SECRET environment variable is missing. The server cannot start without a secure secret key configured."
  );
}

const JWT_SECRET = process.env.JWT_SECRET;

// Staff roles derived from AdminRole definition in src/types/admin.ts
// Only "Admin" is staff; "Customer" and "Wholesale" are non-staff.
export const STAFF_ROLES: AdminRole[] = [
  "Admin",
];

export interface JWTPayload {
  userId: string;
  email: string;
  role: AdminRole;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AdminUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // Check Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookieToken = req.cookies.get("admin_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: AdminRole[]
): Promise<{ user: AdminUser | null; errorResponse: NextResponse | null }> {
  const token = getTokenFromRequest(req);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      try {
        const user = await getAdminById(payload.userId);
        if (user && user.status === "active") {
          // DEFAULT-DENY: If allowedRoles is not specified, default strictly to STAFF_ROLES
          const effectiveAllowedRoles =
            allowedRoles && allowedRoles.length > 0 ? allowedRoles : STAFF_ROLES;

          const hasPermission = effectiveAllowedRoles.includes(user.role);

          if (!hasPermission) {
            return {
              user: null,
              errorResponse: NextResponse.json(
                { success: false, message: "Forbidden: Insufficient permissions" },
                { status: 403 }
              ),
            };
          }
          return { user, errorResponse: null };
        }
      } catch (error) {
        console.error("requireAuth Mongo lookup failed:", error);
      }
    }
  }

  return {
    user: null,
    errorResponse: NextResponse.json(
      { success: false, message: "Unauthorized: Access token is missing or invalid" },
      { status: 401 }
    ),
  };
}
