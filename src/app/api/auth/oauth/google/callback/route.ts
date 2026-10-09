import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/dataStore";
import { generateToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const siteUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    const errorMsg = encodeURIComponent("Google authorization cancelled or failed.");
    return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
  }

  // Validate CSRF state
  const savedState = req.cookies.get("oauth_state")?.value;
  if (!savedState || savedState !== state) {
    const errorMsg = encodeURIComponent("Invalid OAuth state parameter. Possible security threat.");
    return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${siteUrl}/api/auth/oauth/google/callback`;

  if (!clientId || !clientSecret) {
    const errorMsg = encodeURIComponent("Server configuration error: Google credentials missing.");
    return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      const errorMsg = encodeURIComponent(tokenData.error_description || "Failed to exchange Google token.");
      return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
    }

    // Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();

    if (!profile || !profile.email) {
      const errorMsg = encodeURIComponent("Google account did not return a valid email address.");
      return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
    }

    const email = profile.email.toLowerCase();
    const providerAccountId = profile.id;
    const name = profile.name || email.split("@")[0];
    const avatar = profile.picture;
    const emailVerified = profile.verified_email === true;

    // Check if account already exists in DataStore
    const existingUser = DataStore.getAdminByEmail(email);

    let userToLogin;

    if (existingUser) {
      // NEVER allow merging into an Admin / Editor role
      if (existingUser.role === "Administrator" || existingUser.role === "Super Admin" || existingUser.role === "Editor") {
        const errorMsg = encodeURIComponent("Security Block: Social login is strictly prohibited for Admin accounts.");
        return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
      }

      // Check if email is verified by Google before linking
      if (!emailVerified) {
        const errorMsg = encodeURIComponent("Unverified Google Email: Cannot link to existing account.");
        return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
      }

      // Link provider if not already linked
      const accounts = existingUser.accounts || [];
      const alreadyLinked = accounts.some(
        (acc) => acc.provider === "google" && acc.providerAccountId === providerAccountId
      );

      if (!alreadyLinked) {
        accounts.push({ provider: "google", providerAccountId, emailVerified });
        DataStore.updateAdmin(existingUser.id, { accounts, avatar: existingUser.avatar || avatar });
      }

      userToLogin = DataStore.getAdminById(existingUser.id)!;
    } else {
      // Create new customer account
      const newUser = DataStore.createAdmin({
        name,
        email,
        role: "Retail Customer",
        status: "active",
        avatar,
        accounts: [{ provider: "google", providerAccountId, emailVerified }],
      });
      userToLogin = newUser;
    }

    // Generate standard session token
    const token = generateToken(userToLogin);

    const redirectResponse = NextResponse.redirect(`${siteUrl}/my-account`);
    redirectResponse.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    redirectResponse.cookies.delete("oauth_state");

    return redirectResponse;
  } catch (err) {
    console.error("Google OAuth error:", err);
    const errorMsg = encodeURIComponent("An unexpected error occurred during Google authentication.");
    return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
  }
}
