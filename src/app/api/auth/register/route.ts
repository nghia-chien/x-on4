import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/dataStore";
import { generateToken, hashPassword } from "@/lib/auth";
import { AdminRole } from "@/types/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Full name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
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

    // Check if email already exists
    const existingUser = DataStore.getAdminByEmail(email.trim());
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const validRoles: AdminRole[] = [
      "Super Admin",
      "Administrator",
      "Admin",
      "Editor",
      "Wholesale Partner",
      "Retail Customer",
    ];

    const selectedRole: AdminRole = validRoles.includes(role) ? role : "Admin";

    const passwordHash = await hashPassword(password);
    const newAdmin = DataStore.createAdmin({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: selectedRole,
      status: "active",
    });

    const safeUser = DataStore.getAdminById(newAdmin.id);
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

    // Set HTTP-only cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
