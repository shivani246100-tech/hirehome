import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  action: z.enum(["review", "dismiss"]),
});

/** Admin: mark a job report reviewed, or dismiss it. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getRequestUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const report = await prisma.jobReport.findUnique({ where: { id } });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    await prisma.jobReport.update({
      where: { id },
      data: { status: parsed.data.action === "review" ? "REVIEWED" : "DISMISSED" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin report update error:", error);
    return NextResponse.json({ error: "Could not update the report" }, { status: 500 });
  }
}
