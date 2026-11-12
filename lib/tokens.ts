import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export type TokenType = "EMAIL_VERIFY" | "PASSWORD_RESET";

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a one-time token. The raw token is returned ONLY to the caller
 * (for delivery in the email link) and is never stored — only its SHA-256
 * hash is persisted, so a database leak cannot be replayed into links.
 */
export async function createToken(userId: string, type: TokenType, expiresAt: Date) {
  const rawToken = generateToken();
  const record = await prisma.token.create({
    data: { userId, type, token: hashToken(rawToken), expiresAt },
  });
  return { ...record, token: rawToken };
}

/**
 * Look up a one-time token, validate it for the given type and mark it used.
 * Returns the token record or null when it is missing/expired/already used.
 */
export async function consumeToken(token: string, type: TokenType) {
  const record = await prisma.token.findUnique({ where: { token: hashToken(token) } });
  if (!record || record.type !== type || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return null;
  }
  await prisma.token.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return record;
}
