import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE, dashboardPathForRole, sessionCookieOptions, signSession } from "@/lib/auth";
import { exchangeGoogleCode, fetchGoogleUser, googleEnabled } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, origin));

  if (!googleEnabled) return fail("google-not-configured");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("hirohome_oauth_state")?.value;
  const role = request.cookies.get("hirohome_oauth_role")?.value === "EMPLOYER" ? "EMPLOYER" : "SEEKER";

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail("google-state");
  }

  try {
    const token = await exchangeGoogleCode({ code, origin });
    const googleUser = await fetchGoogleUser(token.access_token);

    if (!googleUser.email) return fail("google-email");

    let user = await prisma.user.findUnique({ where: { email: googleUser.email.toLowerCase() } });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      user = await prisma.user.create({
        data: {
          name: googleUser.name?.trim() || googleUser.email.split("@")[0],
          email: googleUser.email.toLowerCase(),
          passwordHash: await bcrypt.hash(randomPassword, 10),
          role,
          isVerified: true,
          ...(role === "SEEKER" ? { profile: { create: {} } } : {}),
        },
      });
    }

    const response = NextResponse.redirect(new URL(dashboardPathForRole(user.role), origin));
    response.cookies.set(
      AUTH_COOKIE,
      signSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as "SEEKER" | "EMPLOYER" | "ADMIN",
      }),
      sessionCookieOptions(),
    );
    response.cookies.set("hirohome_oauth_state", "", { path: "/", maxAge: 0 });
    response.cookies.set("hirohome_oauth_role", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("Google auth error:", error);
    return fail("google-failed");
  }
}
