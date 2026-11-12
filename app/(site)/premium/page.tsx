import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, Clock3, Crown, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { CANDIDATE_PLAN_LIST, isPremiumMember } from "@/lib/plans";
import { PremiumCheckoutButton } from "@/components/premium-checkout-button";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "HiroHome Pro",
  description:
    "Stand out to verified employers with HiroHome Pro. Priority applications, a Pro badge and unlimited interview practice. Applications stay free.",
};

export const dynamic = "force-dynamic";

export default async function PremiumPage() {
  const user = await getCurrentUser();
  const premium = isPremiumMember(user);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div className="container-page relative py-14 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
              <Crown className="h-3.5 w-3.5" /> Optional membership
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Get noticed first.
              <span className="block text-brand-600">Get hired faster.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              HiroHome Pro puts your application above the pile and gives you the practice tools to
              walk into interviews with confidence. Applying to jobs will always be free.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        {premium && user?.premiumUntil && (
          <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-900">You’re a Pro member</p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  Active until {new Date(user.premiumUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
                  Your applications carry the Pro badge.
                </p>
                <Link href="/dashboard/seeker" className="btn-secondary btn-sm mt-3 bg-white">
                  Go to dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {CANDIDATE_PLAN_LIST.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
                plan.popular ? "border-brand-300 shadow-xl shadow-brand-900/10" : "border-slate-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Best value
                </span>
              )}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
                <Crown className={plan.popular ? "h-5 w-5 text-amber-500" : "h-5 w-5 text-slate-300"} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{plan.tagline}</p>
              <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950">
                {formatINR(plan.price)}
                <span className="ml-1 text-xs font-medium text-slate-500">{plan.billing}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {!user ? (
                  <Link href={`/login?next=/premium`} className="btn-primary w-full">
                    Log in to upgrade
                  </Link>
                ) : user.role !== "SEEKER" ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-[11px] text-slate-500">
                    Pro is for job-seeker accounts.
                  </div>
                ) : (
                  <PremiumCheckoutButton plan={plan.id} />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
          {[
            {
              icon: TrendingUp,
              title: "Priority placement",
              text: "Employers see Pro candidates at the top of their applicant list.",
            },
            {
              icon: Clock3,
              title: "Early access",
              text: "Hear about new work-from-home roles before they trend.",
            },
            {
              icon: ShieldCheck,
              title: "No pay-to-apply",
              text: "Pro is a career tool. You never pay per application or per interview.",
            },
          ].map((item) => (
            <div key={item.title} className="card p-4">
              <item.icon className="h-4 w-4 text-brand-600" />
              <p className="mt-2 text-xs font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-relaxed text-slate-400">
          <Sparkles className="mr-1 inline h-3 w-3" />
          HiroHome Pro is optional. Every job on HiroHome can be applied to for free, and your profile
          is always visible to employers.
        </p>
      </section>
    </div>
  );
}
