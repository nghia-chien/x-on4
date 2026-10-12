import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";

export async function GET() {
  const items = DataStore.getComingSoon();
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { productName, image, description } = body;

    if (!productName || !image) {
      return NextResponse.json(
        { success: false, message: "Product name and image are required" },
        { status: 400 }
      );
    }

    const newItem = DataStore.createComingSoon({
      productName,
      image,
      description: description || "",
      expectedReleaseDate: body.expectedReleaseDate || "",
      status: body.status || "coming_soon",
      displayOrder: Number(body.displayOrder || 0),
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error("Create coming soon item error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create coming soon item" },
      { status: 500 }
    );
  }
}
