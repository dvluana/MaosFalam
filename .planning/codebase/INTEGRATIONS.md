# External Integrations

**Analysis Date:** 2025-04-10

## APIs & External Services

**Vision Analysis:**

- OpenAI GPT-4o - Hand palmistry analysis from photo
  - SDK/Client: Fetch API (no SDK, custom wrapper in `src/server/lib/openai.ts`)
  - Auth: `OPENAI_API_KEY` (server-only env var)
  - Usage: `/api/reading/capture` sends base64-encoded photo, receives JSON with hand attributes (element, lines, mounts, rare signs, confidence)
  - Model: gpt-4o with vision capability
  - Input: base64 JPEG image, 1500 token max output, JSON mode enabled
  - Cost: ~R$0.13 per analysis

**Payment Processing:**

- AbacatePay - PIX + card payments
  - SDK/Client: Custom fetch wrapper in `src/server/lib/abacatepay.ts`
  - Auth: `ABACATEPAY_API_KEY` (server-only)
  - Webhook Secret: `ABACATEPAY_WEBHOOK_SECRET` (server-only)
  - Endpoints used:
    - POST `/v1/customers` - Create customer
    - POST `/v1/billing/create` - Create billing/charge
    - Webhook `billing.paid` - Payment confirmation
  - Methods: PIX (primary), Card (secondary)
  - Webhook validation: HMAC SHA256 signature on request body
  - Location: `/src/server/lib/abacatepay.ts`

## Data Storage

**Databases:**

- Neon PostgreSQL (serverless)
  - Connection: `DATABASE_URL` env var
  - Client: Prisma ORM 7.7.0 with `@prisma/adapter-neon`
  - Connection pooling: Built-in via Neon adapter
  - Schema: `src/generated/prisma/` (auto-generated types) and `prisma/schema.prisma` (source of truth)
  - Tables: `leads`, `user_profiles`, `readings`, `payments`, `credit_packs`
  - Migrations: Managed via Prisma CLI (if migrations folder exists)

**File Storage:**

- None - Photos are processed in-memory and discarded
  - Photos sent to OpenAI as base64 data URIs
  - Never persisted to disk or cloud storage

**Caching:**

- None - Application is read-heavy with no caching layer implemented

## Authentication & Identity

**Auth Provider:**

- Clerk (auth provider)
  - Implementation: OAuth2 + email/password
  - SDK: `@clerk/nextjs` 7.0.12
  - Public key: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (client-safe)
  - Secret key: `CLERK_SECRET_KEY` (server-only)
  - Methods: Google OAuth, email/password, magic links
  - Location: `src/server/lib/auth.ts` (getClerkUser, getClerkUserId helpers)
  - Middleware: `src/middleware.ts` uses clerkMiddleware for route protection
  - Session management: Clerk handles session tokens, cookies, and validation

## Monitoring & Observability

**Error Tracking:**

- None implemented - No Sentry, Rollbar, or similar

**Logs:**

- Structured logging with Pino
  - Framework: pino 10.3.1
  - Location: `src/server/lib/logger.ts`
  - Development: pino-pretty for colored console output
  - Production: JSON-formatted logs
  - Log level: Configurable via `LOG_LEVEL` env var (default: info)
  - **Security:** Logger configured to NEVER log names, emails, CPF, or personal data - only IDs and actions
  - Usage: Every API route and server function uses `logger.info()`, `logger.error()`, `logger.warn()`

## CI/CD & Deployment

**Hosting:**

- Vercel (Next.js deployment platform)
  - Config: `.vercel/` directory present

**CI Pipeline:**

- GitHub Actions (configured via `.github/` folder)
  - Runs: ESLint, type-check, tests, build
  - Hook integration: Husky + lint-staged for pre-commit checks

## Environment Configuration

**Required env vars (production):**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret
- `OPENAI_API_KEY` - GPT-4o access
- `ABACATEPAY_API_KEY` - Payment API
- `ABACATEPAY_WEBHOOK_SECRET` - Webhook validation
- `RESEND_API_KEY` - Email sending
- `DATABASE_URL` - Neon PostgreSQL
- `NEXT_PUBLIC_BASE_URL` - App base URL (e.g., https://maosfalam.com.br)
- `LOG_LEVEL` - Logging verbosity (optional, default: info)

**Secrets location:**

- Local development: `.env.local` (Git-ignored)
- Production (Vercel): Environment variables in Vercel Dashboard under project settings
- `.env.example` contains template with required keys

## Webhooks & Callbacks

**Incoming:**

- AbacatePay webhook endpoint: `/api/webhook/abacatepay`
  - Trigger: Payment confirmed (`billing.paid` event)
  - Location: `src/app/api/webhook/abacatepay/route.ts`
  - Validation: HMAC SHA256 signature check via `validateWebhookSignature()`
  - Actions: Update payment status → create credit pack → send email confirmation
  - Response: 200 OK if valid, 401 if signature fails
  - Idempotency: Handler checks if payment already processed before applying credits

**Outgoing:**

- Clerk webhooks (receive user lifecycle events if configured)
- None explicitly sent by application to external services

## Transactional Email

**Email Service:**

- Resend (transactional email via SDK/API)
  - SDK/Client: `resend` package 6.10.0
  - Auth: `RESEND_API_KEY` (server-only)
  - Endpoint: HTTPS POST to Resend API
  - Location: `src/server/lib/resend.ts`
  - From: `MaosFalam <noreply@maosfalam.com.br>`
  - Functions:
    - `sendPaymentConfirmed()` - Sent after AbacatePay webhook
    - `sendWelcome()` - Sent on user account creation
    - `sendLeadReading()` - Sent after initial free reading
  - Security: Email addresses hashed in logs (first 3 chars + \*\*\* + domain)
  - Error handling: Email failures never block main flow

## API Routes Summary

All routes in `src/app/api/`:

| Method | Route                 | Auth      | Purpose                                     |
| ------ | --------------------- | --------- | ------------------------------------------- |
| POST   | `/lead/register`      | None      | Create lead record (name, email, gender)    |
| POST   | `/reading/capture`    | None      | Upload photo, get hand analysis from GPT-4o |
| GET    | `/reading/[id]`       | None      | Fetch reading report                        |
| POST   | `/reading/new`        | Clerk     | Create new reading for logged-in user       |
| POST   | `/credits/purchase`   | Clerk     | Initiate AbacatePay charge                  |
| GET    | `/user/credits`       | Clerk     | Get credit balance                          |
| GET    | `/user/readings`      | Clerk     | List user's saved readings                  |
| GET    | `/user/profile`       | Clerk     | Get user profile data                       |
| PUT    | `/user/profile`       | Clerk     | Update user profile                         |
| DELETE | `/user/account`       | Clerk     | Delete user and readings                    |
| POST   | `/webhook/abacatepay` | Signature | Handle payment webhook                      |

## Rate Limiting

**Implemented Limits:**

- `/api/reading/capture` - 5 requests/hour per IP (expensive OpenAI call)
- `/api/lead/register` - 10 requests/hour per IP (spam prevention)
- `/api/credits/purchase` - 5 requests/hour per user (prevent duplicate charges)
- `/api/webhook/abacatepay` - No limit (AbacatePay server origin)

Location: `src/server/lib/rate-limit.ts`

## Input Validation

**Framework:** Zod 4.3.6

- Every API route validates input via Zod schema before processing
- Prevents invalid data from reaching business logic
- Returns 400 Bad Request if validation fails
- Examples:
  - Lead registration: name (2-100 chars), email (valid format), gender (enum)
  - Reading capture: photo base64, session ID validation
  - Payment: credit pack type, amount validation

## Security Headers

Configured in `next.config.ts`:

- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-Frame-Options: DENY` - Block clickjacking
- `X-XSS-Protection: 1; mode=block` - Browser XSS filter
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer control
- `Permissions-Policy: camera=(self), microphone=()` - Only allow camera access
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` - HSTS enforcement (1 year)

---

_Integration audit: 2025-04-10_
