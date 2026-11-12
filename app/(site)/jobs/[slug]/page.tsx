import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Globe2,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ApplyForm } from "@/components/apply-form";
import { ReportJobButton } from "@/components/report-job-button";
import { JobCard } from "@/components/job-card";
import { StatusBadge } from "@/components/status-badge";
import { CategoryIcon } from "@/components/category-icon";
import { formatDate, formatSalary, initials, jobTypeLabel, parseSkills, splitLines } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth";
import { isPremiumMember } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await prisma.job.findUnique({
    where: { slug },
    include: { employer: { select: { companyName: true, name: true } } },
  });
  if (!job) return { title: "Job not found" };
  const companyName = job.employer.companyName ?? job.employer.name;
  const title = `${job.title} at ${companyName}`;
  const description = `${job.title} — remote work for ${companyName}, India. Salary ${job.salaryMin ? `from ₹${job.salaryMin.toLocaleString("en-IN")} ` : ""}shown upfront. Apply free on HiroHome.`;
  return {
    title: job.title,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      title: `${title} · HiroHome`,
      description,
      url: `/jobs/${job.slug}`,
      type: "article",
    },
    twitter: { card: "summary", title: `${title} · HiroHome`, description },
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSessionUser();

  const job = await prisma.job.findUnique({
    where: { slug },
    include: {
      employer: true,
      category: true,
      _count: { select: { applications: true } },
    },
  });

  if (!job) notFound();

  const isOwner = session?.id === job.employerId || session?.role === "ADMIN";
  if (job.status !== "ACTIVE" && !isOwner) notFound();

  const [relatedJobs, application, savedResumes, uploadedFiles, account] = await Promise.all([
    prisma.job.findMany({
      where: {
        status: "ACTIVE",
        id: { not: job.id },
        ...(job.categoryId ? { categoryId: job.categoryId } : {}),
      },
      include: {
        employer: { select: { name: true, companyName: true, isVerified: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { applications: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    session?.role === "SEEKER"
      ? prisma.application.findUnique({
          where: { jobId_seekerId: { jobId: job.id, seekerId: session.id } },
        })
      : Promise.resolve(null),
    session?.role === "SEEKER"
      ? prisma.resume.findMany({
          where: { userId: session.id },
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, status: true },
        })
      : Promise.resolve([]),
    session?.role === "SEEKER"
      ? prisma.resumeFile.findMany({
          where: { userId: session.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, originalName: true, size: true },
        })
      : Promise.resolve([]),
    session?.role === "SEEKER"
      ? prisma.user.findUnique({ where: { id: session.id }, select: { premiumUntil: true } })
      : Promise.resolve(null),
  ]);

  const pro = isPremiumMember(account);
  const resumeOptions = savedResumes.map((resume) => ({
    ...resume,
    unlocked: resume.status === "PAID" || pro,
  }));

  const companyName = job.employer.companyName ?? job.employer.name;
  const skills = parseSkills(job.skills);
  const responsibilities = splitLines(job.responsibilities);
  const requirements = splitLines(job.requirements);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const employmentTypeMap: Record<string, string> = {
    FULL_TIME: "FULL_TIME",
    PART_TIME: "PART_TIME",
    CONTRACT: "CONTRACTOR",
    INTERNSHIP: "INTERN",
    FREELANCE: "OTHER",
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `${job.description}\n\nResponsibilities:\n${job.responsibilities}\n\nRequirements:\n${job.requirements}`,
    identifier: { "@type": "PropertyValue", name: "HiroHome", value: job.slug },
    datePosted: job.createdAt.toISOString(),
    ...(job.expiresAt ? { validThrough: job.expiresAt.toISOString() } : {}),
    employmentType: employmentTypeMap[job.jobType] ?? "OTHER",
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
      ...(job.employer.companyWebsite ? { sameAs: job.employer.companyWebsite } : {}),
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: { "@type": "Country", name: "India" },
    ...(job.salaryMin || job.salaryMax
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: {
              "@type": "QuantitativeValue",
              ...(job.salaryMin ? { minValue: job.salaryMin } : {}),
              ...(job.salaryMax ? { maxValue: job.salaryMax } : {}),
              unitText: job.salaryPeriod === "YEAR" ? "YEAR" : "MONTH",
            },
          },
        }
      : {}),
    directApply: true,
    url: `${appUrl}/jobs/${job.slug}`,
  };
  const jsonLdSafe = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <div className="bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe }}
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-4">
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-600">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all jobs
          </Link>
        </div>
      </div>

      <div className="container-page py-8">
        {job.status !== "ACTIVE" && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            This job is <strong>{job.status === "PENDING_PAYMENT" ? "awaiting payment" : job.status.toLowerCase()}</strong> and is only visible to you.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <section className="card overflow-hidden">
              <div className="border-b border-slate-100 bg-gradient-to-br from-brand-50/80 via-white to-white p-6 sm:p-8">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-md">
                    {initials(companyName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {job.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                          <Sparkles className="h-3 w-3" /> Featured
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        <MapPin className="h-3 w-3" /> Work from home
                      </span>
                      {job.status !== "ACTIVE" && <StatusBadge status={job.status} />}
                    </div>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                      {job.title}
                    </h1>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">{companyName}</span>
                      {job.employer.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600">
                          <BadgeCheck className="h-3.5 w-3.5" /> Verified employer
                        </span>
                      )}
                      {job.category && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs">{job.category.name}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: IndianRupee, label: "Salary", value: formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod) },
                    { icon: BriefcaseBusiness, label: "Job type", value: jobTypeLabel(job.jobType) },
                    { icon: CalendarClock, label: "Experience", value: job.experienceMin === 0 && (!job.experienceMax || job.experienceMax <= 2) ? "Freshers welcome" : `${job.experienceMin}–${job.experienceMax ?? job.experienceMin + 2} years` },
                    { icon: Users, label: "Openings", value: `${job.openings} position${job.openings === 1 ? "" : "s"}` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-100 bg-white/80 p-3">
                      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        <item.icon className="h-3 w-3" /> {item.label}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8 p-6 sm:p-8">
                <section>
                  <h2 className="text-base font-bold text-slate-900">About the role</h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
                    {job.description.split("\n\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                {responsibilities.length > 0 && (
                  <section>
                    <h2 className="text-base font-bold text-slate-900">What you’ll do</h2>
                    <ul className="mt-3 space-y-2.5">
                      {responsibilities.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {requirements.length > 0 && (
                  <section>
                    <h2 className="text-base font-bold text-slate-900">What we’re looking for</h2>
                    <ul className="mt-3 space-y-2.5">
                      {requirements.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {skills.length > 0 && (
                  <section>
                    <h2 className="text-base font-bold text-slate-900">Skills</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">About {companyName}</h2>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        {job.employer.companyAbout ??
                          `${companyName} is hiring remote talent through HiroHome.`}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500">
                        {job.employer.companyWebsite && (
                          <a
                            href={job.employer.companyWebsite}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
                          >
                            <Globe2 className="h-3.5 w-3.5" /> Company website
                          </a>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Reviewed by HiroHome
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" /> Posted {formatDate(job.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <p className="text-[11px] leading-relaxed text-slate-400">
                  HiroHome never asks candidates for payment. If this employer asks you for money,
                  please report it to hello@hirohome.in immediately.
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Monthly salary</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-950">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  {job._count.applications} applied
                </span>
              </div>

              <div className="mt-4">
                <ApplyForm
                  jobId={job.id}
                  jobSlug={job.slug}
                  jobTitle={job.title}
                  companyName={companyName}
                  isLoggedIn={Boolean(session)}
                  role={session?.role ?? null}
                  existingStatus={application?.status ?? null}
                  resumes={resumeOptions}
                  files={uploadedFiles}
                />
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Free to apply — no charges
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-slate-400" /> Usually replies within 3–5 days
                </p>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <ReportJobButton jobId={job.id} jobTitle={job.title} />
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Job overview</h3>
              <dl className="mt-3 space-y-3 text-xs">
                {[
                  { label: "Work mode", value: "Work from home" },
                  { label: "Location", value: job.location },
                  { label: "Job type", value: jobTypeLabel(job.jobType) },
                  { label: "Experience", value: `${job.experienceMin}${job.experienceMax ? `–${job.experienceMax}` : "+"} years` },
                  { label: "Openings", value: String(job.openings) },
                  { label: "Category", value: job.category?.name ?? "General" },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3">
                    <dt className="text-slate-500">{row.label}</dt>
                    <dd className="text-right font-semibold text-slate-800">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        {relatedJobs.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Similar work-from-home jobs</h2>
              <Link href="/jobs" className="text-xs font-semibold text-brand-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedJobs.map((related) => (
                <JobCard key={related.slug} job={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
