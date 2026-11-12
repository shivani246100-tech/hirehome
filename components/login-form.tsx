"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from "lucide-react";

const errorMessages: Record<string, string> = {
  "google-not-configured": "Google login is not configured yet. Use email and password for now.",
  "google-state": "Your Google login session expired. Please try again.",
  "google-email": "Google did not share an email address. Please use email and password.",
  "google-failed": "Google login failed. Please try again or use your password.",
};

const demoAccounts = [
  { label: "Job seeker", email: "seeker@hirohome.in", password: "Demo@123" },
  { label: "Employer", email: "employer@hirohome.in", password: "Demo@123" },
  { label: "Owner / admin", email: "admin@hirohome.in", password: "Admin@123" },
];

// Demo accounts are never shown in production builds.
const showDemoAccounts = process.env.NODE_ENV !== "production";

export function LoginForm({
  googleEnabled,
  initialError,
  nextPath,
}: {
  googleEnabled: boolean;
  initialError?: string;
  nextPath?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError ? errorMessages[initialError] ?? "Please try again." : "");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not log in");
        return;
      }

      const destination = nextPath && nextPath.startsWith("/") ? nextPath : data.redirect;
      router.push(destination);
      router.refresh();
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Log in to manage your applications, interviews and job posts.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">
              Password
            </label>
            <a href="mailto:hello@hirohome.in?subject=Password%20reset" className="mb-1.5 text-xs font-semibold text-brand-600 hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <a href="/api/auth/google" className="btn-secondary w-full">
            <GoogleIcon /> Continue with Google
          </a>
        </>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        New to HiroHome?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Create a free account
        </Link>
      </p>

      {showDemoAccounts ? (
        <details className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-xs font-semibold text-slate-600">
            Demo accounts (for evaluation)
          </summary>
        <div className="mt-3 grid gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
                setError("");
              }}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-[11px] transition hover:border-brand-200"
            >
              <span className="font-semibold text-slate-700">{account.label}</span>
              <span className="text-slate-400">{account.email}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          Click an account to fill the form, then press Log in.
        </p>
        </details>
      ) : null}
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M21.35 11.1H12v2.9h5.35c-.23 1.5-1.72 4.4-5.35 4.4a6.4 6.4 0 1 1 0-12.8c1.83 0 3.06.78 3.76 1.45l2.56-2.47A9.8 9.8 0 0 0 12 2a10 10 0 1 0 0 20c5.77 0 9.6-4.06 9.6-9.78 0-.66-.07-1.16-.15-1.12Z"
        fill="currentColor"
      />
    </svg>
  );
}
