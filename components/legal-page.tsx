import { TriangleAlert } from "lucide-react";

/**
 * Shared shell for legal pages. Every legal draft on this site is marked
 * clearly as lawyer-review pending — see README "Things you must do".
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-10">
          <span className="section-kicker">Legal</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-2 text-xs text-slate-500">Last updated: {updated}</p>
          <div className="mt-4 flex max-w-2xl items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-relaxed text-amber-900">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Draft — to be reviewed by a qualified lawyer before launch.</strong> This document is a
              sensible starting point for an Indian work-from-home job marketplace, not legal advice. HiroHome must
              have these documents reviewed and adapted to its final corporate structure, GST details and grievance
              officer designation before going live.
            </span>
          </div>
        </div>
      </div>
      <div className="container-page py-10">
        <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-slate-600 [&_h2]:pt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_li]:leading-relaxed [&_strong]:text-slate-800 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
          {children}
        </div>
      </div>
    </div>
  );
}
