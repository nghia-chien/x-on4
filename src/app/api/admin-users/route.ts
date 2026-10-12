import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, ["Admin"]);
  if (errorResponse) return errorResponse;

  const admins = DataStore.getAdmins();
  return NextResponse.json({ success: true, data: admins });
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

    const existing = DataStore.getAdminByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An admin with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newAdmin = DataStore.createAdmin({
      name,
      email,
      passwordHash,
      role: role || "Customer",
      status: status || "active",
    });

    return NextResponse.json({ success: true, data: newAdmin }, { status: 201 });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
