import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");

  if (provider !== "google" && provider !== "facebook") {
    return NextResponse.json(
      { success: false, message: "Invalid or unsupported social provider" },
      { status: 400 }
    );
  }

  // Dynamically resolve siteUrl based on request headers to prevent redirect_uri_mismatch
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const siteUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin);
  const state = crypto.randomBytes(16).toString("hex");

  let authUrl = "";

  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { success: false, message: "Google Client ID is not configured on server" },
        { status: 400 }
      );
    }
    const redirectUri = `${siteUrl}/api/auth/oauth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      state,
      access_type: "online",
      prompt: "select_account",
    });
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  } else if (provider === "facebook") {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { success: false, message: "Facebook App ID is not configured on server" },
        { status: 400 }
      );
    }
    const redirectUri = `${siteUrl}/api/auth/oauth/facebook/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "email,public_profile",
      state,
    });
    authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  const response = NextResponse.json({
    success: true,
    url: authUrl,
  });

  // Store state in HTTP-only cookie for CSRF protection
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  return response;
}
