"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, ShieldOff } from "lucide-react";

export function VerifyEmployerButton({
  employerId,
  isVerified,
}: {
  employerId: string;
  isVerified: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/employers/${employerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !isVerified }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update verification");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={`btn-sm inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
          isVerified
            ? "border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-600"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isVerified ? (
          <ShieldOff className="h-3 w-3" />
        ) : (
          <BadgeCheck className="h-3 w-3" />
        )}
        {isVerified ? "Remove verified" : "Mark verified"}
      </button>
      {error && <span className="text-[9px] text-rose-600">{error}</span>}
    </div>
  );
}
