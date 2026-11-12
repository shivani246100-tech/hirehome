"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Building2, Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import { GoogleIcon } from "@/components/login-form";

type Role = "SEEKER" | "EMPLOYER";

export function RegisterForm({
  googleEnabled,
  initialRole,
}: {
  googleEnabled: boolean;
  initialRole: Role;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not create your account");
        return;
      }

      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Create your free account</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Apply to real work-from-home jobs, or start hiring verified remote talent.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        {(
          [
            { value: "SEEKER", label: "I want a job", icon: UserRound },
            { value: "EMPLOYER", label: "I want to hire", icon: Building2 },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              role === option.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <option.icon className="h-4 w-4" />
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">
            {role === "EMPLOYER" ? "Your full name" : "Full name"}
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Aarav Sharma"
            className="input"
            autoComplete="name"
          />
        </div>

        {role === "EMPLOYER" && (
          <div>
            <label htmlFor="companyName" className="label">
              Company name
            </label>
            <input
              id="companyName"
              required
              value={form.companyName}
              onChange={(event) => update("companyName", event.target.value)}
              placeholder="e.g. Nimbus Support"
              className="input"
              autoComplete="organization"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              This is shown on your job listings. You can add a website and company profile after signing up.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="you@example.com"
            className="input"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="phone" className="label">
            Mobile number <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="phone"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+91 98765 43210"
            className="input"
            autoComplete="tel"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Create a password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder="At least 8 characters"
              className="input pr-10"
              autoComplete="new-password"
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
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account…" : role === "EMPLOYER" ? "Create employer account" : "Create free account"}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <a href={`/api/auth/google?role=${role.toLowerCase()}`} className="btn-secondary w-full">
            <GoogleIcon /> Continue with Google
          </a>
        </>
      )}

      <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
        By creating an account you agree to HiroHome’s fair hiring policy. Candidates are never
        charged to apply or interview.
      </p>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
