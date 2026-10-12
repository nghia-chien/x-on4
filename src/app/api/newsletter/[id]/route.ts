import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  deleteNewsletter,
  MongoUnavailableError,
} from "@/lib/newsletterRepository";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const success = await deleteNewsletter(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Subscriber removed successfully",
    });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "VIP Club database unavailable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to delete subscriber" },
      { status: 500 }
    );
  }
}
