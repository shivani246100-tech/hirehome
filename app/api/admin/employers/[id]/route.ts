import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/auth";

const schema = z.object({ isVerified: z.boolean() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const { id } = await params;

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });

    await prisma.user.update({ where: { id }, data: { isVerified: parsed.data.isVerified } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Verify employer error:", error);
    return NextResponse.json({ error: "Could not update the employer" }, { status: 500 });
  }
}
