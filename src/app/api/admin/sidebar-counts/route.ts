import { NextResponse } from "next/server";
import { DataStore } from "@/lib/dataStore";

export async function GET() {
  try {
    const wholesaleList = DataStore.getWholesale();
    const newsletterList = DataStore.getNewsletter();
    const contactList = DataStore.getContactMessages();
    const ordersResult = DataStore.getOrders();

    // Strictly count ONLY items requiring admin attention (Unread/New/Pending/Processing)
    const wholesaleCount = wholesaleList.filter(
      (w) => w.status === "New"
    ).length;

    // VIP Club/Newsletter has no "unread" state, but we count new subscribers in the last 7 days or 0 if none
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const vipClubCount = newsletterList.filter(
      (n) => new Date(n.subscribedAt).getTime() > sevenDaysAgo
    ).length;

    const contactCount = contactList.filter(
      (c) => c.status === "New"
    ).length;

    const ordersCount = Array.isArray(ordersResult.orders)
      ? ordersResult.orders.filter(
          (o) => o.orderStatus === "pending" || o.orderStatus === "processing"
        ).length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        wholesale: wholesaleCount,
        vipClub: vipClubCount,
        contact: contactCount,
        orders: ordersCount,
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
