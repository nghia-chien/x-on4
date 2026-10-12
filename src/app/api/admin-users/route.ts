import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireAuth } from "@/lib/auth";
import {
  createAdmin,
  getAdminByEmail,
  listAdmins,
  MongoUnavailableError,
  normalizeRole,
} from "@/lib/adminUserRepository";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, ["Admin"]);
  if (errorResponse) return errorResponse;

  try {
    const admins = await listAdmins();
    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "Auth database unavailable" },
        { status: 503 }
      );
    }
    console.error("List admins error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to list admin users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, ["Admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, email, password, role, status } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (String(password).length < 12) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 12 characters" },
        { status: 400 }
      );
    }

    const existing = await getAdminByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An admin with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newAdmin = await createAdmin({
      name,
      email,
      passwordHash,
      role: normalizeRole(role || "Customer"),
      status: status === "inactive" ? "inactive" : "active",
    });

    return NextResponse.json({ success: true, data: newAdmin }, { status: 201 });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "Auth database unavailable" },
        { status: 503 }
      );
    }
    console.error("Create admin error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
