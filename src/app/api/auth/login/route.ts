import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/dataStore";
import { generateToken, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = DataStore.getAdminByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Account is inactive. Please contact Super Admin." },
        { status: 403 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    DataStore.updateAdmin(user.id, { lastLogin: new Date().toISOString() });

    const safeUser = DataStore.getAdminById(user.id);
    if (!safeUser) {
      return NextResponse.json(
        { success: false, message: "User account could not be retrieved" },
        { status: 500 }
      );
    }

    const token = generateToken(safeUser);

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: safeUser,
      },
    });

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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during login" },
      { status: 500 }
    );
  }
}
