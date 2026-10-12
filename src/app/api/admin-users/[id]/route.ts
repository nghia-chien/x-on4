import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireAuth } from "@/lib/auth";
import {
  countActiveAdmins,
  deleteAdmin,
  getAdminById,
  MongoUnavailableError,
  normalizeRole,
  updateAdmin,
} from "@/lib/adminUserRepository";
import type { AdminRole } from "@/types/admin";

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
      role?: AdminRole;
      status?: "active" | "inactive";
      passwordHash?: string;
    } = {};

    if (name) updateData.name = name;
    if (role) updateData.role = normalizeRole(role);
    if (status) updateData.status = status;
    if (password) {
      if (String(password).length < 12) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 12 characters" },
          { status: 400 }
        );
      }
      updateData.passwordHash = await hashPassword(password);
    }

    const target = await getAdminById(params.id);
    if (!target) {
      return NextResponse.json(
        { success: false, message: "Admin user not found" },
        { status: 404 }
      );
    }

    if (target.role === "Admin") {
      if (
        (role && normalizeRole(role) !== "Admin") ||
        (status && status === "inactive")
      ) {
        const adminCount = await countActiveAdmins();
        if (adminCount <= 1) {
          return NextResponse.json(
            {
              success: false,
              message: "Cannot demote or deactivate the last active Admin account",
            },
            { status: 400 }
          );
        }
      }
    }

    const updated = await updateAdmin(params.id, updateData);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Admin user not found or operation rejected" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "Auth database unavailable" },
        { status: 503 }
      );
    }
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

  try {
    const target = await getAdminById(params.id);
    if (!target) {
      return NextResponse.json(
        { success: false, message: "Admin user not found" },
        { status: 404 }
      );
    }

    if (user?.id === params.id) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    if (target.role === "Admin") {
      const adminCount = await countActiveAdmins();
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: "Cannot delete the last Admin account" },
          { status: 400 }
        );
      }
    }

    const success = await deleteAdmin(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Admin user not found or operation rejected" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "Auth database unavailable" },
        { status: 503 }
      );
    }
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete admin user" },
      { status: 500 }
    );
  }
}
