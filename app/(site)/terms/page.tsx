import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of HiroHome — India's work-from-home job marketplace.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 2026">
      <p>
        These Terms of Service ("Terms") govern your access to and use of the HiroHome website, applications and
        related services (collectively, the "Platform"), operated by HiroHome ("HiroHome", "we", "us"). By creating an
        account or using the Platform, you agree to these Terms, our Privacy Policy and our Refund and Cancellation
        Policy. If you do not agree, do not use the Platform.
      </p>

      <h2>1. What HiroHome is</h2>
      <p>
        HiroHome is a marketplace that connects employers hiring for genuine work-from-home roles with job seekers
        across India. We provide job listings, application tracking, in-app assessments, video interviews and an
        optional résumé builder. <strong>HiroHome is not a recruitment agency, staffing company or employer of
        record.</strong> Employment relationships are formed solely between employers and candidates.
      </p>

      <h2>2. Free for candidates — always</h2>
      <p>
        <strong>Candidates are never required to pay to apply for a job, attend an interview, or be hired.</strong>{" "}
        Any employer or recruiter who asks a candidate for money in connection with a job listed on HiroHome is in
        breach of these Terms. Report them immediately using the "Report this job" button or by writing to
        hello@hirohome.in. We will remove such listings and suspend the accounts involved.
      </p>

      <h2>3. Accounts</h2>
      <ul>
        <li>One person may not maintain multiple accounts, and accounts must not be shared or sold.</li>
        <li>You must provide accurate registration details and keep your password confidential. You are responsible for all activity on your account.</li>
        <li>We may suspend or terminate accounts that violate these Terms, impersonate others, or post fraudulent content.</li>
        <li>Employer accounts go through a verification review before their jobs are shown as verified. Verification is an ongoing process, not a guarantee of any outcome.</li>
      </ul>

      <h2>4. Employer obligations</h2>
      <ul>
        <li>Jobs you post must be genuine, lawful and accurately described — title, salary range, location, work mode and requirements.</li>
        <li>You must not request payment, "registration fees", "security deposits" or any monetary consideration from candidates.</li>
        <li>You must comply with applicable Indian laws, including the Shops and Establishments Act, minimum wage rules, and regulations governing work-from-home arrangements.</li>
        <li>You must handle candidate personal data per the Privacy Policy and the Digital Personal Data Protection Act, 2023.</li>
        <li>You must not misuse applications, résumés or interview recordings you receive through the Platform.</li>
      </ul>

      <h2>5. Candidate obligations</h2>
      <ul>
        <li>Provide truthful profile and application information. Falsified experience or identity may result in removal.</li>
        <li>Do not scrape, copy or republish listings without permission.</li>
        <li>Do not use the Platform for anything unlawful, misleading or harmful to other users.</li>
      </ul>

      <h2>6. Fees and payments</h2>
      <p>
        Candidates can always apply for free. Employers purchase job posting packs; candidates may optionally subscribe
        to HiroHome Pro or buy a one-time résumé PDF download. All prices are listed in Indian Rupees, inclusive of
        applicable GST unless stated otherwise. Payments are processed by Razorpay. HiroHome never stores card, UPI or
        netbanking credentials on its servers.
      </p>

      <h2>7. Content and intellectual property</h2>
      <p>
        You retain ownership of content you submit. By posting it, you grant HiroHome a worldwide, royalty-free licence
        to host, display and distribute it as needed to operate the Platform. The HiroHome name, logo, design and
        software are ours and may not be copied without written permission.
      </p>

      <h2>8. Disclaimers and limitation of liability</h2>
      <p>
        The Platform is provided "as is". We do not guarantee interviews, offers, employment, salary levels or hiring
        timelines, and we do not guarantee that any employer is honest at all times — though we verify and act on
        reports. To the maximum extent permitted by law, HiroHome's aggregate liability for any claim relating to the
        Platform shall not exceed the fees you actually paid us in the twelve months preceding the claim, and we shall
        not be liable for indirect or consequential losses, including lost wages or profits.
      </p>

      <h2>9. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of India. Subject to applicable consumer protection law, disputes shall be
        subject to the exclusive jurisdiction of the courts at New Delhi, or resolved by arbitration under the
        Arbitration and Conciliation Act, 1996, as HiroHome may elect.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these Terms from time to time. Material changes will be notified on the Platform or by email.
        Continued use after changes take effect constitutes acceptance.
      </p>
      <p className="text-xs text-slate-400">
        Questions about these Terms: hello@hirohome.in · Grievance: see Privacy Policy.
      </p>
    </LegalPage>
  );
}
