import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/auth";
import { isPremiumMember } from "@/lib/plans";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const applySchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().max(2000).optional().default(""),
  resumeUrl: z.string().trim().max(500).optional().default(""),
  resumeId: z.string().trim().max(60).optional().default(""),
  resumeFileId: z.string().trim().max(60).optional().default(""),
});

export async function POST(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in to apply" }, { status: 401 });
  }
  if (user.role !== "SEEKER") {
    return NextResponse.json({ error: "Only job-seeker accounts can apply" }, { status: 403 });
  }

  const applyLimit = rateLimit(`apply:${user.id}`, RATE_LIMITS.apply.windowMs, RATE_LIMITS.apply.max);
  if (!applyLimit.allowed) {
    return NextResponse.json({ error: "Too many applications. Please slow down and try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check your application details" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } });
    if (!job || job.status !== "ACTIVE") {
      return NextResponse.json({ error: "This job is no longer accepting applications" }, { status: 404 });
    }

    const existing = await prisma.application.findUnique({
      where: { jobId_seekerId: { jobId: job.id, seekerId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 409 });
    }

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { premiumUntil: true },
    });

    let resumeId: string | null = null;
    let resumeFileId: string | null = null;
    let attachedUrl = "";

    if (parsed.data.resumeFileId) {
      const file = await prisma.resumeFile.findUnique({ where: { id: parsed.data.resumeFileId } });
      if (!file || file.userId !== user.id) {
        return NextResponse.json({ error: "That uploaded resume could not be found" }, { status: 400 });
      }
      resumeFileId = file.id;
      attachedUrl = `/api/resumes/files/${file.id}`;
    } else if (parsed.data.resumeId) {
      const resume = await prisma.resume.findUnique({ where: { id: parsed.data.resumeId } });
      if (!resume || resume.userId !== user.id) {
        return NextResponse.json({ error: "That resume could not be found" }, { status: 400 });
      }
      if (resume.status !== "PAID" && !isPremiumMember(account)) {
        return NextResponse.json(
          { error: "Download this resume once (or upgrade to Pro) before attaching it to a job." },
          { status: 400 },
        );
      }
      resumeId = resume.id;
      attachedUrl = `/api/resumes/${resume.id}/pdf`;
    }

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        seekerId: user.id,
        coverLetter: parsed.data.coverLetter?.trim() || null,
        resumeId,
        resumeFileId,
        // Keep the legacy resumeUrl field in sync so older screens keep working.
        resumeUrl: attachedUrl || parsed.data.resumeUrl?.trim() || profile?.resumeUrl || null,
      },
    });

    return NextResponse.json({ ok: true, applicationId: application.id, status: application.status });
  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json({ error: "Could not submit your application. Please try again." }, { status: 409 });
  }
}
