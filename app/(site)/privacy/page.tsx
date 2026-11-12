import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How HiroHome collects, uses and protects your personal data — India DPDP Act 2023 compliant draft.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 2026">
      <p>
        This Privacy Policy explains how HiroHome ("we", "us") collects, uses, stores and shares your personal data,
        and the rights you have under the Digital Personal Data Protection Act, 2023 ("DPDP Act") and other applicable
        laws. It applies to all visitors, candidates and employers using the Platform.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> name, email address, phone number, password hash, role (candidate or employer).</li>
        <li><strong>Profile data:</strong> headline, location, skills, experience, bio, and résumé files or built résumés you choose to upload or create.</li>
        <li><strong>Application data:</strong> jobs you apply to, cover letters, application status, interview recordings and assessment answers you submit.</li>
        <li><strong>Payment data:</strong> order references, plan, amount and payment status. Card, UPI and netbanking details are handled entirely by Razorpay; we never see or store them.</li>
        <li><strong>Technical data:</strong> IP address, browser type and device information used for security, rate limiting and fraud prevention.</li>
      </ul>

      <h2>2. Why we use it</h2>
      <ul>
        <li>To operate the Platform: accounts, listings, applications, interviews, notifications and support.</li>
        <li>To verify employers and keep the marketplace free of fraud and scams.</li>
        <li>To process payments and issue invoices you request.</li>
        <li>To comply with law — tax, audit, and lawful requests from authorities.</li>
        <li>To improve the Platform. We do not sell your personal data, and we do not build advertising profiles.</li>
      </ul>

      <h2>3. Legal basis</h2>
      <p>
        We process personal data on the basis of your consent at registration and where necessary to perform our
        contract with you (providing the service), and for our legitimate interests in keeping the marketplace safe, as
        recognised under the DPDP Act, 2023.
      </p>

      <h2>4. Who we share it with</h2>
      <ul>
        <li><strong>Employers</strong> receive only what they need to evaluate your application: your profile, résumé, cover letter and in-app interview/assessment results.</li>
        <li><strong>Service providers:</strong> Razorpay (payments), Resend (email delivery), Google (optional sign-in, only if you choose it), Jitsi (video interview links), and our hosting and storage providers (cloud infrastructure in India/Asia-Pacific).</li>
        <li><strong>Authorities:</strong> when required by law, court order or to prevent fraud and harm.</li>
      </ul>
      <p>We do not sell, rent or trade your personal data.</p>

      <h2>5. How long we keep it</h2>
      <p>
        Account data is retained while your account exists. Uploaded résumés are kept until you delete them or close
        your account. Application records are retained for as long as needed to resolve disputes and meet legal
        obligations, typically up to 8 years for financial records. You may ask us to delete your data — see "Your
        rights".
      </p>

      <h2>6. Your rights under the DPDP Act, 2023</h2>
      <ul>
        <li><strong>Access and correction:</strong> view and fix your profile at any time from your dashboard.</li>
        <li><strong>Erasure:</strong> request deletion of your account and associated personal data by writing to hello@hirohome.in with the subject "Data deletion". Some records may be retained where the law requires it (e.g., tax invoices).</li>
        <li><strong>Withdraw consent:</strong> you may withdraw consent for optional processing — note the app cannot function without the data needed for core features.</li>
        <li><strong>Grievance redressal:</strong> raise any concern with our Grievance Officer (see below). You also have the right to complain to the Data Protection Board of India.</li>
      </ul>

      <h2>7. Cookies</h2>
      <p>
        We use strictly necessary cookies (sign-in session, CSRF protection). We currently do not run third-party ad or
        analytics trackers. If we add analytics later, we will update this policy and the cookie banner will let you
        accept or decline non-essential cookies.
      </p>

      <h2>8. Security</h2>
      <p>
        We use HTTPS everywhere in production, httpOnly cookies, hashed passwords (bcrypt), server-side input
        validation, signed URLs for private files, and rate limiting. No system is perfectly secure — if you suspect an
        issue, write to hello@hirohome.in immediately.
      </p>

      <h2>9. Children</h2>
      <p>The Platform is not directed at anyone under 18. We do not knowingly collect data from minors.</p>

      <h2>10. Updates and grievance officer</h2>
      <p>
        We may update this policy from time to time and will post the changes here with a revised "last updated" date.
        Before launch, HiroHome will publish the name and contact details of its Grievance Officer on this page and on
        the Contact page as required by the DPDP Act, 2023 and the Information Technology Rules, 2021. Until then, reach
        us at: <strong>hello@hirohome.in</strong>.
      </p>
    </LegalPage>
  );
}
