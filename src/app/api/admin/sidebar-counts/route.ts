import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { countAttentionOrders } from "@/lib/orderRepository";
import { countNewWholesale } from "@/lib/wholesaleRepository";
import { countRecentNewsletter } from "@/lib/newsletterRepository";
import { countNewContactMessages } from "@/lib/contactRepository";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;
  try {
    const [wholesale, vipClub, contact, orders] = await Promise.all([
      countNewWholesale(),
      countRecentNewsletter(7),
      countNewContactMessages(),
      countAttentionOrders(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        wholesale,
        vipClub,
        contact,
        orders,
      },
    });
  } catch (error) {
    console.error("Failed to get sidebar counts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
