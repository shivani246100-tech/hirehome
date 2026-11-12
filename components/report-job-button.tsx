"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";

const REASONS = [
  { value: "PAY_TO_APPLY", label: "Asks candidates for money" },
  { value: "SCAM", label: "Looks like a scam" },
  { value: "MISLEADING", label: "Salary or role details are misleading" },
  { value: "DUPLICATE", label: "Duplicate listing" },
  { value: "EXPIRED", label: "Job is no longer available" },
  { value: "OTHER", label: "Something else" },
] as const;

export function ReportJobButton({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("SCAM");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, reason, details, email }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok) {
        setError(data?.error ?? "Could not submit the report. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[11px] font-semibold text-emerald-800">
        Thanks — our team will review “{jobTitle}” and remove it if it breaks our rules.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 transition hover:text-red-600"
      >
        <Flag className="h-3.5 w-3.5" /> Report this job
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <Flag className="h-3.5 w-3.5 text-red-500" /> Report this job
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close report form"
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <label htmlFor={`report-reason-${jobId}`} className="label mt-3 text-xs">
        What is the issue?
      </label>
      <select
        id={`report-reason-${jobId}`}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        className="select text-xs"
      >
        {REASONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <label htmlFor={`report-details-${jobId}`} className="label mt-3 text-xs">
        Details (optional)
      </label>
      <textarea
        id={`report-details-${jobId}`}
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="What did the employer ask you to do? Any fees, links or phone numbers?"
        maxLength={1000}
        className="textarea min-h-20 text-xs"
      />

      <label htmlFor={`report-email-${jobId}`} className="label mt-3 text-xs">
        Your email (optional, for follow-up)
      </label>
      <input
        id={`report-email-${jobId}`}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="input text-xs"
      />

      {error && <p className="mt-2 text-[11px] font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={status === "sending"} className="btn-primary btn-sm mt-3 w-full">
        {status === "sending" ? "Submitting…" : "Submit report"}
      </button>
      <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
        Never pay anyone to apply or get hired — HiroHome never charges candidates. Reports go to our trust team.
      </p>
    </form>
  );
}
