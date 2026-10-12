import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";
import { CustomerItem } from "@/types/admin";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = DataStore.getCustomerById(params.id);
  if (!result) {
    return NextResponse.json(
      { success: false, message: "Customer not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: result });
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    // Whitelist allowed fields to prevent mass assignment (id, totalOrders, totalSpent, createdAt cannot be overwritten)
    const allowedUpdate: Partial<CustomerItem> = {};
    if (typeof body.name === "string" && body.name.trim()) allowedUpdate.name = body.name.trim();
    if (typeof body.phone === "string") allowedUpdate.phone = body.phone.trim();
    if (typeof body.address === "string") allowedUpdate.address = body.address.trim();
    if (body.status === "active" || body.status === "inactive" || body.status === "blocked") {
      allowedUpdate.status = body.status;
    }

    const updated = DataStore.updateCustomer(params.id, allowedUpdate);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update customer error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const success = DataStore.deleteCustomer(params.id);
  if (!success) {
    return NextResponse.json(
      { success: false, message: "Customer not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, message: "Customer deleted successfully" });
}
