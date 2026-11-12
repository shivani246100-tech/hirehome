"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck, Smartphone } from "lucide-react";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

export function CheckoutClient({
  orderId,
  amount,
  planName,
  provider,
  razorpayOrderId,
  razorpayKeyId,
  customerName,
  customerEmail,
}: {
  orderId: string;
  amount: number;
  planName: string;
  provider: string;
  razorpayOrderId: string | null;
  razorpayKeyId: string | null;
  customerName: string;
  customerEmail: string;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  const isRazorpay = provider === "RAZORPAY" && Boolean(razorpayOrderId && razorpayKeyId);

  useEffect(() => {
    if (!isRazorpay) return;
    if (document.getElementById("razorpay-checkout-script")) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
  }, [isRazorpay]);

  async function confirmPayment(payload: Record<string, string> = {}) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...payload }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Payment could not be verified");
        return;
      }
      setSuccess(true);
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong while verifying the payment.");
    } finally {
      setLoading(false);
    }
  }

  function payWithRazorpay() {
    const Razorpay = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
    if (!Razorpay || !razorpayOrderId || !razorpayKeyId) {
      setError("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    const checkout = new Razorpay({
      key: razorpayKeyId,
      amount: amount * 100,
      currency: "INR",
      name: "HiroHome",
      description: planName,
      order_id: razorpayOrderId,
      prefill: { name: customerName, email: customerEmail },
      theme: { color: "#204bd8" },
      handler: (response: RazorpayResponse) => {
        confirmPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setError("Payment cancelled. Nothing was charged — you can try again whenever you are ready.");
        },
      },
    });
    checkout.open();
  }

  async function cancelPayment() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/payments/fail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not cancel the payment");
        return;
      }
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong while cancelling the payment.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-3 text-lg font-bold text-emerald-900">Payment successful</p>
        <p className="mt-1 text-xs text-emerald-700">Taking you to the next step…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Choose payment method</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          <Lock className="h-3 w-3" /> Secure
        </span>
      </div>

      {!isRazorpay && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
          <strong>Demo checkout.</strong> Razorpay keys are not configured, so this payment will be
          simulated. Add <code className="rounded bg-amber-100 px-1">RAZORPAY_KEY_ID</code> and{" "}
          <code className="rounded bg-amber-100 px-1">RAZORPAY_KEY_SECRET</code> to accept real money.
        </div>
      )}

      {!isRazorpay && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod("upi")}
            className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold transition ${
              method === "upi" ? "border-brand-400 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-600"
            }`}
          >
            <Smartphone className="h-4 w-4" /> UPI
          </button>
          <button
            type="button"
            onClick={() => setMethod("card")}
            className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold transition ${
              method === "card" ? "border-brand-400 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-600"
            }`}
          >
            <CreditCard className="h-4 w-4" /> Card
          </button>
        </div>
      )}

      {!isRazorpay && method === "upi" ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] text-slate-500">Pay using any UPI app</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
              <span key={app} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">
                {app}
              </span>
            ))}
          </div>
          <input className="input mt-2.5" placeholder="yourname@upi" aria-label="UPI ID" />
        </div>
      ) : null}

      {!isRazorpay && method === "card" ? (
        <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <input className="input" placeholder="Card number" inputMode="numeric" aria-label="Card number" />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="MM / YY" aria-label="Card expiry" />
            <input className="input" placeholder="CVV" inputMode="numeric" aria-label="CVV" />
          </div>
        </div>
      ) : null}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-[11px] text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}

      <button
        type="button"
        disabled={loading || (isRazorpay && !scriptReady)}
        onClick={() => (isRazorpay ? payWithRazorpay() : confirmPayment({}))}
        className="btn-primary mt-4 w-full"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {loading ? "Processing…" : isRazorpay ? "Pay securely" : "Pay now (demo)"}
      </button>

      {!isRazorpay && (
        <button
          type="button"
          disabled={loading}
          onClick={cancelPayment}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel payment — nothing will be charged
        </button>
      )}

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        256-bit encrypted · Powered by {isRazorpay ? "Razorpay" : "HiroHome demo checkout"}
      </div>
    </div>
  );
}
