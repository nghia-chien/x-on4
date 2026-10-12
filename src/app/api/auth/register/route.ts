import { NextRequest, NextResponse } from "next/server";
import { generateToken, hashPassword } from "@/lib/auth";
import {
  createAdmin,
  getAdminByEmail,
  getAdminById,
  MongoUnavailableError,
} from "@/lib/adminUserRepository";
import { AUTH_COOKIE } from "@/lib/csrf";
import { apiError } from "@/lib/apiError";
import { isValidEmail, sanitizePlainText } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = sanitizePlainText(String(body.name || ""), 100);
    const email = sanitizePlainText(String(body.email || ""), 254).toLowerCase();
    const password = String(body.password || "");

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: "Full name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const existingUser = await getAdminByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email address already exists" },
        { status: 400 }
      );
    }

    // Public registration ALWAYS assigns "Customer" role.
    const passwordHash = await hashPassword(password);
    const newAdmin = await createAdmin({
      name,
      email,
      passwordHash,
      role: "Customer",
      status: "active",
    });

    const safeUser = await getAdminById(newAdmin.id);
    if (!safeUser) {
      return NextResponse.json(
        { success: false, message: "Account created but user record could not be loaded" },
        { status: 500 }
      );
    }

    const token = generateToken(safeUser);

    const response = NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: safeUser,
        },
      },
      { status: 201 }
    );

    response.cookies.set("admin_token", token, AUTH_COOKIE);

    return response;
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "Auth database unavailable" },
        { status: 503 }
      );
    }
    return apiError(error, "Internal server error during registration");
  }
}
