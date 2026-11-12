"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, FileText, Loader2, Send } from "lucide-react";

type Question = { id: string; prompt: string; options: string[] };
type Result = { score: number; correct: number; total: number };

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AssessmentRunner({
  interviewId,
  questions,
  durationMins,
  scheduledAt,
  jobTitle,
  company,
}: {
  interviewId: string;
  questions: Question[];
  durationMins: number;
  scheduledAt: string;
  jobTitle: string;
  company: string;
}) {
  const totalSeconds = Math.max(1, durationMins) * 60;
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittingRef = useRef(false);
  const resultRef = useRef<Result | null>(null);
  resultRef.current = result;

  const submit = useCallback(
    async (auto = false) => {
      if (submittingRef.current || resultRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      setError("");

      try {
        const response = await fetch(`/api/interviews/${interviewId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: answersRef.current }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "Could not submit your assessment");
          if (auto) setError("Time is up. Please check your connection and press Submit again.");
          return;
        }
        setResult({ score: data.score, correct: data.correct, total: data.total });
      } catch {
        setError("Something went wrong. Please check your connection and try again.");
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [interviewId],
  );

  useEffect(() => {
    if (!started || result) return;
    if (timeLeft <= 0) {
      void submit(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [started, timeLeft, result, submit]);

  const answered = Object.keys(answers).length;

  if (result) {
    const tone =
      result.score >= 70
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : result.score >= 40
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-rose-200 bg-rose-50 text-rose-700";

    return (
      <div className="card overflow-hidden">
        <div className={`p-8 text-center ${tone.split(" ").slice(0, 2).join(" ")}`}>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/70">
            <span className="text-2xl font-extrabold">{result.score}%</span>
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-slate-950">Assessment submitted</h2>
          <p className="mt-1 text-sm text-slate-600">
            You answered {result.correct} of {result.total} questions correctly.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {company} will review your score and update your application status.
          </p>
        </div>
        <div className="space-y-3 p-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">{jobTitle}</p>
            <p className="mt-0.5">{company} · Skills assessment completed</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/seeker/applications" className="btn-primary">
              View my applications
            </Link>
            <Link href="/jobs" className="btn-secondary">
              Browse more jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Skills assessment</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {jobTitle} · {company}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Questions</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{questions.length}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Time limit</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{durationMins} minutes</p>
          </div>
          <div className="col-span-2 rounded-xl bg-slate-50 p-3 sm:col-span-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Scheduled</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {new Date(scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[11px] leading-relaxed text-amber-800">
          <p className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="h-3.5 w-3.5" /> Before you start
          </p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5">
            <li>The timer starts as soon as you press Start and cannot be paused.</li>
            <li>You can submit early. Unanswered questions are marked incorrect.</li>
            <li>The assessment is automatically submitted when time runs out.</li>
            <li>You can attempt this assessment only once.</li>
          </ul>
        </div>

        <button type="button" onClick={() => setStarted(true)} className="btn-primary mt-5 w-full sm:w-auto">
          Start assessment <Clock3 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-16 z-30 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur lg:top-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Time remaining</p>
            <p className={`text-xl font-extrabold tabular-nums ${timeLeft <= 60 ? "text-rose-600" : "text-slate-900"}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Progress</p>
            <p className="text-sm font-bold text-slate-900">
              {answered} / {questions.length} answered
            </p>
          </div>
          <button type="button" onClick={() => submit(false)} disabled={submitting} className="btn-primary btn-sm">
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Submit
          </button>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${(answered / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {questions.map((question, index) => (
        <fieldset key={question.id} className="card p-5">
          <legend className="sr-only">Question {index + 1}</legend>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Question {index + 1}</p>
          <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-900">{question.prompt}</p>
          <div className="mt-4 space-y-2">
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === optionIndex;
              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition ${
                    selected
                      ? "border-brand-400 bg-brand-50 text-brand-900 ring-1 ring-brand-200"
                      : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={selected}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                    className="mt-0.5 h-3.5 w-3.5 accent-brand-600"
                  />
                  <span className="leading-relaxed">{option}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] text-slate-500">
          {answered === questions.length
            ? "All questions answered. Ready to submit?"
            : `${questions.length - answered} question${questions.length - answered === 1 ? "" : "s"} left.`}
        </p>
        <button type="button" onClick={() => submit(false)} disabled={submitting} className="btn-primary btn-sm">
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {submitting ? "Submitting…" : "Submit assessment"}
        </button>
      </div>
    </div>
  );
}
