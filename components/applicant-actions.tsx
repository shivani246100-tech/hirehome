"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, ChevronDown, FileText, Loader2, Video } from "lucide-react";

const statusOptions = [
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "INTERVIEW", label: "Interview stage" },
  { value: "OFFERED", label: "Offer sent" },
  { value: "REJECTED", label: "Not selected" },
];

function defaultScheduleValue() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

export function ApplicantActions({
  applicationId,
  currentStatus,
  interview,
}: {
  applicationId: string;
  currentStatus: string;
  interview: { type: string; status: string; score: number | null } | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [savingStatus, setSavingStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"ASSESSMENT" | "VIDEO">("ASSESSMENT");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduleValue);
  const [durationMins, setDurationMins] = useState("30");
  const [questionCount, setQuestionCount] = useState("5");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [savingInterview, setSavingInterview] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveStatus(nextStatus: string) {
    setStatus(nextStatus);
    setSavingStatus(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update the application");
        return;
      }
      setMessage("Application status updated.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function scheduleInterview(event: React.FormEvent) {
    event.preventDefault();
    setSavingInterview(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          type,
          scheduledAt,
          durationMins: Number(durationMins),
          questionCount: Number(questionCount),
          meetingUrl,
          notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not schedule the interview");
        return;
      }
      setMessage(type === "ASSESSMENT" ? "Assessment scheduled and shared with the candidate." : "Video interview scheduled.");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSavingInterview(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <label htmlFor={`status-${applicationId}`} className="sr-only">Application status</label>
          <select
            id={`status-${applicationId}`}
            value={status}
            onChange={(event) => saveStatus(event.target.value)}
            disabled={savingStatus}
            className="select w-auto py-1.5 text-xs"
          >
            <option value="APPLIED">Applied</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {savingStatus && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
        </div>

        <button type="button" onClick={() => setOpen((value) => !value)} className="btn-secondary btn-sm">
          <CalendarClock className="h-3.5 w-3.5" />
          {interview ? "Reschedule" : "Schedule interview"}
          <ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
        </button>

        {interview && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
            {interview.type === "ASSESSMENT" ? <FileText className="h-3 w-3" /> : <Video className="h-3 w-3" />}
            {interview.type === "ASSESSMENT" ? "Assessment" : "Video"} · {interview.status.toLowerCase()}
            {typeof interview.score === "number" ? ` · ${interview.score}%` : ""}
          </span>
        )}
      </div>

      {open && (
        <form onSubmit={scheduleInterview} className="mt-3 space-y-3 rounded-xl border border-brand-100 bg-brand-50/50 p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("ASSESSMENT")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-[11px] font-semibold transition ${
                type === "ASSESSMENT" ? "border-brand-400 bg-white text-brand-700" : "border-slate-200 bg-white/60 text-slate-600"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Scored assessment
            </button>
            <button
              type="button"
              onClick={() => setType("VIDEO")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-[11px] font-semibold transition ${
                type === "VIDEO" ? "border-brand-400 bg-white text-brand-700" : "border-slate-200 bg-white/60 text-slate-600"
              }`}
            >
              <Video className="h-3.5 w-3.5" /> Video interview
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="label text-[10px]" htmlFor={`when-${applicationId}`}>Date & time</label>
              <input
                id={`when-${applicationId}`}
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="input py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="label text-[10px]" htmlFor={`duration-${applicationId}`}>Duration (minutes)</label>
              <input
                id={`duration-${applicationId}`}
                type="number"
                min={5}
                max={180}
                value={durationMins}
                onChange={(event) => setDurationMins(event.target.value)}
                className="input py-1.5 text-xs"
              />
            </div>
            {type === "ASSESSMENT" ? (
              <div>
                <label className="label text-[10px]" htmlFor={`questions-${applicationId}`}>Number of questions</label>
                <input
                  id={`questions-${applicationId}`}
                  type="number"
                  min={3}
                  max={15}
                  value={questionCount}
                  onChange={(event) => setQuestionCount(event.target.value)}
                  className="input py-1.5 text-xs"
                />
              </div>
            ) : (
              <div>
                <label className="label text-[10px]" htmlFor={`meeting-${applicationId}`}>Meeting link (optional)</label>
                <input
                  id={`meeting-${applicationId}`}
                  value={meetingUrl}
                  onChange={(event) => setMeetingUrl(event.target.value)}
                  placeholder="Auto-created Jitsi room if blank"
                  className="input py-1.5 text-xs"
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="label text-[10px]" htmlFor={`notes-${applicationId}`}>Instructions for the candidate (optional)</label>
              <input
                id={`notes-${applicationId}`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="e.g. Keep your ID card ready, join 5 minutes early"
                className="input py-1.5 text-xs"
              />
            </div>
          </div>

          <button type="submit" disabled={savingInterview} className="btn-primary btn-sm">
            {savingInterview ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {savingInterview ? "Saving…" : interview ? "Update interview" : "Schedule & notify candidate"}
          </button>
        </form>
      )}

      {message && <p className="mt-2 text-[10px] font-medium text-emerald-600">{message}</p>}
      {error && <p className="mt-2 text-[10px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}
