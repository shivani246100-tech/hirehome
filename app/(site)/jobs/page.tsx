import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ArrowRight, BriefcaseBusiness, Filter, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/job-card";
import { CategoryIcon } from "@/components/category-icon";
import { jobTypeLabel } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Work-from-home jobs",
  description:
    "Browse verified work-from-home jobs across customer support, data entry, writing, design, development and more. Apply free on HiroHome.",
  alternates: { canonical: "/jobs" },
  openGraph: {
    title: "Work-from-home jobs · HiroHome",
    description:
      "Verified remote jobs across India — salary shown upfront. Apply free, interviews inside the app.",
    url: "/jobs",
  },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    exp?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const categorySlug = params.category?.trim() ?? "";
  const type = params.type?.trim() ?? "";
  const exp = params.exp?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const where: Prisma.JobWhereInput = { status: "ACTIVE" };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { skills: { contains: q } },
      { employer: { companyName: { contains: q } } },
    ];
  }
  if (categorySlug) where.category = { slug: categorySlug };
  if (type) where.jobType = type;
  if (exp === "fresher") where.experienceMin = { lte: 0 };
  if (exp === "1-3") where.experienceMin = { gte: 1, lte: 3 };
  if (exp === "3plus") where.experienceMin = { gte: 3 };

  const include = {
    employer: { select: { name: true, companyName: true, isVerified: true } },
    category: { select: { name: true, slug: true } },
    _count: { select: { applications: true } },
  } as const;

  const [jobs, total, categories] = await Promise.all([
    prisma.job.findMany({
      where,
      include,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.job.count({ where }),
    prisma.category.findMany({
      include: { _count: { select: { jobs: { where: { status: "ACTIVE" } } } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCategory = categories.find((category) => category.slug === categorySlug);

  function linkFor(next: { category?: string; type?: string; exp?: string; page?: number }) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    const nextCategory = next.category === undefined ? categorySlug : next.category;
    const nextType = next.type === undefined ? type : next.type;
    const nextExp = next.exp === undefined ? exp : next.exp;
    if (nextCategory) search.set("category", nextCategory);
    if (nextType) search.set("type", nextType);
    if (nextExp) search.set("exp", nextExp);
    if (next.page && next.page > 1) search.set("page", String(next.page));
    const query = search.toString();
    return `/jobs${query ? `?${query}` : ""}`;
  }

  const filterActive = Boolean(q || categorySlug || type || exp);

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50/80 to-white">
        <div className="container-page py-10 sm:py-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-[11px] font-bold text-brand-700">
              <MapPin className="h-3.5 w-3.5" /> {total} work-from-home role{total === 1 ? "" : "s"} live
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {activeCategory ? activeCategory.name : "Find your work-from-home job"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Verified employers. Salary shown upfront. Apply free and attend interviews right here.
            </p>
          </div>

          <form action="/jobs" className="mt-6 max-w-2xl">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {type && <input type="hidden" name="type" value={type} />}
            {exp && <input type="hidden" name="exp" value={exp} />}
            <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search by role, skill or company"
                  className="w-full border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
                  aria-label="Search jobs"
                />
              </div>
              <button className="btn-primary shrink-0">Search</button>
            </div>
          </form>

          {filterActive && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Active filters:</span>
              {q && (
                <Link href={linkFor({})} className="chip">
                  “{q}” <X className="h-3 w-3" />
                </Link>
              )}
              {activeCategory && (
                <Link href={linkFor({ category: "" })} className="chip">
                  {activeCategory.name} <X className="h-3 w-3" />
                </Link>
              )}
              {type && (
                <Link href={linkFor({ type: "" })} className="chip">
                  {jobTypeLabel(type)} <X className="h-3 w-3" />
                </Link>
              )}
              {exp && (
                <Link href={linkFor({ exp: "" })} className="chip">
                  {exp === "fresher" ? "Fresher friendly" : exp === "1-3" ? "1–3 years" : "3+ years"}{" "}
                  <X className="h-3 w-3" />
                </Link>
              )}
              <Link href="/jobs" className="text-[11px] font-semibold text-brand-600 hover:underline">
                Clear all
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="container-page py-8">
        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="hidden lg:block">
            <div className="card sticky top-24 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </p>

              <div className="mt-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Category</p>
                <div className="max-h-72 space-y-0.5 overflow-y-auto pr-1 scrollbar-thin">
                  <Link
                    href={linkFor({ category: "" })}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                      !categorySlug ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All categories
                    <span className="text-[10px] text-slate-400">{total}</span>
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={linkFor({ category: category.slug })}
                      className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs transition ${
                        categorySlug === category.slug
                          ? "bg-brand-50 font-semibold text-brand-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <CategoryIcon icon={category.icon} className="h-3.5 w-3.5" />
                        {category.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{category._count.jobs}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Job type</p>
                <div className="space-y-1">
                  {[
                    { value: "", label: "Any type" },
                    { value: "FULL_TIME", label: "Full time" },
                    { value: "PART_TIME", label: "Part time" },
                    { value: "CONTRACT", label: "Contract" },
                    { value: "INTERNSHIP", label: "Internship" },
                    { value: "FREELANCE", label: "Freelance" },
                  ].map((option) => (
                    <Link
                      key={option.label}
                      href={linkFor({ type: option.value })}
                      className={`block rounded-lg px-2.5 py-1.5 text-xs transition ${
                        type === option.value
                          ? "bg-brand-50 font-semibold text-brand-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Experience</p>
                <div className="space-y-1">
                  {[
                    { value: "", label: "Any experience" },
                    { value: "fresher", label: "Fresher friendly" },
                    { value: "1-3", label: "1–3 years" },
                    { value: "3plus", label: "3+ years" },
                  ].map((option) => (
                    <Link
                      key={option.label}
                      href={linkFor({ exp: option.value })}
                      className={`block rounded-lg px-2.5 py-1.5 text-xs transition ${
                        exp === option.value
                          ? "bg-brand-50 font-semibold text-brand-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-900">{jobs.length}</span> of{" "}
                <span className="font-bold text-slate-900">{total}</span> jobs
              </p>
              <details className="relative lg:hidden">
                <summary className="btn-secondary btn-sm list-none [&::-webkit-details-marker]:hidden">
                  <Filter className="h-4 w-4" /> Filters
                </summary>
                <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Category</p>
                  <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                    <Link href={linkFor({ category: "" })} className="block rounded-lg px-2 py-1.5 text-xs text-slate-600">
                      All categories
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={linkFor({ category: category.slug })}
                        className={`block rounded-lg px-2 py-1.5 text-xs ${
                          categorySlug === category.slug ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600"
                        }`}
                      >
                        {category.name} ({category._count.jobs})
                      </Link>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Job type</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"].map((value) => (
                      <Link key={value || "any"} href={linkFor({ type: value })} className={`chip text-[10px] ${type === value ? "border-brand-300 bg-brand-50 text-brand-700" : ""}`}>
                        {value ? jobTypeLabel(value) : "Any"}
                      </Link>
                    ))}
                  </div>
                </div>
              </details>
            </div>

            {jobs.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.slug} job={job} />
                ))}
              </div>
            ) : total === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-500">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-slate-900">No jobs posted yet — be the first</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  HiroHome is live with verified employers hiring work-from-home talent. Employers can
                  post their first role today; candidates always apply for free.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <Link href="/register?role=employer" className="btn-primary">
                    Post a job
                  </Link>
                  <Link href="/contact" className="btn-secondary">
                    Contact us
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                  <Search className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-slate-900">No jobs match your filters</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Try a different search term or clear the filters to see all open roles.
                </p>
                <Link href="/jobs" className="btn-primary mt-5">
                  Clear filters <X className="h-4 w-4" />
                </Link>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link href={linkFor({ page: page - 1 })} className="btn-secondary btn-sm">
                    Previous
                  </Link>
                )}
                <span className="px-2 text-xs text-slate-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={linkFor({ page: page + 1 })} className="btn-secondary btn-sm">
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
