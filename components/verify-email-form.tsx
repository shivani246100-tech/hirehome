"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from "lucide-react";

export function VerifyEmailForm({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setStatus("loading");
    setError("");

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (response) => ({ response, data: await response.json().catch(() => null) }))
      .then(({ response, data }) => {
        if (cancelled) return;
        if (response.ok && data?.ok) {
          setStatus("done");
        } else {
          setStatus("error");
          setError(data?.error ?? "This verification link is invalid or has expired.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setError("Could not verify the email. Please try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div>
      <div className="mb-7">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          {status === "done" ? <CheckCircle2 className="h-6 w-6" /> : <MailCheck className="h-6 w-6" />}
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">Email verification</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {status === "done"
            ? "Your email is verified. Welcome to HiroHome!"
            : status === "loading"
              ? "Verifying your email address…"
              : "We could not verify this email link."}
        </p>
      </div>

      {status === "error" && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {status === "done" && (
        <button type="button" onClick={() => router.push("/login")} className="btn-primary w-full">
          Go to login
        </button>
      )}

      {status !== "done" && (
        <button type="button" onClick={() => router.push("/login")} className="btn-secondary w-full">
          Back to login
        </button>
      )}

      {status === "loading" && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your verification link…
        </div>
      )}
    </div>
  );
}
