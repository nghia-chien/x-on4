import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { apiError, tooManyRequests } from "@/lib/apiError";
import { clientIp, FORM_LIMIT, rateLimit } from "@/lib/rateLimit";
import { isValidEmail, sanitizePlainText } from "@/lib/sanitize";
import {
  createWholesale,
  listWholesale,
  MongoUnavailableError,
} from "@/lib/wholesaleRepository";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const list = await listWholesale({ status });
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "Wholesale database unavailable" },
        { status: 503 }
      );
    }
    return apiError(error, "Failed to fetch wholesale requests");
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const limited = rateLimit(
      `wholesale:${ip}`,
      FORM_LIMIT.limit,
      FORM_LIMIT.windowMs
    );
    if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

    const body = await req.json();
    const businessName = sanitizePlainText(String(body.businessName || ""), 150);
    const contactName = sanitizePlainText(String(body.contactName || ""), 100);
    const email = sanitizePlainText(String(body.email || ""), 254).toLowerCase();
    const phone = sanitizePlainText(String(body.phone || ""), 40);

    if (!businessName || !contactName || !email || !phone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business name, contact name, email, and phone are required",
        },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 }
      );
    }

    const newRequest = await createWholesale({
      businessName,
      contactName,
      email,
      phone,
      website: sanitizePlainText(String(body.website || ""), 200),
      taxId: sanitizePlainText(String(body.taxId || ""), 50),
      businessType: sanitizePlainText(String(body.businessType || ""), 100),
      location: sanitizePlainText(String(body.location || ""), 150),
      quantity: sanitizePlainText(String(body.quantity || ""), 80),
      message: sanitizePlainText(String(body.message || ""), 2000),
      status: "new",
      adminNotes: "",
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof MongoUnavailableError) {
      return NextResponse.json(
        { success: false, message: "Wholesale database unavailable" },
        { status: 503 }
      );
    }
    return apiError(error, "Failed to submit wholesale request");
  }
}
