"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export function AdminReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"review" | "dismiss" | null>(null);
  const [error, setError] = useState("");

  async function act(action: "review" | "dismiss") {
    setLoading(action);
    setError("");
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update the report");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => act("review")}
          disabled={loading !== null}
          className="btn-sm inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
        >
          {loading === "review" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
          Mark reviewed
        </button>
        <button
          type="button"
          onClick={() => act("dismiss")}
          disabled={loading !== null}
          className="btn-sm inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-500 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {loading === "dismiss" ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
          Dismiss
        </button>
      </div>
      {error && <span className="text-[9px] text-rose-600">{error}</span>}
    </div>
  );
}
