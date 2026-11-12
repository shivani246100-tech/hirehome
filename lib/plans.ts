export type PlanId = "FREE" | "STANDARD" | "FEATURED" | "PREMIUM";

export type JobPlan = {
  id: PlanId;
  name: string;
  price: number;
  posts: number;
  days: number;
  featured: boolean;
  tagline: string;
  features: string[];
  popular?: boolean;
};

export const JOB_PLANS: Record<PlanId, JobPlan> = {
  FREE: {
    id: "FREE",
    name: "Free",
    price: 0,
    posts: 1,
    days: 20,
    featured: false,
    tagline: "Try HiroHome with one free job post.",
    features: [
      "1 job post",
      "Live for 20 days",
      "Unlimited hiring — no per-hire fee",
      "Free candidate applications",
      "Built-in interview tools",
    ],
  },
  STANDARD: {
    id: "STANDARD",
    name: "Standard",
    price: 499,
    posts: 5,
    days: 45,
    featured: false,
    tagline: "For small teams with a few open roles.",
    features: [
      "5 job posts",
      "Live for 45 days",
      "Unlimited hiring — no per-hire fee",
      "Standard placement in job search",
      "Applicant dashboard + interviews",
    ],
  },
  FEATURED: {
    id: "FEATURED",
    name: "Featured",
    price: 999,
    posts: 10,
    days: 60,
    featured: true,
    tagline: "Best value for growing teams.",
    features: [
      "10 job posts",
      "Live for 60 days",
      "Featured badge + homepage placement",
      "Priority ranking in search",
      "Unlimited hiring — no per-hire fee",
    ],
    popular: true,
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    price: 2099,
    posts: 50,
    days: 365,
    featured: true,
    tagline: "For companies hiring all year round.",
    features: [
      "50 job posts",
      "Live for 1 full year",
      "Everything in Featured",
      "Top of category pages",
      "Priority employer support",
    ],
  },
};

export const PLAN_LIST = [
  JOB_PLANS.FREE,
  JOB_PLANS.STANDARD,
  JOB_PLANS.FEATURED,
  JOB_PLANS.PREMIUM,
];

export function getPlan(plan: string): JobPlan {
  return JOB_PLANS[(plan as PlanId) in JOB_PLANS ? (plan as PlanId) : "STANDARD"];
}

export function daysLeftLabel(date: Date | string) {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return "expired";
  return `${Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)))} days left`;
}

export function planExpiresAt(paidAt: Date | null | undefined, plan: JobPlan, fallback = new Date()) {
  const base = paidAt ?? fallback;
  return new Date(base.getTime() + plan.days * 24 * 60 * 60 * 1000);
}

export type CandidatePlan = {
  id: "PRO_MONTHLY" | "PRO_YEARLY";
  name: string;
  price: number;
  days: number;
  billing: string;
  tagline: string;
  features: string[];
  popular?: boolean;
};

export const CANDIDATE_PLANS: Record<CandidatePlan["id"], CandidatePlan> = {
  PRO_MONTHLY: {
    id: "PRO_MONTHLY",
    name: "HiroHome Pro",
    price: 199,
    days: 30,
    billing: "per month",
    tagline: "Get noticed by hiring teams first.",
    features: [
      "Pro badge on every application",
      "Priority placement in applicant lists",
      "Unlimited interview practice tests",
      "Resume review checklist",
      "Early access to new jobs",
    ],
  },
  PRO_YEARLY: {
    id: "PRO_YEARLY",
    name: "HiroHome Pro",
    price: 999,
    days: 365,
    billing: "per year",
    tagline: "Two months free, priority all year.",
    features: [
      "Everything in monthly Pro",
      "Save ₹1,389 vs monthly",
      "Priority support",
      "Profile highlighted to employers",
    ],
    popular: true,
  },
};

export const CANDIDATE_PLAN_LIST = [CANDIDATE_PLANS.PRO_MONTHLY, CANDIDATE_PLANS.PRO_YEARLY];

export function getCandidatePlan(plan: string): CandidatePlan | null {
  if (plan === "PRO_MONTHLY" || plan === "PRO_YEARLY") return CANDIDATE_PLANS[plan];
  return null;
}

export function isPremiumMember(user: { premiumUntil?: Date | null } | null | undefined) {
  if (!user?.premiumUntil) return false;
  return new Date(user.premiumUntil).getTime() > Date.now();
}
