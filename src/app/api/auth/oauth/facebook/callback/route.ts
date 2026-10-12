import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";
import {
  createAdmin,
  getAdminByEmail,
  getAdminById,
  updateAdmin,
} from "@/lib/adminUserRepository";
import type { AdminUser } from "@/types/admin";
import { AUTH_COOKIE } from "@/lib/csrf";

export async function GET(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const siteUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    const errorMsg = encodeURIComponent("Facebook authorization cancelled or failed.");
    return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
  }

  // Validate CSRF state
  const savedState = req.cookies.get("oauth_state")?.value;
  if (!savedState || savedState !== state) {
    const errorMsg = encodeURIComponent("Invalid OAuth state parameter. Possible security threat.");
    return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
  }

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const redirectUri = `${siteUrl}/api/auth/oauth/facebook/callback`;

  if (!clientId || !clientSecret) {
    const errorMsg = encodeURIComponent("Server configuration error: Facebook credentials missing.");
    return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
  }

  try {
    // Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    });
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams.toString()}`);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      const errorMsg = encodeURIComponent(tokenData.error?.message || "Failed to exchange Facebook token.");
      return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
    }

    // Fetch Facebook User Profile
    const userRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=${tokenData.access_token}`
    );
    const profile = await userRes.json();

    if (!profile || !profile.id) {
      const errorMsg = encodeURIComponent("Failed to retrieve Facebook user profile.");
      return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
    }

    // Facebook may not return email if user registered via phone or withheld permission
    if (!profile.email) {
      const errorMsg = encodeURIComponent("Your Facebook account does not provide an email address. Please sign up with email.");
      return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
    }

    const email = profile.email.toLowerCase();
    const providerAccountId = profile.id;
    const name = profile.name || email.split("@")[0];
    const avatar = profile.picture?.data?.url;

    const existingUser = await getAdminByEmail(email);
    let userToLogin: AdminUser;

    if (existingUser) {
      // NEVER merge into Admin accounts
      if (existingUser.role === "Admin") {
        const errorMsg = encodeURIComponent("Security Block: Social login is strictly prohibited for Admin accounts.");
        return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
      }

      // Link provider
      const accounts = existingUser.accounts || [];
      const alreadyLinked = accounts.some(
        (acc) => acc.provider === "facebook" && acc.providerAccountId === providerAccountId
      );

      if (!alreadyLinked) {
        accounts.push({
          provider: "facebook",
          providerAccountId,
          emailVerified: true,
        });
        await updateAdmin(existingUser.id, {
          accounts,
          avatar: existingUser.avatar || avatar,
        });
      }

      userToLogin = (await getAdminById(existingUser.id))!;
    } else {
      // Create new customer in MongoDB
      userToLogin = await createAdmin({
        name,
        email,
        role: "Customer",
        status: "active",
        avatar,
        accounts: [{ provider: "facebook", providerAccountId, emailVerified: true }],
      });
    }

    // Generate standard session token
    const token = generateToken(userToLogin);

    const redirectResponse = NextResponse.redirect(`${siteUrl}/my-account`);
    redirectResponse.cookies.set("admin_token", token, AUTH_COOKIE);
    redirectResponse.cookies.delete("oauth_state");

    return redirectResponse;
  } catch (err) {
    console.error("Facebook OAuth error:", err);
    const errorMsg = encodeURIComponent("An unexpected error occurred during Facebook authentication.");
    return NextResponse.redirect(`${siteUrl}/login?error=${errorMsg}`);
  }
}
