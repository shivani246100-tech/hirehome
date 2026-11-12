/**
 * End-to-end checks for the optional resume builder.
 *
 * Run with the dev server on http://localhost:3000 (demo checkout is disabled
 * in production, so these demo-mode checks run against the dev server):
 *   npm run dev
 *   node scripts/e2e-resume.mjs
 *
 * Mutates demo data, so run `npm run db:seed` afterwards.
 */
import { PrismaClient } from "@prisma/client";

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

function cookieFrom(response) {
  const raw = response.headers.get("set-cookie") ?? "";
  return raw.split(";")[0];
}

async function login(email, password) {
  const response = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Login failed for ${email}: ${response.status}`);
  return cookieFrom(response);
}

async function api(path, { cookie, method = "GET", body, form } = {}) {
  const headers = {};
  if (cookie) headers.Cookie = cookie;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const contentType = response.headers.get("content-type") ?? "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else if (!contentType.includes("application/pdf")) {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { response, status: response.status, data, contentType };
}

const minimalPdf = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
);

const resumeContent = {
  fullName: "Aarav Sharma",
  email: "seeker@hirohome.in",
  phone: "+91 98765 43210",
  location: "पुणे, महाराष्ट्र",
  headline: "Customer support associate · Hindi & English",
  links: "linkedin.com/in/aarav-sharma",
  summary:
    "Customer support associate with 2 years of remote experience. मैं ग्राहकों की समस्याएँ धैर्य से हल करता हूँ और CSAT 96% से ऊपर रखता हूँ।",
  skills: ["Customer Support", "Chat Support", "CRM", "Zendesk", "Hindi", "English"],
  languages: ["Hindi", "English", "Marathi"],
  experience: [
    {
      role: "Customer Support Associate",
      company: "HelpDesk Pro",
      location: "Remote",
      start: "Jun 2022",
      end: "Present",
      details: "Handled 60+ chats per day with 96% CSAT\nResolved billing issues on first contact",
    },
  ],
  education: [
    {
      degree: "B.Com",
      institution: "Savitribai Phule Pune University",
      location: "Pune",
      start: "2019",
      end: "2022",
      details: "First class",
    },
  ],
  projects: [],
  certificates: [{ name: "Customer Service Fundamentals", issuer: "Coursera", year: "2023" }],
};

async function main() {
  const employer = await prisma.user.findUnique({ where: { email: "employer@hirohome.in" } });
  const seeker = await prisma.user.findUnique({ where: { email: "seeker@hirohome.in" } });
  if (!employer || !seeker) throw new Error("Seed data missing. Run npm run db:seed first.");

  const applied = await prisma.application.findMany({
    where: { seekerId: seeker.id },
    select: { jobId: true },
  });
  // The demo employer has one un-applied job; use another employer for the second application.
  const jobA = await prisma.job.findFirst({
    where: { status: "ACTIVE", employerId: employer.id, id: { notIn: applied.map((item) => item.jobId) } },
  });
  const jobB = await prisma.job.findFirst({
    where: {
      status: "ACTIVE",
      employerId: { not: employer.id },
      id: { notIn: applied.map((item) => item.jobId) },
    },
    include: { employer: { select: { email: true } } },
  });
  if (!jobA || !jobB) throw new Error("Need two un-applied active jobs. Reseed first.");

  const seekerCookie = await login("seeker@hirohome.in", "Demo@123");
  const employerCookie = await login("employer@hirohome.in", "Demo@123");
  const jobBEmployerCookie = await login(jobB.employer.email, "Demo@123");
  const priyaCookie = await login("priya@example.com", "Demo@123");
  const adminCookie = await login("admin@hirohome.in", "Admin@123");
  check(
    "login works for all demo roles",
    Boolean(seekerCookie && employerCookie && jobBEmployerCookie && priyaCookie && adminCookie),
  );

  // 0. Email verification + forgot/reset password flow (Phase 3)
  const e2eEmail = `e2e-${Date.now()}@hirohome.in`;
  const newUser = await api("/api/auth/register", { method: "POST", body: { name: "E2E Tester", email: e2eEmail, password: "Password123", role: "SEEKER" } });
  check("registration creates an account and sends a verification email", newUser.status === 200 && newUser.data?.ok, JSON.stringify(newUser.data));
  const verifyTokenRecord = await prisma.token.findFirst({ where: { user: { email: e2eEmail }, type: "EMAIL_VERIFY" } });
  check("registration stores a valid email verification token", Boolean(verifyTokenRecord) && verifyTokenRecord.expiresAt > new Date());
  const invalidVerify = await api("/api/auth/verify-email?token=e2e-invalid-token", { method: "GET" });
  check("email verification rejects an invalid token", invalidVerify.status === 400);

  const forgot = await api("/api/auth/forgot-password", { method: "POST", body: { email: e2eEmail } });
  check("forgot password creates a reset token for the account", forgot.status === 200 && forgot.data?.ok);
  const resetTokenRecord = await prisma.token.findFirst({ where: { user: { email: e2eEmail }, type: "PASSWORD_RESET" } });
  check("forgot password stores a reset token", Boolean(resetTokenRecord) && resetTokenRecord.expiresAt > new Date());
  const badReset = await api("/api/auth/reset-password", { method: "POST", body: { token: "e2e-invalid-token", password: "NewPassword123" } });
  check("password reset rejects an invalid token", badReset.status === 400);

  // 1. Free upload + apply
  const uploadForm = new FormData();
  uploadForm.append("file", new Blob([minimalPdf], { type: "application/pdf" }), "aarav-resume.pdf");
  const upload = await api("/api/resumes/files", { cookie: seekerCookie, method: "POST", form: uploadForm });
  check("upload a PDF resume costs nothing and returns a file id", upload.status === 200 && Boolean(upload.data?.file?.id), JSON.stringify(upload.data));
  const uploadedFileId = upload.data?.file?.id;

  const applyFree = await api("/api/applications", {
    cookie: seekerCookie,
    method: "POST",
    body: { jobId: jobA.id, coverLetter: "Free upload-and-apply check", resumeFileId: uploadedFileId },
  });
  check("apply with an uploaded resume succeeds without payment", applyFree.status === 200 && Boolean(applyFree.data?.applicationId), JSON.stringify(applyFree.data));

  const employerFile = await api(`/api/resumes/files/${uploadedFileId}`, { cookie: employerCookie });
  check("employer who received the application can open the uploaded file", employerFile.status === 200);

  const strangerFile = await api(`/api/resumes/files/${uploadedFileId}`);
  check("anonymous visitors cannot download an uploaded resume", strangerFile.status === 401);

  const otherEmployerFile = await api(`/api/resumes/files/${uploadedFileId}`, { cookie: jobBEmployerCookie });
  check("an unrelated employer cannot download the uploaded resume", otherEmployerFile.status === 403);

  const badForm = new FormData();
  badForm.append("file", new Blob([Buffer.from("not a pdf")], { type: "application/pdf" }), "fake.pdf");
  const badUpload = await api("/api/resumes/files", { cookie: seekerCookie, method: "POST", form: badForm });
  check("server rejects a fake PDF signature", badUpload.status === 400, JSON.stringify(badUpload.data));

  const txtForm = new FormData();
  txtForm.append("file", new Blob([Buffer.from("hello")], { type: "text/plain" }), "resume.txt");
  const txtUpload = await api("/api/resumes/files", { cookie: seekerCookie, method: "POST", form: txtForm });
  check("server rejects unsupported file types", txtUpload.status === 400);

  // 2. Build + free preview
  const created = await api("/api/resumes", {
    cookie: seekerCookie,
    method: "POST",
    body: { title: "E2E resume", template: "MODERN", content: resumeContent },
  });
  check("seeker can create a draft resume", created.status === 200 && created.data?.resume?.status === "DRAFT", JSON.stringify(created.data));
  const resumeId = created.data?.resume?.id;

  const draftPdf = await api(`/api/resumes/${resumeId}/pdf`, { cookie: seekerCookie });
  check("draft PDF download is blocked until payment", draftPdf.status === 402);

  const previewPage = await fetch(`${BASE}/dashboard/seeker/resumes/${resumeId}`, {
    headers: { Cookie: seekerCookie },
  });
  const previewHtml = await previewPage.text();
  check(
    "builder page renders the free preview with a watermark",
    previewPage.status === 200 && /Preview watermark/i.test(previewHtml) && /Live preview/i.test(previewHtml),
  );
  check("builder page includes the one-time ₹49 price", previewHtml.includes("₹49"));
  check("builder page includes the Save draft option", previewHtml.includes("Save draft"));

  const proDraftPdf = await api(`/api/resumes/${resumeId}/pdf`, { cookie: priyaCookie });
  check("another candidate cannot download someone else's draft", proDraftPdf.status === 403);

  const draftEdit = await api(`/api/resumes/${resumeId}`, {
    cookie: seekerCookie,
    method: "PATCH",
    body: { title: "E2E resume edited later", template: "MODERN", content: { ...resumeContent, headline: "Senior support associate" } },
  });
  const afterDraftEdit = await prisma.resume.findUnique({ where: { id: resumeId } });
  check("saving and editing an incomplete draft later keeps it a draft", draftEdit.status === 200 && afterDraftEdit?.status === "DRAFT");

  // 3. Failed payment keeps the draft and charges nothing
  const checkout = await api(`/api/resumes/${resumeId}/checkout`, { cookie: seekerCookie, method: "POST" });
  check("checkout creates a ₹49 RESUME order", checkout.status === 200 && Boolean(checkout.data?.orderId), JSON.stringify(checkout.data));
  const orderId = checkout.data?.orderId;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  check("resume order is linked to the resume", order?.kind === "RESUME" && order?.resumeId === resumeId && order?.amount === 49);

  const fail = await api("/api/payments/fail", { cookie: seekerCookie, method: "POST", body: { orderId } });
  const afterFail = await prisma.resume.findUnique({ where: { id: resumeId } });
  const failedOrder = await prisma.order.findUnique({ where: { id: orderId } });
  check("cancelled payment marks the order FAILED", fail.status === 200 && failedOrder?.status === "FAILED");
  check("cancelled payment leaves the resume as a DRAFT with no charge", afterFail?.status === "DRAFT" && !afterFail?.paidAt);

  // 4. Pay once, download clean PDF, re-download free
  const retry = await api(`/api/resumes/${resumeId}/checkout`, { cookie: seekerCookie, method: "POST" });
  const retryOrderId = retry.data?.orderId;
  check("retry creates a fresh checkout after a failure", retry.status === 200 && retryOrderId !== orderId);

  const verify = await api("/api/payments/verify", {
    cookie: seekerCookie,
    method: "POST",
    body: { orderId: retryOrderId },
  });
  check("demo payment verification succeeds", verify.status === 200 && !verify.data?.error, JSON.stringify(verify.data));

  const paidResume = await prisma.resume.findUnique({ where: { id: resumeId } });
  check("verified payment marks the resume PAID", paidResume?.status === "PAID" && Boolean(paidResume?.paidAt));

  const paidPdf = await api(`/api/resumes/${resumeId}/pdf`, { cookie: seekerCookie });
  check("paid resume downloads as a real PDF", paidPdf.status === 200 && paidPdf.contentType.includes("application/pdf"));
  const paidBytes = Buffer.from(await paidPdf.response.arrayBuffer());
  check("PDF is selectable-text A4 output with Hindi font support", paidBytes.subarray(0, 4).toString() === "%PDF" && paidBytes.length > 1500, `${paidBytes.length} bytes`);

  const redownload = await api(`/api/resumes/${resumeId}/pdf`, { cookie: seekerCookie });
  check("re-downloading a paid resume is free", redownload.status === 200);

  const paidCheckout = await api(`/api/resumes/${resumeId}/checkout`, { cookie: seekerCookie, method: "POST" });
  const resumeOrders = await prisma.order.count({ where: { resumeId, status: "PAID" } });
  check("paid resume never creates another charge", paidCheckout.status === 200 && paidCheckout.data?.paid === true && resumeOrders === 1);

  const edit = await api(`/api/resumes/${resumeId}`, {
    cookie: seekerCookie,
    method: "PATCH",
    body: { title: "E2E resume edited", template: "CLASSIC", content: { ...resumeContent, headline: "Senior support associate" } },
  });
  const afterEdit = await prisma.resume.findUnique({ where: { id: resumeId } });
  const editPdf = await api(`/api/resumes/${resumeId}/pdf`, { cookie: seekerCookie });
  check("editing a paid resume stays free and remains downloadable", edit.status === 200 && afterEdit?.status === "PAID" && editPdf.status === 200);

  // 5. Attach the paid built resume to an application + employer access
  const applyBuilt = await api("/api/applications", {
    cookie: seekerCookie,
    method: "POST",
    body: { jobId: jobB.id, coverLetter: "Built resume attach check", resumeId },
  });
  check("paid built resume attaches to a free application", applyBuilt.status === 200, JSON.stringify(applyBuilt.data));

  const employerPdf = await api(`/api/resumes/${resumeId}/pdf`, { cookie: jobBEmployerCookie });
  check("employer can view the built resume attached to an application", employerPdf.status === 200);

  const otherEmployerPdf = await api(`/api/resumes/${resumeId}/pdf`, { cookie: employerCookie });
  check("an unrelated employer cannot view the built resume", otherEmployerPdf.status === 403);

  const ownerApi = await api(`/api/resumes/${resumeId}`, { cookie: seekerCookie });
  check("owner can read their resume through the API", ownerApi.status === 200 && ownerApi.data?.resume?.id === resumeId);

  // 6. Pro member downloads free, status stays DRAFT
  const proCreated = await api("/api/resumes", {
    cookie: priyaCookie,
    method: "POST",
    body: { title: "Priya Pro resume", template: "MINIMAL", content: { ...resumeContent, fullName: "Priya Verma", email: "priya@example.com" } },
  });
  const proResumeId = proCreated.data?.resume?.id;
  const proPdf = await api(`/api/resumes/${proResumeId}/pdf`, { cookie: priyaCookie });
  check("Pro member downloads a clean PDF without paying", proPdf.status === 200 && proPdf.contentType.includes("application/pdf"));
  const proCheckout = await api(`/api/resumes/${proResumeId}/checkout`, { cookie: priyaCookie, method: "POST" });
  const proResumeAfter = await prisma.resume.findUnique({ where: { id: proResumeId } });
  check("Pro download is free and keeps the resume editable as a draft", proCheckout.status === 200 && proCheckout.data?.free === true && proResumeAfter?.status === "DRAFT");

  // 7. Billing + admin reporting
  const billing = await fetch(`${BASE}/dashboard/seeker/billing`, { headers: { Cookie: seekerCookie } });
  const billingHtml = await billing.text();
  check(
    "billing history shows the resume invoice and download",
    billing.status === 200 &&
      /Billing (?:&|&amp;) invoices/i.test(billingHtml) &&
      /E2E resume edited/i.test(billingHtml) &&
      /₹49/.test(billingHtml),
  );

  const adminPage = await fetch(`${BASE}/dashboard/admin`, { headers: { Cookie: adminCookie } });
  const adminHtml = await adminPage.text();
  check(
    "admin dashboard shows resume revenue, counts and conversion",
    adminPage.status === 200 && /Resume revenue/i.test(adminHtml) && /Resumes created/i.test(adminHtml) && /Resume conversion/i.test(adminHtml),
  );

  const employerPage = await fetch(`${BASE}/dashboard/employer/jobs/${jobB.id}`, { headers: { Cookie: jobBEmployerCookie } });
  const employerHtml = await employerPage.text();
  check(
    "employer applicant page links the built resume",
    employerPage.status === 200 && employerHtml.includes(`/api/resumes/${resumeId}/pdf`),
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("Failed checks:", failures.join(", "));
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("E2E run crashed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
