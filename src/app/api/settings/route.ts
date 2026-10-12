import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";

export async function GET() {
  const settings = DataStore.getSettings();
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, ["Admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const updated = DataStore.updateSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 }
    );
  }
}
