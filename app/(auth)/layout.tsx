import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Video } from "lucide-react";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-25" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative">
          <Logo variant="light" />
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-brand-200">
            <Sparkles className="h-3.5 w-3.5" /> Work from home, for real
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight">
            A real job platform.
            <span className="block text-brand-300">Not another scam.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Verified employers, salary ranges on every listing, and interviews you can attend
            without leaving the app. Free for candidates, always.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            {[
              { icon: ShieldCheck, text: "Every employer reviewed before going live" },
              { icon: Video, text: "Video interviews and scored assessments in-app" },
              { icon: BadgeCheck, text: "Track every application from applied to offer" },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-slate-300">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-brand-200">
                  <item.icon className="h-4 w-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} HiroHome</span>
          <Link href="/jobs" className="inline-flex items-center gap-1 font-semibold text-slate-300 hover:text-white">
            Browse jobs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 lg:hidden">
          <Logo />
          <Link href="/jobs" className="text-xs font-semibold text-brand-600">
            Browse jobs
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-center text-[11px] text-slate-400 lg:hidden">
          HiroHome never charges candidates to apply.
        </div>
      </main>
    </div>
  );
}
