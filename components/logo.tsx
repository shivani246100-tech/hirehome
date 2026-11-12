import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  variant = "default",
  compact = false,
  className,
}: {
  href?: string;
  variant?: "default" | "light";
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} aria-label="HiroHome — home" className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white shadow-md shadow-brand-600/25">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M5 18V6.5C5 5.7 5.7 5 6.5 5S8 5.7 8 6.5V11h8V6.5c0-.8.7-1.5 1.5-1.5S19 5.7 19 6.5V18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M8 14.5h8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-lg font-extrabold tracking-tight",
              variant === "light" ? "text-white" : "text-slate-900",
            )}
          >
            Hiro<span className="text-brand-600">Home</span>
          </span>
          <span
            className={cn(
              "mt-1 text-[9px] font-semibold uppercase tracking-[0.18em]",
              variant === "light" ? "text-slate-400" : "text-slate-400",
            )}
          >
            Work from home, for real
          </span>
        </span>
      )}
    </Link>
  );
}
