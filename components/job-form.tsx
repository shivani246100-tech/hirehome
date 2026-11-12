"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { PLAN_LIST, type PlanId } from "@/lib/plans";
import { formatINR } from "@/lib/utils";

type Category = { id: string; name: string };

const jobTypes = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
];

const initialForm = {
  title: "",
  categoryId: "",
  description: "",
  responsibilities: "",
  requirements: "",
  skills: "",
  jobType: "FULL_TIME",
  salaryMin: "",
  salaryMax: "",
  experienceMin: "0",
  experienceMax: "",
  openings: "1",
  plan: "FREE" as PlanId,
};

export function JobForm({ categories, isAdmin = false }: { categories: Category[]; isAdmin?: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedPlan = useMemo(
    () => PLAN_LIST.find((plan) => plan.id === form.plan) ?? PLAN_LIST[0],
    [form.plan],
  );

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          plan: isAdmin ? "FREE" : form.plan,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
          experienceMin: Number(form.experienceMin || 0),
          experienceMax: form.experienceMax ? Number(form.experienceMax) : undefined,
          openings: Number(form.openings || 1),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not create the job");
        return;
      }

      router.push(data.checkoutUrl ?? "/dashboard/employer?posted=1");
      router.refresh();
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <BriefcaseBusiness className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Role basics</h2>
            <p className="text-[11px] text-slate-500">Clear titles and salaries get 3× more applications.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="label">Job title</label>
            <input
              id="title"
              required
              minLength={5}
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="e.g. Customer Support Executive (Hindi)"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="label">Category</label>
            <select
              id="categoryId"
              value={form.categoryId}
              onChange={(event) => update("categoryId", event.target.value)}
              className="select"
            >
              <option value="">General / other</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="jobType" className="label">Job type</label>
            <select
              id="jobType"
              value={form.jobType}
              onChange={(event) => update("jobType", event.target.value)}
              className="select"
            >
              {jobTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="salaryMin" className="label">Monthly salary from (₹)</label>
            <input
              id="salaryMin"
              type="number"
              min={0}
              value={form.salaryMin}
              onChange={(event) => update("salaryMin", event.target.value)}
              placeholder="18000"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="salaryMax" className="label">Monthly salary up to (₹)</label>
            <input
              id="salaryMax"
              type="number"
              min={0}
              value={form.salaryMax}
              onChange={(event) => update("salaryMax", event.target.value)}
              placeholder="26000"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="experienceMin" className="label">Minimum experience (years)</label>
            <input
              id="experienceMin"
              type="number"
              min={0}
              max={30}
              value={form.experienceMin}
              onChange={(event) => update("experienceMin", event.target.value)}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="experienceMax" className="label">Maximum experience (optional)</label>
            <input
              id="experienceMax"
              type="number"
              min={0}
              max={30}
              value={form.experienceMax}
              onChange={(event) => update("experienceMax", event.target.value)}
              placeholder="3"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="openings" className="label">Number of openings</label>
            <input
              id="openings"
              type="number"
              min={1}
              max={500}
              value={form.openings}
              onChange={(event) => update("openings", event.target.value)}
              className="input"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="skills" className="label">Skills (comma separated)</label>
            <input
              id="skills"
              value={form.skills}
              onChange={(event) => update("skills", event.target.value)}
              placeholder="Customer Support, Hindi, English, CRM"
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-900">Job description</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Be specific about the day-to-day work. Mention shift timings and equipment requirements.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="description" className="label">About the role</label>
            <textarea
              id="description"
              required
              minLength={50}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="We are hiring a remote customer support executive to help our customers over chat and email…"
              className="textarea min-h-32"
            />
            <p className="mt-1 text-[10px] text-slate-400">Minimum 50 characters.</p>
          </div>

          <div>
            <label htmlFor="responsibilities" className="label">Responsibilities (one per line)</label>
            <textarea
              id="responsibilities"
              required
              minLength={20}
              value={form.responsibilities}
              onChange={(event) => update("responsibilities", event.target.value)}
              placeholder={"Respond to customer queries over chat and email\nMaintain response quality above 90%\nCoordinate with the operations team"}
              className="textarea min-h-28"
            />
          </div>

          <div>
            <label htmlFor="requirements" className="label">Requirements (one per line)</label>
            <textarea
              id="requirements"
              required
              minLength={20}
              value={form.requirements}
              onChange={(event) => update("requirements", event.target.value)}
              placeholder={"Fluent in Hindi and conversational English\nOwn laptop with 4G/ broadband internet\nComfortable with rotational shifts"}
              className="textarea min-h-28"
            />
          </div>
        </div>
      </div>

      {isAdmin ? (
        <div className="card flex items-start gap-3 p-5 sm:p-6">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Owner posting — always free</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Admin jobs go live instantly with no payment, no plan limit and no checkout.
            </p>
          </div>
        </div>
      ) : (
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Choose a posting plan</h2>
            <p className="text-[11px] text-slate-500">
              One plan covers multiple job posts. Candidates always apply free.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PLAN_LIST.map((plan) => {
            const selected = form.plan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => update("plan", plan.id)}
                className={`relative flex flex-col rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-brand-400 bg-brand-50/60 ring-2 ring-brand-100"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    <Star className="h-2.5 w-2.5" /> Popular
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">{plan.name}</p>
                  {selected && <CheckCircle2 className="h-4 w-4 text-brand-600" />}
                </div>
                <p className="mt-1 text-lg font-extrabold text-slate-950">
                  {plan.price === 0 ? "Free" : formatINR(plan.price)}
                  <span className="ml-1 text-[10px] font-medium text-slate-500">
                    {plan.price === 0 ? "no card needed" : "one-time"}
                  </span>
                </p>
                <p className="mt-0.5 text-[10px] font-semibold text-brand-700">
                  {plan.posts} job post{plan.posts === 1 ? "" : "s"} · {plan.days} days
                </p>
                <ul className="mt-3 space-y-1">
                  {plan.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="flex items-start gap-1.5 text-[10px] text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
          {selectedPlan.price === 0
            ? "Your free job goes live instantly — no payment needed. One free post per employer."
            : "If you already have unused posts left on this plan, your job goes live instantly. Otherwise you will be taken to a secure checkout."}
        </div>
      </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-xs font-semibold text-slate-700">
            {isAdmin
              ? "Owner post · unlimited"
              : selectedPlan.price === 0
                ? "Total today"
                : `Total today · ${selectedPlan.posts} posts`}
          </p>
          <p className="text-lg font-extrabold text-slate-950">
            {isAdmin || selectedPlan.price === 0 ? "Free" : formatINR(selectedPlan.price)}
          </p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading
            ? "Creating job…"
            : isAdmin || selectedPlan.price === 0
              ? "Publish free job"
              : "Continue"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}
