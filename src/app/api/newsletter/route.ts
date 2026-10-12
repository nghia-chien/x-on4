import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { isValidEmail, sanitizePlainText } from "@/lib/sanitize";
import {
  createNewsletter,
  deleteNewsletter,
  listNewsletter,
  MongoUnavailableError,
} from "@/lib/newsletterRepository";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const list = await listNewsletter();
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "VIP Club database unavailable" },
        { status: 503 }
      );
    }
    console.error("Newsletter list error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = sanitizePlainText(String(body.email || ""), 254).toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email address is required" },
        { status: 400 }
      );
    }

    const item = await createNewsletter(email);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "VIP Club database unavailable" },
        { status: 503 }
      );
    }
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const ok = await deleteNewsletter(id);
    return NextResponse.json({ success: ok });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "VIP Club database unavailable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}
