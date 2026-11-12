"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "hirohome_cookie_consent";

/**
 * Cookie notice. HiroHome uses strictly necessary cookies only (sign-in, CSRF).
 * If analytics are added later, gate them behind consent here.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(value: "accepted" | "declined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* private mode — just hide */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:left-auto sm:right-6 sm:bottom-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Cookie className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">We use essential cookies only</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Sign-in and security cookies keep HiroHome working. No ad tracking. See our{" "}
            <Link href="/privacy" className="font-semibold text-brand-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={() => choose("accepted")} className="btn-primary btn-sm">
              Got it
            </button>
            <button onClick={() => choose("declined")} className="btn-ghost btn-sm">
              Only essential
            </button>
          </div>
        </div>
        <button
          onClick={() => choose("declined")}
          aria-label="Dismiss cookie notice"
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
