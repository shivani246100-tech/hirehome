import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/tokens";
import { sendEmail, buildActionUrl } from "@/lib/email";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter a valid email address" }, { status: 400 });
    }

    const forgotLimit = rateLimit(`forgot:${parsed.data.email}`, RATE_LIMITS.passwordReset.windowMs, RATE_LIMITS.passwordReset.max);
    if (!forgotLimit.allowed) {
      return NextResponse.json({ error: "Too many password reset requests. Please try again later." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      const token = await createToken(user.id, "PASSWORD_RESET", new Date(Date.now() + 30 * 60 * 1000));
      const url = buildActionUrl("/reset-password", token.token);
      await sendEmail({
        to: user.email,
        subject: "Reset your HiroHome password",
        text: "We received a request to reset your HiroHome account password. Use the secure link below to choose a new one.",
        url,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a password reset link was sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Could not process the reset request. Please try again." }, { status: 500 });
  }
}
