import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Allow any validly authenticated user to fetch their own user session
  const { user, errorResponse } = await requireAuth(req, [
    "Admin",
    "Customer",
    "Wholesale",
  ]);
  if (errorResponse) return errorResponse;

  return NextResponse.json({
    success: true,
    data: user,
  });
}
