import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/dataStore";
import { requireAuth } from "@/lib/auth";
import {
  CONTACT_MESSAGE_STATUSES,
  ContactMessageStatus,
} from "@/types/admin";
import { apiError, tooManyRequests } from "@/lib/apiError";
import { clientIp, FORM_LIMIT, rateLimit } from "@/lib/rateLimit";
import { isValidEmail, sanitizePlainText } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const messages = DataStore.getContactMessages({ status, search });
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return apiError(error, "Failed to fetch contact inquiries");
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const limited = rateLimit(
      `contact:${ip}`,
      FORM_LIMIT.limit,
      FORM_LIMIT.windowMs
    );
    if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

    const body = await req.json();
    const name = sanitizePlainText(String(body.name || ""), 100);
    const email = sanitizePlainText(String(body.email || ""), 254).toLowerCase();
    const phone = sanitizePlainText(String(body.phone || ""), 40);
    const subject = sanitizePlainText(
      String(body.subject || "General Inquiry"),
      150
    );
    const message = sanitizePlainText(String(body.message || ""), 2000);

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email, and message are required" },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 }
      );
    }

    const newMessage = DataStore.createContactMessage({
      name,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error) {
    return apiError(error, "Failed to submit contact message. Please try again.");
  }
}

export async function PUT(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Message ID and status are required" },
        { status: 400 }
      );
    }

    if (!CONTACT_MESSAGE_STATUSES.includes(status as ContactMessageStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Must be one of: ${CONTACT_MESSAGE_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updated = DataStore.updateContactMessageStatus(
      id,
      status as ContactMessageStatus
    );
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return apiError(error, "Failed to update status");
  }
}

export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Message ID is required" },
        { status: 400 }
      );
    }
    const deleted = DataStore.deleteContactMessage(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return apiError(error, "Failed to delete message");
  }
}
