/**
 * Security-focused end-to-end checks for HiroHome.
 *
 * Run with the dev server on http://localhost:3000 (demo mode):
 *   npm run dev
 *   node scripts/e2e-security.mjs
 *
 * Uses unique spoofed IPs per test so rate-limit buckets never collide
 * with the main e2e suite.
 */
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const prisma = new PrismaClient();

let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const ip = () => `10.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}`;

async function req(path, { method = "GET", body, headers = {}, ipAddress } = {}) {
  const finalHeaders = { ...headers };
  if (ipAddress) finalHeaders["X-Forwarded-For"] = ipAddress;
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const contentType = response.headers.get("content-type") ?? "";
  let data = null;
  const text = await response.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  return { status: response.status, headers: response.headers, data, text, contentType };
}

async function main() {
  const runIp = ip();

  // 1. Security headers on the homepage
  const home = await req("/");
  check("CSP header is set and restrictive", (home.headers.get("content-security-policy") ?? "").includes("default-src 'self'"));
  check("X-Frame-Options DENY", home.headers.get("x-frame-options") === "DENY");
  check("X-Content-Type-Options nosniff", home.headers.get("x-content-type-options") === "nosniff");
  check("Referrer-Policy set", Boolean(home.headers.get("referrer-policy")));
  check("CSP frame-ancestors none", (home.headers.get("content-security-policy") ?? "").includes("frame-ancestors 'none'"));

  // 2. CSRF: cross-origin state-changing request is rejected
  const csrf = await req("/api/auth/login", {
    method: "POST",
    headers: { Origin: "https://evil.example.com", "X-Forwarded-For": runIp },
    body: { email: "x@example.com", password: "x" },
  });
  check("Cross-origin POST is rejected (403)", csrf.status === 403, `got ${csrf.status}`);

  // 3. Same-origin OK path is not blocked by CSRF (fails on credentials, not 403)
  const sameOrigin = await req("/api/auth/login", {
    method: "POST",
    headers: { Origin: new URL(BASE).origin, "X-Forwarded-For": runIp },
    body: { email: "nobody@example.com", password: "WrongPass123!" },
  });
  check("Same-origin POST is not CSRF-blocked", sameOrigin.status !== 403, `got ${sameOrigin.status}`);

  // 4. Rate limit on login (per-IP bucket)
  const limitIp = ip();
  let lastStatus = 0;
  for (let i = 0; i < 12; i += 1) {
    const res = await req("/api/auth/login", {
      method: "POST",
      ipAddress: limitIp,
      body: { email: "brute@example.com", password: `Wrong-${i}-Pass` },
    });
    lastStatus = res.status;
  }
  check("Login rate limit kicks in (429)", lastStatus === 429, `got ${lastStatus}`);

  // 5. Health check
  const health = await req("/api/health");
  check("Health endpoint reports ok", health.status === 200 && health.data?.status === "ok" && health.data?.db === "ok");

  // 6. Webhook rejects invalid signatures
  const webhook = await req("/api/webhooks/razorpay", {
    method: "POST",
    headers: { "Razorpay-Signature": "deadbeef" },
    body: { event: "payment.captured" },
  });
  // Raw body needed — fetch with string body
  check("Webhook rejects bad signature", webhook.status === 400, `got ${webhook.status}`);

  // 7. Reports: validation + auth-optional creation
  const badReport = await req("/api/reports", {
    method: "POST",
    ipAddress: ip(),
    body: { jobId: "x", reason: "NOT_A_REASON" },
  });
  check("Report with invalid reason is rejected (400)", badReport.status === 400, `got ${badReport.status}`);

  const activeJob = await prisma.job.findFirst({ where: { status: "ACTIVE" }, select: { id: true, slug: true } });
  const missingJob = await req("/api/reports", {
    method: "POST",
    ipAddress: ip(),
    body: { jobId: "no-such-job-id", reason: "SCAM" },
  });
  check("Report for unknown job is rejected (404)", missingJob.status === 404, `got ${missingJob.status}`);

  if (activeJob) {
    const goodReport = await req("/api/reports", {
      method: "POST",
      ipAddress: ip(),
      body: { jobId: activeJob.id, reason: "SCAM", details: "e2e security test report" },
    });
    check("Report for existing job is accepted", goodReport.status === 200 && goodReport.data?.ok === true, `got ${goodReport.status}`);
    await prisma.jobReport.deleteMany({ where: { jobId: activeJob.id, details: "e2e security test report" } });
  } else {
    console.log("SKIP  report acceptance (no ACTIVE jobs in DB)");
  }

  // 8. Unauthenticated calls to privileged endpoints are rejected
  const adminPatch = await req("/api/admin/employers/any-id", {
    method: "PATCH",
    ipAddress: ip(),
    body: { isVerified: true },
  });
  check("Admin verify requires auth", adminPatch.status === 401 || adminPatch.status === 403, `got ${adminPatch.status}`);

  const premiumCheckout = await req("/api/premium/checkout", {
    method: "POST",
    ipAddress: ip(),
    body: { plan: "PRO_MONTHLY" },
  });
  check("Premium checkout requires auth", premiumCheckout.status === 401, `got ${premiumCheckout.status}`);

  const applyNoAuth = await req("/api/applications", {
    method: "POST",
    ipAddress: ip(),
    body: { jobId: activeJob?.id ?? "x", coverLetter: "x" },
  });
  check("Applying requires auth", applyNoAuth.status === 401, `got ${applyNoAuth.status}`);

  // 9. Sitemap and robots
  const sitemap = await req("/sitemap.xml");
  check("Sitemap renders with job URLs", sitemap.status === 200 && sitemap.text.includes("/jobs"), `got ${sitemap.status}`);
  const robots = await req("/robots.txt");
  check("robots.txt points to the sitemap", robots.status === 200 && robots.text.toLowerCase().includes("sitemap"), `got ${robots.status}`);

  // 10. Job detail carries OG tags and JobPosting JSON-LD
  if (activeJob) {
    const jobPage = await req(`/jobs/${activeJob.slug}`);
    check("Job page has og:title", jobPage.text.includes('property="og:title"'));
    check("Job page has JobPosting JSON-LD", jobPage.text.includes('"@type":"JobPosting"'));
  } else {
    console.log("SKIP  job page SEO checks (no ACTIVE jobs in DB)");
  }

  // 11. Unknown routes serve the branded 404
  const notFound = await req("/this-route-does-not-exist");
  check("Unknown route returns 404 page", notFound.status === 404 && notFound.text.includes("Error 404"), `got ${notFound.status}`);

  // 12. Verification link tokens: a stored hash is not usable as a link token
  const mailUser = await prisma.user.findFirst({ where: { email: { startsWith: "e2e-" } }, include: { tokens: true } });
  if (mailUser?.tokens?.[0]) {
    const stored = mailUser.tokens[0];
    const asLink = await req(`/api/auth/verify-email?token=${stored.token}`);
    check("Stored hash is not accepted as a link token (400)", asLink.status === 400, `got ${asLink.status}`);
  } else {
    console.log("SKIP  link-token hash check (no e2e-created user with a token found — run e2e-resume first)");
  }

  // 13. Demo-checkout guard marker (production behavior documented; route exists)
  const checkoutFail = await req("/api/payments/fail", { method: "POST", ipAddress: ip(), body: {} });
  check("Fail endpoint validates input", checkoutFail.status === 401 || checkoutFail.status === 400 || checkoutFail.status === 429, `got ${checkoutFail.status}`);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log("Failed:", failures.join("; "));
    process.exit(1);
  }
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("Security e2e crashed:", error);
  await prisma.$disconnect();
  process.exit(1);
});
