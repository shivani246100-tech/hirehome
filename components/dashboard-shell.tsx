"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Crown,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserRound,
  Video,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn, initials } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  accent?: boolean;
};

const navByRole: Record<string, NavItem[]> = {
  SEEKER: [
    { href: "/dashboard/seeker", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/seeker/applications", label: "My applications", icon: FileText },
    { href: "/dashboard/seeker/resumes", label: "My resumes", icon: Download },
    { href: "/dashboard/seeker/interviews", label: "Interviews", icon: Video },
    { href: "/dashboard/seeker/billing", label: "Billing & invoices", icon: ReceiptText },
    { href: "/dashboard/seeker/profile", label: "My profile", icon: UserRound },
    { href: "/premium", label: "Upgrade to Pro", icon: Crown, accent: true },
  ],
  EMPLOYER: [
    { href: "/dashboard/employer", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/employer/jobs", label: "My jobs", icon: BriefcaseBusiness },
    { href: "/dashboard/employer/jobs/new", label: "Post a job", icon: PlusCircle },
    { href: "/dashboard/employer/profile", label: "Company profile", icon: Building2 },
    { href: "/dashboard/employer/billing", label: "Billing & invoices", icon: ReceiptText },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Owner overview", icon: ShieldCheck, exact: true },
    { href: "/dashboard/employer", label: "Employer workspace", icon: BriefcaseBusiness },
    { href: "/dashboard/employer/jobs/new", label: "Post a job", icon: PlusCircle },
    { href: "/jobs", label: "View job board", icon: FileText },
  ],
};

const roleLabels: Record<string, string> = {
  SEEKER: "Job seeker",
  EMPLOYER: "Employer",
  ADMIN: "Owner",
};

export function DashboardShell({
  user,
  premium,
  children,
}: {
  user: { name: string; email: string; role: string; companyName: string | null };
  premium: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = navByRole[user.role] ?? navByRole.SEEKER;

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const navList = (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand-50 text-brand-700"
                : item.accent
                  ? "text-amber-700 hover:bg-amber-50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <item.icon className={cn("h-4 w-4", active ? "text-brand-600" : item.accent ? "text-amber-500" : "text-slate-400")} />
            <span className="flex-1">{item.label}</span>
            {item.accent && !premium && <Sparkles className="h-3.5 w-3.5 text-amber-400" />}
            {item.accent && premium && <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">PRO</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {user.role === "SEEKER" ? "Job search" : user.role === "ADMIN" ? "Owner tools" : "Hiring"}
          </p>
          {navList}

          {user.role === "SEEKER" && (
            <Link
              href="/jobs"
              className="mt-6 flex items-center justify-between rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-3 text-xs font-semibold text-brand-700 transition hover:border-brand-200"
            >
              Browse open jobs
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
              {initials(user.name)}
              {premium && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-amber-400">
                  <Crown className="h-2 w-2 text-amber-900" />
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">{user.companyName ?? user.name}</p>
              <p className="truncate text-[10px] text-slate-400">{roleLabels[user.role] ?? user.role}</p>
            </div>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-rose-600"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo compact />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">{user.companyName ?? user.name}</span>
              <details className="relative">
                <summary className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg border border-slate-200 text-slate-600 [&::-webkit-details-marker]:hidden">
                  <Menu className="h-4 w-4" />
                </summary>
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  {navList}
                  <form action="/api/auth/logout" method="post" className="mt-1 border-t border-slate-100 pt-1">
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50">
                      <LogOut className="h-3.5 w-3.5" /> Log out
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
