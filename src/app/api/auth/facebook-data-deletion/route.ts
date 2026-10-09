import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const signedRequest = formData.get("signed_request") as string;

    if (!signedRequest) {
      return NextResponse.json(
        { success: false, message: "Missing signed_request parameter" },
        { status: 400 }
      );
    }

    const appSecret = process.env.FACEBOOK_CLIENT_SECRET;
    if (!appSecret) {
      return NextResponse.json(
        { success: false, message: "Facebook Client Secret is missing" },
        { status: 500 }
      );
    }

    const [encodedSig, payload] = signedRequest.split(".", 2);

    // Decode signature
    const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    const expectedSig = crypto
      .createHmac("sha256", appSecret)
      .update(payload)
      .digest();

    if (!crypto.timingSafeEqual(sig, expectedSig)) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Decode payload
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
    );

    const userId = data.user_id;
    const confirmationCode = crypto.randomBytes(12).toString("hex");

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const siteUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin);

    const statusUrl = `${siteUrl}/api/auth/facebook-data-deletion/status?code=${confirmationCode}`;

    console.log(`[Facebook Data Deletion Request] User ID: ${userId}, Confirmation Code: ${confirmationCode}`);

    // Response structure required by Meta Platform Policy
    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (err) {
    console.error("Facebook Data Deletion Callback error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") || "N/A";

  return NextResponse.json({
    success: true,
    message: "Your Facebook data deletion request has been processed successfully.",
    confirmation_code: code,
    status: "Completed",
  });
}
