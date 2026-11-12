"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pause, Play, XCircle } from "lucide-react";

export function JobStatusActions({
  jobId,
  status,
}: {
  jobId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function update(nextStatus: string) {
    setLoading(nextStatus);
    setError("");
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update the job");
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
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "ACTIVE" && (
        <button
          type="button"
          onClick={() => update("PAUSED")}
          disabled={Boolean(loading)}
          className="btn-secondary btn-sm"
        >
          {loading === "PAUSED" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
          Pause
        </button>
      )}
      {status === "PAUSED" && (
        <button
          type="button"
          onClick={() => update("ACTIVE")}
          disabled={Boolean(loading)}
          className="btn-secondary btn-sm"
        >
          {loading === "ACTIVE" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Resume
        </button>
      )}
      {status !== "CLOSED" && (
        <button
          type="button"
          onClick={() => update("CLOSED")}
          disabled={Boolean(loading)}
          className="btn-secondary btn-sm text-rose-600"
        >
          {loading === "CLOSED" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
          Close
        </button>
      )}
      {error && <span className="text-[10px] text-rose-600">{error}</span>}
    </div>
  );
}
