import Link from "next/link";
import { ChevronDown, LayoutDashboard, Menu, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { getSessionUser, dashboardPathForRole } from "@/lib/auth";

export async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            <Link href="/jobs" className="nav-link">
              Find jobs
            </Link>
            <Link href="/jobs?type=INTERNSHIP" className="nav-link">
              Internships
            </Link>
            <Link href="/#how-it-works" className="nav-link">
              How it works
            </Link>
            <Link href="/#pricing" className="nav-link">
              For employers
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link href={dashboardPathForRole(user.role)} className="btn-secondary btn-sm">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn-ghost btn-sm" type="submit">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/register" className="btn-primary btn-sm">
                <Sparkles className="h-4 w-4" />
                Get hired
              </Link>
            </>
          )}
        </div>

        <details className="group relative md:hidden">
          <summary
            className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </summary>
          <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <Link href="/jobs" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">
              Find jobs
            </Link>
            <Link href="/#how-it-works" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">
              How it works
            </Link>
            <Link href="/#pricing" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">
              For employers
            </Link>
            <div className="my-2 h-px bg-slate-100" />
            {user ? (
              <>
                <Link
                  href={dashboardPathForRole(user.role)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">
                  Log in
                </Link>
                <Link href="/register" className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white">
                  Get hired <ChevronDown className="h-4 w-4 -rotate-90" />
                </Link>
              </>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}
