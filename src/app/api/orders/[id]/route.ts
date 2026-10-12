import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";
import { OrderItem } from "@/types/admin";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const order = DataStore.getOrderById(params.id);
  if (!order) {
    return NextResponse.json(
      { success: false, message: "Order not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: order });
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

    // Whitelist allowed fields to prevent mass assignment (id, orderNumber, items, total, customer cannot be tampered)
    const allowedUpdate: Partial<OrderItem> = {};
    if (
      body.orderStatus === "pending" ||
      body.orderStatus === "processing" ||
      body.orderStatus === "shipped" ||
      body.orderStatus === "delivered" ||
      body.orderStatus === "cancelled" ||
      body.orderStatus === "refunded"
    ) {
      allowedUpdate.orderStatus = body.orderStatus;
    }
    if (
      body.paymentStatus === "pending" ||
      body.paymentStatus === "paid" ||
      body.paymentStatus === "failed" ||
      body.paymentStatus === "refunded"
    ) {
      allowedUpdate.paymentStatus = body.paymentStatus;
    }
    if (typeof body.trackingNumber === "string") allowedUpdate.trackingNumber = body.trackingNumber.trim();
    if (typeof body.notes === "string") allowedUpdate.notes = body.notes.trim();
    if (typeof body.shippingAddress === "string") allowedUpdate.shippingAddress = body.shippingAddress.trim();

    const updated = DataStore.updateOrder(params.id, allowedUpdate);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
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

  const success = DataStore.deleteOrder(params.id);
  if (!success) {
    return NextResponse.json(
      { success: false, message: "Order not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, message: "Order deleted successfully" });
}
