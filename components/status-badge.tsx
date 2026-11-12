import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/utils";

const styles: Record<string, string> = {
  APPLIED: "bg-slate-100 text-slate-700 border-slate-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  INTERVIEW: "bg-brand-50 text-brand-700 border-brand-200",
  OFFERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  WITHDRAWN: "bg-slate-100 text-slate-500 border-slate-200",
  PENDING_PAYMENT: "bg-amber-50 text-amber-700 border-amber-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAUSED: "bg-slate-100 text-slate-600 border-slate-200",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
  SCHEDULED: "bg-brand-50 text-brand-700 border-brand-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  CREATED: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        styles[status] ?? "border-slate-200 bg-slate-50 text-slate-600",
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
