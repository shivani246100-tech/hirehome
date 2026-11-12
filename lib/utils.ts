export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSalary(min?: number | null, max?: number | null, period = "MONTH") {
  if (!min && !max) return "Not disclosed";
  const unit = period === "YEAR" ? "year" : period === "HOUR" ? "hour" : "month";
  if (min && max && min !== max) {
    return `${formatINR(min)} – ${formatINR(max)} / ${unit}`;
  }
  return `${formatINR((min ?? max) as number)} / ${unit}`;
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function timeAgo(value: Date | string) {
  const date = new Date(value).getTime();
  const diff = Date.now() - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return formatDate(value);
}

export function parseSkills(value?: string | null) {
  if (!value) return [];
  return value
    .split(/[,•|\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function splitLines(value?: string | null) {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function experienceLabel(min: number, max?: number | null) {
  if (!max || max === min) {
    if (min === 0) return "Fresher friendly";
    return `${min}+ years`;
  }
  return `${min}–${max} years`;
}

export function jobTypeLabel(type: string) {
  const labels: Record<string, string> = {
    FULL_TIME: "Full time",
    PART_TIME: "Part time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    FREELANCE: "Freelance",
  };
  return labels[type] ?? type;
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    APPLIED: "Applied",
    UNDER_REVIEW: "Under review",
    INTERVIEW: "Interview",
    OFFERED: "Offer received",
    REJECTED: "Not selected",
    WITHDRAWN: "Withdrawn",
    PENDING_PAYMENT: "Payment pending",
    ACTIVE: "Active",
    PAUSED: "Paused",
    CLOSED: "Closed",
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    CREATED: "Created",
    PAID: "Paid",
    FAILED: "Failed",
  };
  return labels[status] ?? status;
}

export function profileCompleteness(user: {
  phone?: string | null;
  profile?: {
    headline?: string | null;
    location?: string | null;
    skills?: string | null;
    bio?: string | null;
    resumeUrl?: string | null;
    experienceYears?: number | null;
  } | null;
}) {
  const checks = [
    Boolean(user.phone),
    Boolean(user.profile?.headline),
    Boolean(user.profile?.location),
    Boolean(user.profile?.skills),
    Boolean(user.profile?.bio),
    Boolean(user.profile?.resumeUrl),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
