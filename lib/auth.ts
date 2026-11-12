import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
const DEV_JWT_SECRET = "hirohome-dev-secret";
const JWT_EXPIRES_IN = "7d";

if (process.env.NODE_ENV === "production") {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in production. Add it to the environment and restart.");
  }
  if (JWT_SECRET.length < 32 || JWT_SECRET.toLowerCase() === "change-me-in-production" || JWT_SECRET.toLowerCase() === "change-this-to-a-long-random-string") {
    throw new Error("JWT_SECRET is too weak for production. Use at least 32 random characters (e.g. openssl rand -base64 48).");
  }
}

const secret = JWT_SECRET ?? DEV_JWT_SECRET;

export const AUTH_COOKIE = "hirohome_token";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "SEEKER" | "EMPLOYER" | "ADMIN";
};

export type Role = SessionUser["role"];

export function signSession(user: SessionUser) {
  return jwt.sign(user, secret, { expiresIn: JWT_EXPIRES_IN });
}

export function verifySession(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & Partial<SessionUser>;
    if (!decoded?.id || !decoded?.role) return null;
    return {
      id: decoded.id,
      email: decoded.email ?? "",
      name: decoded.name ?? "",
      role: decoded.role as Role,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.id },
    include: { profile: true },
  });
}

export function getRequestUser(request: NextRequest): SessionUser | null {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function dashboardPathForRole(role: string) {
  if (role === "EMPLOYER") return "/dashboard/employer";
  if (role === "ADMIN") return "/dashboard/admin";
  return "/dashboard/seeker";
}
