# HiroHome

HiroHome is a work-from-home job marketplace for India. Employers post remote roles, candidates
apply free, and interviews happen inside the app (scored assessments, video interviews and optional
recorded video intros).

## Status: launch-ready code, pending external setup

All seven work phases are complete and verified locally by an automated e2e suite:

- `npm run build` → **passes** (production bundle, type-checked, 30 static pages + API routes).
- `npm run test:e2e:resume` → **42/42 checks pass** (demo mode, dev server).
- `npm run test:e2e:security` → **23/23 checks pass** (CSRF, headers, rate limits, health, SEO, reports).

What remains is **external setup that only you can do** — accounts, domains and credentials (see
"Your to-do list before launch" at the bottom). The code itself is production-ready.

## Why applications are free

Charging candidates per application is the clearest signal of a fake job portal and creates legal and
trust problems in India. HiroHome earns money from:

- **Employer posting packs** — Free (1 post / 20 days), ₹499 (5 posts / 45 days), ₹999 (10 posts / 60 days), ₹2,099 (50 posts / 1 year)
- **Optional HiroHome Pro** — ₹199 / month or ₹999 / year for candidates
- **Optional resume builder** — upload your own resume free, or build one and pay ₹49 once per clean PDF (free with Pro)

Candidates never pay to apply or interview. Uploading a resume and applying is always free.
Owner/admin accounts can post jobs for free with no plan limit or checkout.

## Tech stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS v4
- Prisma 6 + SQLite (dev) / PostgreSQL (production)
- JWT cookie auth (email/password + optional Google OAuth)
- Zod validation, bcrypt password hashing, lucide icons
- Razorpay checkout (demo mode in development; **disabled in production**, real Razorpay only)
- `pdf-lib` + `@pdf-lib/fontkit` for server-side A4 PDF generation (Noto Sans Devanagari for Hindi)
- AWS S3 / Cloudflare R2 for private file storage in production (local disk in development)

## Run locally

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000. If the database already exists, just run `npm run db:seed` again to reset the demo data.

> **Windows / dev-machine note:** do not run `npm run build` while `next dev` is running — they share the
> `.next` directory and the dev server cache will corrupt. Stop the dev server first (or delete `.next`
> and restart dev) whenever you switch between building and developing. If pages start 500ing with
> `SyntaxError: Unexpected end of JSON input`, delete `.next` and restart — that machine glitch is
> never an app bug.

## Demo accounts (development only)

| Role | Email | Password |
| --- | --- | --- |
| Job seeker | `seeker@hirohome.in` | `Demo@123` |
| Employer | `employer@hirohome.in` | `Demo@123` |
| Owner / admin | `admin@hirohome.in` | `Admin@123` |

Other seeded employer logins (same password `Demo@123`):
`kabir@pixelcraft.in`, `neha@databridge.in`, `arjun@codeharbor.in`, `sana@growthleaf.in`

These accounts are created **only** by `npm run db:seed` (development). The production seed
(`npm run db:seed:prod`) creates no demo data (see below).

## Testing

The e2e suites need the dev server (demo checkout is development-only):

```bash
npm run dev             # terminal 1
npm run db:seed         # reset demo data (suites mutate it)
node scripts/e2e-resume.mjs     # 42 checks — payments, resumes, uploads, access control
node scripts/e2e-security.mjs   # 23 checks — CSRF, headers, rate limits, health, SEO, reports
npm run db:seed         # reset demo data afterwards
```

`E2E_BASE_URL=http://host:port node scripts/e2e-resume.mjs` targets a non-default URL.

## Environment

Copy `.env.example` to `.env`. `.env` is never committed. Every variable is documented in
`.env.example`. Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` in dev; `postgresql://…` in production |
| `JWT_SECRET` | **production: yes (min 32 chars)** | Session signing. Server refuses to start in production without a strong value |
| `NEXT_PUBLIC_APP_URL` | recommended | Public URL (emails, sitemap, OG tags) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | production for payments | Razorpay live/test keys |
| `RAZORPAY_WEBHOOK_SECRET` | production for payments | Webhook signature verification |
| `RESEND_API_KEY` / `RESEND_FROM` | optional | Verification / reset / notification emails (console-logged in dev without it) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Google login (button hidden without keys) |
| `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | **production for uploads** | Private resume/video storage (S3 or R2) |
| `S3_ENDPOINT` / `S3_REGION` / `S3_FORCE_PATH_STYLE` | optional | Custom endpoint (R2/MinIO) — see `.env.example` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | production seed only | First admin account for `db:seed:prod` |

Behavior when things are missing, by design:

- Production without `RAZORPAY_*` → checkout is **disabled** and payment endpoints return `503`. Demo checkout exists only outside production.
- Production without `S3_*` → uploads return `503` with a clear error. Local disk storage is development-only.
- Missing `RESEND_*` → verification/reset links are printed to the server console (development).
- Missing `GOOGLE_*` → the Google button is hidden automatically.
- Missing/weak `JWT_SECRET` in production → the server **refuses to start**.
- `/api/health` → liveness/readiness probe (200 `{"status":"ok","db":"ok"}` or 503). Use for uptime monitoring.

## Database: SQLite dev → PostgreSQL production

Development keeps `prisma/schema.prisma` (SQLite). Production uses a byte-identical datamodel as
`prisma/schema.postgres.prisma` (PostgreSQL) with ready-made migrations in `prisma/migrations/`.

First production deploy:

```bash
# 1. point DATABASE_URL at your Postgres instance
npm run db:generate:pg          # generate the postgres client
npm run db:migrate:deploy       # apply prisma/migrations (DDL, no data changes)
DATABASE_URL="postgresql://…" ADMIN_EMAIL="you@company.in" ADMIN_PASSWORD="a-long-strong-password" npm run db:seed:prod
```

`db:seed:prod` is idempotent and creates **no demo accounts**: it upserts the 10 reference job
categories and creates the first admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. It never deletes data.
`npm run vercel-build` (used on Vercel) regenerates the postgres client automatically before building.

> If you later change the datamodel, keep both schema files in sync:
> `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.postgres.prisma --script`
> generates replacement DDL — and consider `prisma migrate dev` against a scratch Postgres database.

## Security

- JWT (`jose`-style via `jsonwebtoken`) session cookie: `httpOnly`, `sameSite=lax`, `secure` in production, 7-day expiry.
- In production the server **fails to start** without a strong `JWT_SECRET` (min 32 chars, no placeholder values).
- Passwords: bcrypt (10 rounds; 12 for production-seeded admin).
- Email/password reset tokens: stored **only as SHA-256 hashes**, single-use, expiring. (A raw
  verification/reset link token therefore always works exactly once and is never recoverable from the DB.)
- Rate limiting (per IP/user, in-memory) on login, register, password reset, applications, résumé/video uploads,
  job posting and all payment endpoints. Single-instance deployments only — move to Redis for multi-instance.
- Security headers on every response: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` (production), and a
  Content-Security-Policy that only allows `unsafe-eval` in development (Next dev tooling); production CSP is strict.
- CSRF: state-changing (`POST`/`PUT`/`PATCH`/`DELETE`) cross-origin browser requests are rejected with `403`
  unless the `Origin` header matches the `Host`. (`curl`/server-to-server calls without `Origin` are allowed.)
- Server-side input validation with zod everywhere; résumé uploads verified by extension, MIME type,
  size (5 MB) and file signature. Interview videos limited to 30 MB and audio/video MIME types.
- Private files (résumés, interview recordings) are never publicly served: access is checked server-side,
  then served via short-lived (5-minute) presigned S3/R2 URLs, or streamed from disk in development.
- No candidate is ever charged to apply or interview. Candidates pay only for optional extras (Pro, ₹49 résumé).

## SEO, legal and trust

- Pages: `/about`, `/contact`, `/terms`, `/privacy`, `/refund-cancellation` — sensible India-appropriate
  drafts. **All are marked "to be reviewed by a lawyer"** — see the to-do list.
- Cookie consent banner (essential cookies only; no ad trackers).
- `sitemap.xml` and `robots.txt` (dynamic, includes active job listings; dashboards/API/checkout are disallowed).
- Open Graph + Twitter cards, `metadataBase` from `NEXT_PUBLIC_APP_URL`, canonical URLs.
- Job detail pages emit `JobPosting` JSON-LD (salary, location=telecommute, employer, validThrough).
- Employer verification badge on all job cards/detail pages; **"Report this job"** button on every job page
  (rate-limited, anyone can report); admin console has a "Job reports" review/dismiss queue.
- Dashboards, checkout and account pages are `noindex`.
- A default `app/icon.svg` (brand mark) serves as the favicon.

## Deploy to Vercel

1. Push this repo to GitHub/GitLab and import it on Vercel.
2. Project settings → **Environment Variables**: set everything from `.env.example` with production values
   (`DATABASE_URL` = postgres URL, `JWT_SECRET` = long random string, `NEXT_PUBLIC_APP_URL` = your domain,
   Razorpay/Resend/S3/Google keys, `ADMIN_EMAIL` + `ADMIN_PASSWORD` for the one-off seed).
3. Settings → **Build & Development Settings** → Build Command: `npm run vercel-build` (regenerates the
   Postgres client, then `next build`). Install Command: `npm install` (default). Output: Next.js default.
4. First deploy → then run **once** locally or in a Vercel function/one-off job:
   `DATABASE_URL="postgresql://…" npm run db:seed:prod` (creates reference categories + your admin account).
   (Or run it as a one-off `npx prisma db execute`-style command from any environment with the same `DATABASE_URL`.)
5. Point Razorpay webhooks to `https://<your-domain>/api/webhooks/razorpay` (subscribe to `payment.captured`).
6. Google OAuth redirect URI: `https://<your-domain>/api/auth/google/callback`.
7. Health checks / uptime monitor: `GET https://<your-domain>/api/health`.
8. Verify `https://<your-domain>/sitemap.xml` and `/robots.txt` render on the live domain.

For a non-Vercel deploy: `npm ci && npm run vercel-build && npm start` behind TLS (HSTS is on in production),
and set all env vars from `.env.example`.

## Phase checklist

- [x] **Phase 1 — Design and UX**: consistent brand system (colors, logo, typography, buttons, cards) on every
      page; redesigned homepage (hero + search, categories, featured jobs, how-it-works, employer pricing, FAQ,
      trust points, footer); polished listings, apply flow, auth, checkout, all dashboards and the resume builder;
      responsive/mobile-first; loading (`app/loading.tsx`), branded 404 (`app/not-found.tsx`) and 500
      (`app/error.tsx`); labels, focus rings, contrast, aria labels, skip-to-content link, logo alt; verified
      contrast on primary buttons.
- [x] **Phase 2 — Real payments**: demo checkout fully disabled in production (`503` elsewhere); server-side
      Razorpay signature verification (fixed `timingSafeEqual` on mismatched-length input → now 400, not 500);
      webhook with signature verification + atomic idempotent crediting (no double charge — verified/webhook
      races fixed with conditional `updateMany` claims); failed/cancelled handling (`/api/payments/fail`) keeps
      drafts; billing invoices incl. receipts; **owner/admin free posting unchanged and free**; no orphan
      `PENDING_PAYMENT` jobs created when payments are unconfigured (503 happens *before* job creation).
- [x] **Phase 3 — Accounts and email**: email verification on registration; forgot/reset flow;
      console-link fallback in development; **fixed a critical bug: raw token was stored hashed and the hash
      was emailed as the link** (verification/reset links never worked end-to-end — now the raw token is emailed
      and only its hash is stored; single-use, expiring, covered by e2e). Google login kept working via env keys.
- [x] **Phase 4 — Security**: strong `JWT_SECRET` enforced in production; rate limiting on login/register/reset/
      apply/upload/payment + new: video uploads and job posting; security headers + CSP (dev-only `unsafe-eval`),
      HSTS, X-Frame-Options, nosniff, Referrer/Permissions-Policy; secure httpOnly cookies; Origin-vs-Host CSRF
      (fixed a latent flaw where the 403 never reached clients: the blocked response reused `NextResponse.next()`
      headers carrying Next's internal `x-middleware-next: 1`, so the route ran anyway — now a fresh blocked
      response; covered by `e2e-security`); uploads validated by signature/MIME/size; production seed contains
      **zero demo data** (categories + first admin from env; idempotent, never wipes the DB).
- [x] **Phase 5 — Infrastructure**: switchable DB (SQLite dev / PostgreSQL prod via `prisma/schema.postgres.prisma`
      + migrations in `prisma/migrations/`); S3-compatible private storage for resumes/videos with presigned
      5-minute URLs (local disk in dev only); `.env.example` fully documented; `/api/health`; Vercel build script
      (`vercel-build`) and deploy guide (above).
- [x] **Phase 6 — Legal, SEO & trust**: About/Contact/Terms/Privacy/Refund pages (lawyer-review flagged); cookie
      consent; `robots.txt`, dynamic `sitemap.xml` (includes active jobs), OG/Twitter/canonical metadata,
      `JobPosting` JSON-LD on job pages; `icon.svg` favicon; dashboards are `noindex`; employer verification badge;
      **"Report this job"** button + admin report-review queue (`/api/reports`, anon allowed, rate-limited,
      admin PATCH `/api/admin/reports/[id]`); candidates are never charged — reinforced in UI copy.
- [x] **Phase 7 — Final check**: build green; **42/42** resume e2e; **23/23** security e2e; new `e2e-security.mjs`;
      this README (what's done + launch checklist); Hindi summary below.

## Your to-do list before launch (external setup — only you can do these)

**Accounts & domains**
1. Buy/point the production domain (e.g. `hirohome.in`); set DNS to your host.
2. Create a production Postgres database (Vercel Postgres, Supabase, Neon, RDS, or similar) and note the `postgresql://` URL.
3. Create the Razorpay **live-mode** account; complete activation (business docs, bank account); take the **live** key/secret.
4. Point a Razorpay webhook at `https://<domain>/api/webhooks/razorpay` (events: `payment.captured`); save the webhook secret.
5. Resend (or another provider): verify the `hirohome.in` sending domain (SPF/DKIM/DMARC) and create the API key; confirm `RESEND_FROM` works.
6. Google Cloud OAuth client (Web): authorized redirect URI `https://<domain>/api/auth/google/callback` (+ `http://localhost:3000/api/auth/google/callback` for dev). Copy the client ID/secret.
7. S3 bucket or Cloudflare R2 (private, no public access): bucket, access key, endpoint if not AWS; region `auto` for R2.

**Environment (production)**
8. `JWT_SECRET` — long random string (`openssl rand -base64 48`); verify the app boots with it (it refuses weak values).
9. All other vars from `.env.example` with production values; `NEXT_PUBLIC_APP_URL=https://<domain>`.
10. Run the production seed once: `DATABASE_URL=… ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:seed:prod` (categories + your admin).
11. Razorpay: do **one** real ₹1 payment end-to-end in live mode before announcing (place, pay, see job/resume/Pro applied, invoice in billing, webhook received). Then refund it from the Razorpay dashboard.

**Legal & trust**
12. **Lawyer review of `/terms`, `/privacy`, `/refund-cancellation`** — they are drafts flagged as such; also fill the Grievance Officer's name/contact (Privacy + Contact pages) once appointed, and the registered office + GST details (Contact/About, footer, invoices).
13. Publish final privacy notice updates if you add analytics (e.g., Plausible/GA) — then the cookie banner should offer accept/decline.
14. Set up periodic employer verification policy + a process for acting on job reports quickly; decide the refund-approval workflow.

**Operations**
15. Uptime monitoring against `/api/health` (UptimeRobot/Better Stack, 5-minute interval).
16. Error tracking (Sentry or Vercel Analytics/Logs) and log drain — especially webhook 5xxs.
17. Backups for Postgres (daily PITR or snapshots); test one restore.
18. Move `uploads/` strategy fully to S3/R2 (already the production default) — do not serve files from the app server.
19. Post-launch: switch Razorpay to live mode, smoke-test sign-up → post job → apply → interview → pay → report, and watch the first week's logs.
20. Optional hardening later: Redis-backed rate limiting for multi-instance deploys, `prisma migrate dev` discipline for future schema changes, CSP nonces for stricter script policy.

## Hinglish summary (Hindi)

Ek line mein: **code launch-ready hai, ab tumhare accounts aur domain baaki hain.**

- Sabka kya hua: UI/UX polish, asli Razorpay payments + webhook + no double charge, email verification
  (aur ek bada bug fix — verification link hi kaam nahi karta tha, ab fix hai), security headers + CSRF +
  rate limiting + production seed saaf, Postgres migration ready, files S3/R2 mein (dev mein local disk),
  legal pages + SEO + OG + sitemap + JSON-LD + "Report this job" button, aur 42+23 automated e2e checks sab pass.
- Par production ke liye tumse cheezen chahiye: domain, Postgres database, Razorpay **live** keys + webhook,
  Resend (email) domain verify, Google OAuth redirect URI (real domain), S3 bucket/R2, strong JWT_SECRET,
  aur `ADMIN_EMAIL`/`ADMIN_PASSWORD` se pehla admin banana (`db:seed:prod`).
- Lawyer se `/terms`, `/privacy`, `/refund-cancellation` review karwao; Grievance Officer appoint karo.
- Ek ₹1 ka real payment test chalao, phir relaunch. Health check `/api/health` se monitoring lagao.
- Warning: **build aur `next dev` ek saath mat chalao** (shared `.next`) — page 500 pehle wahi wajah se aata tha.

## Key routes

- `/` landing · `/jobs` board · `/jobs/[slug]` detail + report · `/premium` Pro · `/about` · `/contact` · `/terms` · `/privacy` · `/refund-cancellation`
- `/dashboard/seeker` · `/dashboard/employer` · `/dashboard/admin` (includes job-reports queue)
- `/api/health` health check · `/api/webhooks/razorpay` Razorpay webhook
- `/sitemap.xml` · `/robots.txt` · `app/icon.svg` favicon

## Known limits & future work

- Rate limiting is in-memory (single instance). Move to Redis for multi-instance.
- CSP allows `'unsafe-inline'` scripts (Next inline bootstrap). Nonce-based CSP is a future hardening step.
- Interview recordings in dev are stored on local disk — production must use S3/R2 (already the default behavior).
- Legacy local upload path `uploads/<file>` is still read as a fallback for old dev files; new uploads go to `uploads/recordings/` locally or S3 in production.
- Postgres migrations are pre-generated but not yet applied (needs a live database) — see step 10 in the to-do list.
- Accessibility is "basic" (labels, contrast, focus, alt text) — a full audit (kbd-only flows, screen-reader pass
  with axe) is recommended before scale.

## Interview types

1. **Scored assessment** — auto-generated MCQ set, timed, scored automatically
2. **Video interview** — Jitsi meeting link plus an optional 60-second recorded intro
3. **Application only** — employer reviews and schedules later

## Notes for production (quick reference)

- Replace `JWT_SECRET` with a long random value; never commit it.
- Postgres + managed backups instead of SQLite.
- Resume uploads and interview recordings in private S3/R2 with signed URLs (already wired).
- Keep the one-time resume price in `RESUME_PRICE` (`src/lib/resumes.ts`) so billing and UI never drift.
- Rate limiting is in-memory; swap in Redis for multi-instance.
- Review employer verification and privacy/refund policies before launch.
