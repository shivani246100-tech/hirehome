"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function PremiumCheckoutButton({ plan }: { plan: "PRO_MONTHLY" | "PRO_YEARLY" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/premium/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not start checkout");
        return;
      }
      router.push(data.checkoutUrl);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={start} disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Starting checkout…" : "Upgrade to Pro"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
      {error && <p className="mt-2 text-center text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
