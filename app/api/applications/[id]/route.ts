import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["UNDER_REVIEW", "INTERVIEW", "OFFERED", "REJECTED"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  if (user.role !== "EMPLOYER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only employers can update applications" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid application status" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: { select: { employerId: true } } },
    });
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (user.role !== "ADMIN" && application.job.employerId !== user.id) {
      return NextResponse.json({ error: "You can only manage your own applicants" }, { status: 403 });
    }

    await prisma.application.update({ where: { id }, data: { status: parsed.data.status } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Could not update the application" }, { status: 500 });
  }
}
