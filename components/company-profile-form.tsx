"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Save } from "lucide-react";

type CompanyData = {
  name: string;
  phone: string;
  companyName: string;
  companyWebsite: string;
  companyAbout: string;
  isVerified: boolean;
};

export function CompanyProfileForm({ initial }: { initial: CompanyData }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof CompanyData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess(false);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not save your company profile");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Company details</h2>
            <p className="mt-0.5 text-xs text-slate-500">Shown on every job you post.</p>
          </div>
          {form.isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> Verified
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
              Verification pending
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">Your full name</label>
            <input id="name" required className="input" value={form.name} onChange={(event) => update("name", event.target.value)} />
          </div>
          <div>
            <label htmlFor="phone" className="label">Contact number</label>
            <input id="phone" className="input" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label htmlFor="companyName" className="label">Company name</label>
            <input id="companyName" required className="input" value={form.companyName} onChange={(event) => update("companyName", event.target.value)} />
          </div>
          <div>
            <label htmlFor="companyWebsite" className="label">Company website</label>
            <input id="companyWebsite" type="url" className="input" value={form.companyWebsite} onChange={(event) => update("companyWebsite", event.target.value)} placeholder="https://yourcompany.com" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="companyAbout" className="label">About the company</label>
            <textarea
              id="companyAbout"
              className="textarea"
              value={form.companyAbout}
              onChange={(event) => update("companyAbout", event.target.value)}
              placeholder="What does your company do? Where is your team based? Why do people enjoy working with you?"
            />
          </div>
        </div>
      </div>

      {!form.isVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-relaxed text-amber-800">
          <p className="font-bold">Get your employer account verified</p>
          <p className="mt-1">
            Verified employers get a badge on every listing and rank higher in search. Email{" "}
            <a href="mailto:verify@hirohome.in" className="font-semibold underline">verify@hirohome.in</a>{" "}
            with your company website or GST registration to request a review.
          </p>
        </div>
      )}

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Company profile saved.
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {loading ? "Saving…" : "Save company profile"}
      </button>
    </form>
  );
}
