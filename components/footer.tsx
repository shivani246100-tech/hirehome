import Link from "next/link";
import { Logo } from "@/components/logo";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

const jobLinks = [
  { label: "Customer support", href: "/jobs?category=customer-support" },
  { label: "Data entry", href: "/jobs?category=data-entry" },
  { label: "Content writing", href: "/jobs?category=content-writing" },
  { label: "Web development", href: "/jobs?category=web-development" },
  { label: "Online teaching", href: "/jobs?category=online-teaching" },
];

const platformLinks = [
  { label: "Browse all jobs", href: "/jobs" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Employer pricing", href: "/#pricing" },
  { label: "For employers", href: "/register?role=employer" },
  { label: "Log in", href: "/login" },
];

const companyLinks = [
  { label: "About us", href: "/about" },
  { label: "Contact & support", href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund & Cancellation", href: "/refund-cancellation" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-6">
          <div className="lg:col-span-2 lg:max-w-sm">
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              A work-from-home job platform built for honest hiring. Verified employers post real
              roles, candidates apply free, and interviews happen right here.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Verified employers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-300" /> Remote roles across India
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Find work</p>
            <ul className="mt-4 space-y-2.5">
              {jobLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">HiroHome</p>
            <ul className="mt-4 space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Company</p>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} HiroHome. Work from home, for real.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> hello@hirohome.in
            </span>
            <span>HiroHome never charges candidates to apply.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
