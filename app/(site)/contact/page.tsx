import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Reach the HiroHome team — candidate support, employer support and the Grievance Officer.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-14">
          <span className="section-kicker">Contact</span>
          <h1 className="section-title mt-3">Talk to a human, not a bot.</h1>
          <p className="muted mt-3 max-w-2xl">
            Questions about applying, posting a job, payments, refunds or a suspicious listing — write to us and we
            will get back within one business day (usually faster).
          </p>
        </div>
      </div>

      <div className="container-page grid gap-6 py-14 lg:grid-cols-2">
        <div className="card p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Mail className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-base font-bold text-slate-900">Candidate & employer support</h2>
          <p className="mt-1 text-sm text-slate-600">
            <a href="mailto:hello@hirohome.in" className="font-semibold text-brand-600 hover:underline">
              hello@hirohome.in
            </a>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>· Applying for jobs or interviews</li>
            <li>· Employer verification and posting packs</li>
            <li>· Payments, invoices and refunds</li>
            <li>· Reporting a fraudulent job (please use the "Report this job" button on the listing too)</li>
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Support hours: Monday–Saturday, 9:30 AM – 7:00 PM IST.
          </p>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">Trust & safety team</h2>
            <p className="mt-1 text-sm text-slate-600">
              If an employer asks you to pay money, share OTPs, or transfer funds — stop and report:{" "}
              <a href="mailto:hello@hirohome.in?subject=Scam%20report" className="font-semibold text-brand-600 hover:underline">
                hello@hirohome.in
              </a>
              . Include the job link, the employer's name and any phone numbers or UPI IDs they gave you.
            </p>
          </div>

          <div className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <MapPin className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">Grievance Officer</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Under the DPDP Act, 2023 and the IT Rules, 2021, HiroHome will publish the name and contact details of
              its Grievance Officer here before launch. Until then, all grievances — data protection, content, refunds
              or conduct — reach us at{" "}
              <a href="mailto:hello@hirohome.in" className="font-semibold text-brand-600 hover:underline">
                hello@hirohome.in
              </a>{" "}
              and will be handled by a named owner, with acknowledgement within 1 business day and resolution within
              30 days.
            </p>
          </div>

          <div className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <MessageCircle className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">Office</h2>
            <p className="mt-1 text-sm text-slate-600">
              HiroHome (a remote-first company)
              <br />
              Registered office address will be published here before launch, along with GST details for invoices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
