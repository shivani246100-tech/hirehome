"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";

type ProfileData = {
  name: string;
  phone: string;
  headline: string;
  location: string;
  experienceYears: number;
  skills: string;
  bio: string;
  resumeUrl: string;
  resumeText: string;
};

export function ProfileForm({ initial }: { initial: ProfileData }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof ProfileData, value: string | number) {
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
        setError(data.error ?? "Could not save your profile");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="card p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-900">Basic details</h2>
        <p className="mt-0.5 text-xs text-slate-500">This is what employers see when you apply.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" className="input" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="phone">Mobile number</label>
            <input id="phone" className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="headline">Professional headline</label>
            <input
              id="headline"
              className="input"
              value={form.headline}
              onChange={(e) => update("headline", e.target.value)}
              placeholder="e.g. Customer support associate · Hindi & English"
            />
          </div>
          <div>
            <label className="label" htmlFor="location">Location</label>
            <input id="location" className="input" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State" />
          </div>
          <div>
            <label className="label" htmlFor="experience">Years of experience</label>
            <input
              id="experience"
              type="number"
              min={0}
              max={50}
              className="input"
              value={form.experienceYears}
              onChange={(e) => update("experienceYears", Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-900">Skills & summary</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="skills">Skills</label>
            <input
              id="skills"
              className="input"
              value={form.skills}
              onChange={(e) => update("skills", e.target.value)}
              placeholder="Customer Support, Hindi, English, CRM"
            />
            <p className="mt-1 text-[10px] text-slate-400">Separate skills with commas.</p>
          </div>
          <div>
            <label className="label" htmlFor="bio">Short bio</label>
            <textarea
              id="bio"
              className="textarea"
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Tell employers about your experience, strengths and what kind of remote role you are looking for."
            />
          </div>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-900">Resume</h2>
        <p className="mt-0.5 text-xs text-slate-500">Add a link to a viewable PDF or Google Drive resume.</p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="resumeUrl">Resume link</label>
            <input
              id="resumeUrl"
              type="url"
              className="input"
              value={form.resumeUrl}
              onChange={(e) => update("resumeUrl", e.target.value)}
              placeholder="https://drive.google.com/file/…"
            />
          </div>
          <div>
            <label className="label" htmlFor="resumeText">Resume summary (optional)</label>
            <textarea
              id="resumeText"
              className="textarea min-h-24"
              value={form.resumeText}
              onChange={(e) => update("resumeText", e.target.value)}
              placeholder="A short text version of your resume. Useful if your file link is not accessible."
            />
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Profile saved successfully.
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
