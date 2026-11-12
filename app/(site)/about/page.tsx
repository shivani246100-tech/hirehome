import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, HeartHandshake, ShieldCheck, Sparkles, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "About HiroHome",
  description:
    "HiroHome is India's honest work-from-home job marketplace — verified employers, transparent salaries, and interviews inside the app. Candidates never pay to apply.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-14">
          <span className="section-kicker">About us</span>
          <h1 className="section-title mt-3 max-w-3xl text-3xl sm:text-4xl">
            Honest work-from-home hiring, built for India.
          </h1>
          <p className="muted mt-4 max-w-2xl">
            HiroHome exists because finding a genuine remote job in India should never mean paying someone. We match
            candidates with verified companies hiring for real, salaried, work-from-home roles — and we interview both
            sides well before we let a listing go live.
          </p>
        </div>
      </div>

      <div className="container-page grid gap-5 py-14 md:grid-cols-2">
        {[
          {
            icon: ShieldCheck,
            title: "Verified employers only",
            text: "Every hiring team is reviewed before its jobs go live. Salary ranges are shown upfront, no mystery callbacks, and we act on every report we receive.",
          },
          {
            icon: Wallet,
            title: "Candidates pay nothing",
            text: "Applying, interviewing, getting hired — free, forever. Employers pay for job postings. That is the whole business model, and it keeps incentives clean.",
          },
          {
            icon: HeartHandshake,
            title: "Work from anywhere in India",
            text: "Tier-2 and tier-3 cities, metros, small towns — if the role is genuinely remote, geography is not a barrier on HiroHome.",
          },
          {
            icon: BadgeCheck,
            title: "Interviews inside the app",
            text: "Scored assessments and video interviews happen right here — no random third-party links, no time-wasting. Candidates see decisions in real time.",
          },
        ].map((item) => (
          <div key={item.title} className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <item.icon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">{item.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="container-page py-14">
          <div className="max-w-3xl">
            <span className="section-kicker">
              <Sparkles className="h-3.5 w-3.5" /> Our promise
            </span>
            <h2 className="section-title mt-3">If someone asks you to pay to get a job — run.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Fake job scams target people looking for dignity and income. Every listing on HiroHome shows the salary
              and the company behind it; verified employers carry a badge; and every post has a "Report this job"
              button. If an employer ever asks you for money, report them and we will remove the listing and ban the
              account. That promise is what HiroHome stands on.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/jobs" className="btn-primary">Browse verified jobs</Link>
              <Link href="/contact" className="btn-secondary">Contact us</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
