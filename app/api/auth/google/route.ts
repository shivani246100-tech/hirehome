import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { buildGoogleAuthUrl, googleEnabled } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  if (!googleEnabled) {
    return NextResponse.redirect(new URL("/login?error=google-not-configured", origin));
  }

  const role = request.nextUrl.searchParams.get("role") === "employer" ? "EMPLOYER" : "SEEKER";
  const state = crypto.randomBytes(20).toString("hex");

  const response = NextResponse.redirect(buildGoogleAuthUrl({ origin, state }));
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  };
  response.cookies.set("hirohome_oauth_state", state, options);
  response.cookies.set("hirohome_oauth_role", role, options);
  return response;
}
