import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DataStore } from "@/lib/dataStore";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status") || undefined;
  const list = DataStore.getWholesale({ status });
  return NextResponse.json({ success: true, data: list });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, contactName, email, phone } = body;

    if (!businessName || !contactName || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "Business name, contact name, email, and phone are required" },
        { status: 400 }
      );
    }

    const newRequest = DataStore.createWholesale({
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      website: body.website ? body.website.trim() : "",
      taxId: body.taxId ? body.taxId.trim() : "",
      businessType: body.businessType ? body.businessType.trim() : "",
      location: body.location ? body.location.trim() : "",
      quantity: body.quantity ? body.quantity.trim() : "",
      message: body.message ? body.message.trim() : "",
      status: "new",
      adminNotes: "",
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Create wholesale error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit wholesale request" },
      { status: 500 }
    );
  }
}
