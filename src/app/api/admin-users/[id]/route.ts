import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req, ["Admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, role, status, password } = body;

    const updateData: {
      name?: string;
      role?: "Admin" | "Customer" | "Wholesale";
      status?: "active" | "inactive";
      passwordHash?: string;
    } = {};

    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    const target = DataStore.getAdminById(params.id);
    if (!target) {
      return NextResponse.json(
        { success: false, message: "Admin user not found" },
        { status: 404 }
      );
    }

    if (target.role === "Admin") {
      if ((role && role !== "Admin") || (status && status === "inactive")) {
        const adminCount = DataStore.getAdmins().filter((u) => u.role === "Admin" && u.status === "active").length;
        if (adminCount <= 1) {
          return NextResponse.json(
            { success: false, message: "Cannot demote or deactivate the last active Admin account" },
            { status: 400 }
          );
        }
      }
    }

    const updated = DataStore.updateAdmin(params.id, updateData);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Admin user not found or operation rejected" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update admin error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update admin user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { user, errorResponse } = await requireAuth(req, ["Admin"]);
  if (errorResponse) return errorResponse;

  const target = DataStore.getAdminById(params.id);
  if (!target) {
    return NextResponse.json(
      { success: false, message: "Admin user not found" },
      { status: 404 }
    );
  }

  // Prevent self deletion
  if (user?.id === params.id) {
    return NextResponse.json(
      { success: false, message: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  if (target.role === "Admin") {
    const adminCount = DataStore.getAdmins().filter((u) => u.role === "Admin").length;
    if (adminCount <= 1) {
      return NextResponse.json(
        { success: false, message: "Cannot delete the last Admin account" },
        { status: 400 }
      );
    }
  }

  const success = DataStore.deleteAdmin(params.id);
  if (!success) {
    return NextResponse.json(
      { success: false, message: "Admin user not found or operation rejected" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, message: "Admin deleted successfully" });
}
