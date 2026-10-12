import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  deleteWholesale,
  MongoUnavailableError,
  updateWholesale,
} from "@/lib/wholesaleRepository";
import { WHOLESALE_REQUEST_STATUSES } from "@/types/admin";
import type { WholesaleRequestStatus } from "@/types/admin";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const patch: {
      status?: WholesaleRequestStatus;
      adminNotes?: string;
    } = {};

    if (
      typeof body.status === "string" &&
      WHOLESALE_REQUEST_STATUSES.includes(body.status as WholesaleRequestStatus)
    ) {
      patch.status = body.status as WholesaleRequestStatus;
    }
    if (typeof body.adminNotes === "string") {
      patch.adminNotes = body.adminNotes;
    }

    const updated = await updateWholesale(params.id, patch);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Wholesale request not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "Wholesale database unavailable" },
        { status: 503 }
      );
    }
    console.error("Update wholesale error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update wholesale request" },
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

  try {
    const success = await deleteWholesale(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Wholesale request not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "Wholesale database unavailable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to delete wholesale request" },
      { status: 500 }
    );
  }
}
