import Link from "next/link";
import { ArrowUpRight, BadgeCheck, MapPin, Sparkles } from "lucide-react";
import { cn, experienceLabel, formatSalary, initials, jobTypeLabel, parseSkills, timeAgo } from "@/lib/utils";

export type JobCardData = {
  slug: string;
  title: string;
  location: string;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string;
  experienceMin: number;
  experienceMax: number | null;
  skills: string;
  isFeatured: boolean;
  createdAt: Date | string;
  employer: {
    name: string;
    companyName: string | null;
    isVerified: boolean;
  };
  category?: { name: string; slug: string } | null;
  _count?: { applications: number };
};

const avatarStyles = [
  "from-brand-500 to-brand-700",
  "from-emerald-500 to-teal-700",
  "from-orange-400 to-rose-600",
  "from-violet-500 to-purple-700",
  "from-sky-500 to-blue-700",
  "from-pink-500 to-rose-700",
];

function avatarStyle(name: string) {
  const sum = name.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatarStyles[sum % avatarStyles.length];
}

export function JobCard({ job, compact = false }: { job: JobCardData; compact?: boolean }) {
  const company = job.employer.companyName ?? job.employer.name;
  const skills = parseSkills(job.skills).slice(0, compact ? 2 : 3);

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5",
        job.isFeatured ? "border-brand-200 ring-1 ring-brand-100" : "border-slate-200",
      )}
    >
      {job.isFeatured && (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow-sm">
          <Sparkles className="h-3 w-3" /> Featured
        </span>
      )}

      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm",
            avatarStyle(company),
          )}
        >
          {initials(company)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-900 transition group-hover:text-brand-700">
            {job.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
            {company}
            {job.employer.isVerified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-500" />}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand-500" />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
          <MapPin className="h-3 w-3" /> Work from home
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
          {jobTypeLabel(job.jobType)}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
          {experienceLabel(job.experienceMin, job.experienceMax)}
        </span>
      </div>

      {!compact && skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span key={skill} className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div>
          <p className="text-sm font-bold text-slate-900">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">Posted {timeAgo(job.createdAt)}</p>
        </div>
        {job.category && (
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-700">
            {job.category.name}
          </span>
        )}
      </div>
    </Link>
  );
}
