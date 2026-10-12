import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/dataStore";
import { requireAuth } from "@/lib/auth";
import {
  CONTACT_MESSAGE_STATUSES,
  ContactMessageStatus,
} from "@/types/admin";

// GET: List all contact inquiries
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
    console.error("Fetch contact messages error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch contact inquiries" },
      { status: 500 }
    );
  }
}

// POST: Public Contact Form Submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const newMessage = DataStore.createContactMessage({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : "",
      subject: subject ? String(subject).trim() : "General Inquiry",
      message: String(message).trim(),
    });

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Create contact message error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit contact message. Please try again." },
      { status: 500 }
    );
  }
}

// PUT: Update inquiry status (New -> Replied / Resolved)
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
    console.error("Update message status error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update status" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an inquiry
export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Message ID is required" },
        { status: 400 }
      );
    }

    const deleted = DataStore.deleteContactMessage(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete message" },
      { status: 500 }
    );
  }
}
