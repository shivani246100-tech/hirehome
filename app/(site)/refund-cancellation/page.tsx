import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy",
  description: "When and how HiroHome refunds employer job posting packs, HiroHome Pro and résumé purchases.",
  alternates: { canonical: "/refund-cancellation" },
};

export default function RefundCancellationPage() {
  return (
    <LegalPage title="Refund and Cancellation Policy" updated="November 2026">
      <p>
        Last updated: November 2026. This policy explains how refunds and cancellations work for purchases made on
        HiroHome. All prices are in Indian Rupees (₹) and, where applicable, include GST as shown at checkout or on
        your invoice.
      </p>

      <h2>1. Candidate purchases are never required</h2>
      <p>
        Applying to jobs and attending interviews is always free. HiroHome Pro and the optional ₹49 résumé download
        are strictly optional conveniences — you never need them to get hired.
      </p>

      <h2>2. Résumé builder (₹49 one-time)</h2>
      <ul>
        <li><strong>Before payment:</strong> designing, editing and downloading the watermarked preview is always free. You can edit forever without paying.</li>
        <li><strong>After payment:</strong> your clean PDF is unlocked permanently and re-downloading it is free, forever.</li>
        <li><strong>Refunds:</strong> because the product is delivered instantly, payments are generally non-refundable once the clean PDF is made available for download.</li>
        <li><strong>If it fails:</strong> if the clean PDF cannot be generated twice after a successful payment, we refund the ₹49 in full to your original payment method within 5–7 business days. Email hello@hirohome.in with your order ID.</li>
        <li><strong>HiroHome Pro members</strong> get unlimited free résumé downloads while membership is active and are never charged for them.</li>
      </ul>

      <h2>3. HiroHome Pro membership (₹199/month or ₹999/year)</h2>
      <ul>
        <li><strong>Cancellation:</strong> you can cancel anytime from your dashboard. Your benefits continue until the end of the paid period; no partial-month refunds are made.</li>
        <li><strong>Cooling-off:</strong> if you cancel within 7 days of purchase and have not used any Pro benefit (e.g., a free résumé download), we issue a full refund to your original payment method.</li>
        <li>After the cooling-off window, renewals already paid are non-refundable.</li>
      </ul>

      <h2>4. Employer job posting packs (Free / ₹499 / ₹999 / ₹2,099)</h2>
      <ul>
        <li>The <strong>free plan</strong> carries no charge and nothing to refund.</li>
        <li><strong>Unused packs:</strong> if none of the posts included in a pack has been used and the pack has not expired, you may request a refund within 7 days of payment.</li>
        <li><strong>Used packs:</strong> once a job has gone live (a post has been published), the corresponding post from the pack is consumed and is non-refundable.</li>
        <li><strong>Removed jobs:</strong> if we remove a paid listing for violating our policies (fake job, pay-to-apply scam, duplicate), the pack credit is forfeited — this protects candidates and honest employers.</li>
        <li><strong>Failed or cancelled checkouts</strong> charge nothing. If money was debited but the order shows unpaid, Razorpay auto-reverses it; write to hello@hirohome.in with your order ID and we will reconcile it.</li>
        <li>GST invoices are shared on request at the email address used for purchase.</li>
      </ul>

      <h2>5. How to request a refund</h2>
      <ul>
        <li>Email <strong>hello@hirohome.in</strong> with the subject "Refund request" and include your order ID, registered email and payment reference.</li>
        <li>We acknowledge within 1 business day and resolve within 5–7 business days.</li>
        <li>Refunds go back to the original payment method only (UPI, card, netbanking). Bank/UPI processing times are outside our control.</li>
      </ul>

      <h2>6. Chargebacks</h2>
      <p>
        If you believe you were charged incorrectly, contact us first — we will make it right quickly. Initiating a
        chargeback without contacting us may result in account suspension pending investigation.
      </p>

      <h2>7. Contact</h2>
      <p>
        Refund or cancellation questions: <strong>hello@hirohome.in</strong>
        <br />
        Grievance Officer: will be appointed and published here before launch (see Privacy Policy).
      </p>
    </LegalPage>
  );
}
