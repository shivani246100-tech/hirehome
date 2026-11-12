"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export function MustChangePasswordBanner() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
        Password updated. You are good to go.
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update the password. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-amber-900">Change your admin password now</p>
          <p className="mt-0.5 text-[11px] text-amber-800">
            This account was seeded with the password from <code>ADMIN_PASSWORD</code>. Set a fresh one
            before sharing access with anyone.
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="mt-3 grid gap-2 sm:grid-cols-4">
        <input
          type="password"
          className="input"
          autoComplete="current-password"
          placeholder="Current password"
          aria-label="Current password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
        <input
          type="password"
          className="input"
          autoComplete="new-password"
          placeholder="New password"
          aria-label="New password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={8}
        />
        <input
          type="password"
          className="input"
          autoComplete="new-password"
          placeholder="Confirm new password"
          aria-label="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
        />
        <button type="submit" disabled={loading} className="btn-primary btn-sm justify-center">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
      {error && <p className="mt-2 text-[11px] font-semibold text-rose-700">{error}</p>}
    </div>
  );
}
