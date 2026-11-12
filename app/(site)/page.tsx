import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  FileText,
  IndianRupee,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Video,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/job-card";
import { CategoryIcon } from "@/components/category-icon";
import { PLAN_LIST } from "@/lib/plans";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const popularSearches = [
  { label: "Customer support", href: "/jobs?category=customer-support" },
  { label: "Data entry", href: "/jobs?category=data-entry" },
  { label: "Content writing", href: "/jobs?category=content-writing" },
  { label: "Telecalling", href: "/jobs?category=telecalling" },
];

const faqs = [
  {
    q: "Is HiroHome free for job seekers?",
    a: "Yes. Creating a profile, applying to jobs and attending interviews is completely free for candidates. Employers pay for job postings, which is how we keep the platform running. We never ask candidates to pay to get a job.",
  },
  {
    q: "How does the in-app interview work?",
    a: "When an employer shortlists you, they can schedule a video interview or an in-app skills assessment. You will see it in your dashboard with the date, time and a start button. Assessments are timed and scored automatically.",
  },
  {
    q: "Are these real work-from-home jobs?",
    a: "Every employer is reviewed before their job goes live, and every listing includes a company profile, salary range and clear requirements. If a listing ever asks you for money, report it to hello@hirohome.in and we will remove it.",
  },
  {
    q: "How do employers post a job?",
    a: "Create an employer account, add the role details and pick a posting pack. Your first job post is free for 20 days; paid packs start at ₹499 for 5 posts. Jobs go live instantly and you can manage applicants and interviews from your dashboard.",
  },
];

export default async function HomePage() {
  const [fetchedJobs, categories, liveJobs, verifiedEmployers, applicationsCount] = await Promise.all([
    prisma.job.findMany({
      where: { status: "ACTIVE" },
      include: {
        employer: { select: { name: true, companyName: true, isVerified: true } },
        category: { select: { name: true, slug: true, icon: true } },
        _count: { select: { applications: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.category.findMany({
      include: { _count: { select: { jobs: { where: { status: "ACTIVE" } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.job.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "EMPLOYER", isVerified: true } }),
    prisma.application.count(),
  ]);

  const heroJob = fetchedJobs[0] ?? null;
  const verifiedEmployersWithJobs = await prisma.user.findMany({
    where: { role: "EMPLOYER", isVerified: true, jobs: { some: { status: "ACTIVE" } } },
    select: { companyName: true, name: true },
    take: 5,
  });
  const companies = verifiedEmployersWithJobs
    .map((employer) => employer.companyName || employer.name)
    .filter(Boolean) as string[];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-brand-50/70 via-white to-white">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

        <div className="container-page relative grid items-center gap-14 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Verified work-from-home jobs · Hiring now
            </span>

            <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">
              Ghar se kaam.
              <span className="mt-1 block bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 bg-clip-text text-transparent">
                Sach mein.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Real work-from-home jobs from verified companies. Apply in minutes, track every
              application and attend interviews right inside HiroHome — without paying a single rupee.
            </p>

            <form action="/jobs" className="mt-8 max-w-xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/5 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="q"
                    placeholder="Search role, skill or company"
                    className="w-full rounded-xl border-0 bg-transparent py-3 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400"
                    aria-label="Search jobs"
                  />
                </div>
                <select
                  name="category"
                  className="select rounded-xl border-0 bg-slate-50 sm:w-44"
                  aria-label="Category"
                  defaultValue=""
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-primary shrink-0 rounded-xl px-5">
                  Search jobs
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Popular:</span>
              {popularSearches.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-slate-200/80 pt-6">
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{liveJobs}</p>
                <p className="text-xs text-slate-500">live work-from-home roles</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{verifiedEmployers}</p>
                <p className="text-xs text-slate-500">verified hiring teams</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="flex items-center gap-1 text-2xl font-extrabold text-slate-900">
                  <IndianRupee className="h-5 w-5" />0
                </p>
                <p className="text-xs text-slate-500">cost to apply, always</p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute inset-0 -rotate-3 rounded-[2rem] bg-gradient-to-br from-brand-100 via-white to-emerald-50" />
            <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                    {heroJob ? (heroJob.employer.companyName || heroJob.employer.name).slice(0, 2).toUpperCase() : "HH"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{heroJob?.title ?? "Work-from-home roles"}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      {heroJob ? heroJob.employer.companyName || heroJob.employer.name : "Verified employers"}
                      {heroJob?.employer.isVerified ? <BadgeCheck className="h-3.5 w-3.5 text-brand-500" /> : null}
                    </p>
                  </div>
                </div>
                {heroJob?.isFeatured ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    Featured
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                  Work from home
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                  Salary shown upfront
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                  {heroJob && heroJob.experienceMin > 0 ? `${heroJob.experienceMin}+ yrs exp.` : "Freshers welcome"}
                </span>
              </div>

              {heroJob ? (
                <div className="mt-4 space-y-2.5 rounded-xl bg-slate-50 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Salary</span>
                    <span className="font-bold text-slate-900">
                      {heroJob.salaryMin
                        ? `₹${heroJob.salaryMin.toLocaleString("en-IN")} – ₹${(heroJob.salaryMax ?? 0).toLocaleString("en-IN")} / month`
                        : "Discussed on interview"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Location</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="h-3 w-3" /> {heroJob.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Openings</span>
                    <span className="font-semibold text-slate-700">
                      {heroJob.openings} position{heroJob.openings === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-center text-xs text-slate-500">
                  Salary, location and openings on every listing — no hidden surprises.
                </div>
              )}

              <Link href="/jobs" className="btn-primary mt-4 w-full">
                Apply in 2 minutes <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Employer verified by HiroHome · No fee from candidates
              </div>
            </div>

            <div className="animate-float absolute -left-6 bottom-20 hidden w-52 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl sm:block">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Video className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold text-slate-900">Interview scheduled</p>
                  <p className="text-[10px] text-slate-500">Tomorrow, 11:00 AM</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-3/4 rounded-full bg-brand-500" />
              </div>
              <p className="mt-2 text-[10px] font-medium text-emerald-600">Assessment ready to start</p>
            </div>

            <div className="absolute -right-3 -top-5 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:flex">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-[11px] font-bold text-slate-800">Offer received</span>
            </div>
          </div>
        </div>

        {companies.length > 0 && (
          <div className="border-t border-slate-200/70 bg-white/70 py-4 backdrop-blur">
            <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Verified employers hiring on HiroHome
              </span>
              {companies.map((company) => (
                <span key={company} className="text-sm font-bold text-slate-400/90">
                  {company}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Featured jobs */}
      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-kicker">
              <Sparkles className="h-3.5 w-3.5" /> Fresh openings
            </span>
            <h2 className="section-title">Work-from-home jobs, hiring today</h2>
            <p className="muted mt-2 max-w-2xl">
              Hand-picked roles from verified employers. Salary is always shown upfront.
            </p>
          </div>
          <Link href="/jobs" className="btn-secondary btn-sm">
            View all jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fetchedJobs.map((job) => (
            <JobCard key={job.slug} job={job} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-slate-100 bg-slate-50/70 py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-kicker">Browse by role</span>
            <h2 className="section-title">Find the work that fits your life</h2>
            <p className="muted mt-3">
              {applicationsCount}+ applications have already been started on HiroHome. Pick a
              category and see who is hiring right now.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/jobs?category=${category.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <CategoryIcon icon={category.icon} className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-900">{category.name}</p>
                <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{category.blurb}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                  {category._count.jobs} open role{category._count.jobs === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container-page scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-kicker">How HiroHome works</span>
          <h2 className="section-title">From application to offer, in one place</h2>
          <p className="muted mt-3">
            No scattered emails or mystery callbacks. Everything happens inside your HiroHome
            dashboard.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                <BriefcaseBusiness className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">For job seekers</h3>
                <p className="text-xs text-slate-500">Free, forever</p>
              </div>
            </div>
            <ol className="mt-6 space-y-5">
              {[
                {
                  title: "Create your free profile",
                  text: "Add your skills, experience and resume link. It takes about two minutes.",
                },
                {
                  title: "Apply to verified remote jobs",
                  text: "Filter by category, salary and experience. Every listing shows the salary range.",
                },
                {
                  title: "Attend the interview in-app",
                  text: "Get shortlisted, complete a timed assessment or join a video interview from your dashboard.",
                },
                {
                  title: "Track your offer",
                  text: "See every application status in real time — from applied to interview to offer.",
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/register" className="btn-primary mt-7 w-full sm:w-auto">
              Find your next job <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-600/30 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">For employers</h3>
                  <p className="text-xs text-slate-400">Hire verified remote talent</p>
                </div>
              </div>
              <ol className="mt-6 space-y-5">
                {[
                  {
                    title: "Post your role in 3 minutes",
                    text: "Add the role details, salary range and skills. Preview it before going live.",
                  },
                  {
                    title: "Choose a posting plan",
                    text: "Pay securely by UPI, card or netbanking. Your listing goes live instantly.",
                  },
                  {
                    title: "Review real applicants",
                    text: "Shortlist candidates, read cover letters and download resumes.",
                  },
                  {
                    title: "Interview and hire",
                    text: "Schedule video interviews or send a scored skills assessment — all in-app.",
                  },
                ].map((step, index) => (
                  <li key={step.title} className="flex gap-3.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link href="/register?role=employer" className="btn mt-7 w-full bg-white text-slate-900 hover:bg-slate-100 sm:w-auto">
                Post a job <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-slate-100 bg-gradient-to-b from-white to-brand-50/40 py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-kicker">Built for honest hiring</span>
            <h2 className="section-title">Why candidates and employers choose HiroHome</h2>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Verified employers",
                text: "Every hiring team is reviewed before a job goes live. No fake listings, no pay-to-join scams.",
              },
              {
                icon: FileText,
                title: "Transparent salaries",
                text: "Every role shows a real salary range and clear requirements before you apply.",
              },
              {
                icon: Video,
                title: "Interviews in-app",
                text: "Video interviews and timed assessments are built in. No third-party links to chase.",
              },
              {
                icon: IndianRupee,
                title: "Free for candidates",
                text: "Applying, interviewing and getting hired is free. Employers pay only for job postings.",
              },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3.5 text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container-page scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-kicker">
            <IndianRupee className="h-3.5 w-3.5" /> Employer pricing
          </span>
          <h2 className="section-title">Simple plans. Hire without the agency fee.</h2>
          <p className="muted mt-3">
            Buy a posting pack, hire as many people as you want. No long contracts, no per-hire
            commission. Candidates always apply for free.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLAN_LIST.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
                plan.popular
                  ? "border-brand-300 shadow-xl shadow-brand-900/10 lg:-mt-3 lg:mb-3"
                  : "border-slate-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {plan.days} days
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{plan.tagline}</p>
              <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950">
                {plan.price === 0 ? "Free" : formatINR(plan.price)}
                <span className="ml-1 text-xs font-medium text-slate-500">
                  {plan.price === 0 ? "to start" : "one-time"}
                </span>
              </p>
              <p className="mt-1 text-xs font-semibold text-brand-700">
                {plan.posts} job post{plan.posts === 1 ? "" : "s"} included
              </p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?role=employer"
                className={`mt-6 w-full ${plan.popular ? "btn-primary" : "btn-secondary"}`}
              >
                {plan.price === 0 ? "Start free" : "Get this plan"} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[11px] text-slate-400">
          Payments are processed securely. GST invoice available on request.
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-100 bg-slate-50/70 py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="section-kicker">Questions</span>
            <h2 className="section-title">Everything you need to know</h2>
            <p className="muted mt-3">
              Still unsure? Write to{" "}
              <a href="mailto:hello@hirohome.in" className="font-semibold text-brand-600 hover:underline">
                hello@hirohome.in
              </a>{" "}
              and a real person will reply.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group card overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 px-6 py-12 text-center text-white shadow-2xl shadow-brand-900/25 sm:px-12 sm:py-16">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-30" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" /> Your next chapter starts at home
            </span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to work from home, for real?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-100">
              Join thousands of candidates finding genuine remote roles — or post your first job and
              start meeting verified talent today.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="btn bg-white text-brand-700 hover:bg-brand-50">
                Create free profile <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register?role=employer" className="btn border border-white/30 bg-white/10 text-white hover:bg-white/20">
                Post a job
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
