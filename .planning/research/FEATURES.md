# Feature Research

**Domain:** Freemium AI-powered consumer reading app (quiromancy / palmistry)
**Researched:** 2026-04-10
**Confidence:** HIGH — architecture fully documented, frontend complete, domain well-defined

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature                       | Why Expected                                                                                            | Complexity | Notes                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| Lead capture with persistence | User entered name + email before the reading; losing it means losing retargeting and email recovery     | LOW        | POST /api/lead/register. Unauthenticated. Zod validation. Rate limit 10/h per IP.                           |
| Photo > AI analysis pipeline  | Core product value. If the photo doesn't produce a real reading, nothing else matters                   | HIGH       | POST /api/reading/capture. GPT-4o with structured JSON output. Confidence threshold 0.3. Cost ~R$0.07/call. |
| Reading persistence           | User exits, returns — reading must still be there. Without this, share links are broken                 | LOW        | Readings saved as JSONB in Neon. UUID primary key doubles as share token.                                   |
| GET /api/reading/[id]         | Every result page needs to fetch the reading. SSR or client hydration both require it                   | LOW        | Public endpoint. No auth. Returns full report JSON; frontend decides what to blur.                          |
| Tier enforcement server-side  | Free vs premium must be enforced on server, not just CSS blur. Otherwise anyone can inspect and unlock  | MEDIUM     | `tier` field on reading row. Only webhook can flip it to 'premium'. No client endpoint accepts tier change. |
| Confidence-based rejection    | Bad photos must be rejected gracefully. A low-confidence GPT response producing bad copy destroys trust | LOW        | Threshold < 0.3 → 422 with cigana error message. Partial (0.3–0.7) → conservative read, no rare signs.      |
| Auth session (Clerk)          | Account area, reading history, credit debit — all require knowing who the user is                       | MEDIUM     | Clerk middleware on /conta/\* and authenticated API routes. Google OAuth + email/senha built-in.            |
| Reading history per user      | Users who paid expect to find their readings again. No history = paid and lost = chargeback             | LOW        | GET /api/user/readings. Returns list ordered by date. Requires auth.                                        |
| User profile read/update      | Clerk owns name/email/photo. Neon owns CPF and abacatepay_customer_id. Profile must surface both        | LOW        | GET+PUT /api/user/profile. CPF never logged or returned publicly.                                           |
| Account deletion              | LGPD compliance in Brazil. Users must be able to request removal                                        | LOW        | DELETE /api/user/account. Soft delete (is_active = false).                                                  |
| Input validation everywhere   | Malformed payloads must be rejected at the door. Zod on every API route                                 | LOW        | Pattern already established in architecture. Apply uniformly.                                               |
| Security headers              | Browser security baseline. Missing headers = easy attack surface on mobile webviews                     | LOW        | X-Frame-Options, HSTS, X-Content-Type-Options, Permissions-Policy (camera=self).                            |
| PII never in logs             | LGPD. Name, email, CPF in logs = compliance risk + data breach amplifier                                | LOW        | Pino logger. Log only IDs and action codes. Never log photo data.                                           |
| Photo never stored            | LGPD + trust. Users sharing palm photos expect them to be ephemeral                                     | LOW        | Process base64 in memory, pass to GPT-4o, discard. Never write to disk or object storage.                   |
| Rate limiting on capture      | GPT-4o costs real money. No limit = one bad actor drains the OpenAI budget in minutes                   | LOW        | 5/h per IP. In-memory Map for MVP, Upstash when scaling.                                                    |

---

### Differentiators (Competitive Advantage)

Features that set MaosFalam apart from generic AI apps and palmistry competitors.

| Feature                                               | Value Proposition                                                                                                                | Complexity | Notes                                                                                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Gender-concordant reading text                        | Reading feels written specifically for you, not a generic copy. Portuguese grammatical gender markers resolved per target        | MEDIUM     | GENDER_MAP + replaceGender() in select-blocks.ts. Already implemented server-side. Markers like {{inteira}} resolve to inteira/inteiro. |
| Deterministic text variation per reading              | Same reading always shows the same text variant. Prevents the "it changed" confusion on refresh or share                         | LOW        | selectBlocks() seeded by reading.id. Already implemented.                                                                               |
| Reading for another person                            | Doubles revenue opportunity per user. Viral: "I read your hand" sharing pattern                                                  | LOW        | POST /api/reading/new with target_name + target_gender. Credit debit FIFO. Report addressed in second person to the target.             |
| Lead capture before reading (not after)               | Standard funnel captures email after value delivery. MaosFalam captures before, enabling abandoned-funnel recovery emails        | LOW        | /api/lead/register called before camera. Email stored, opt-in flag for LGPD.                                                            |
| Complete report stored in full, tier controls display | Report is generated once. Upgrading only flips a flag — no re-analysis, no delay, instant unlock                                 | LOW        | `report` JSONB contains full content. `tier` field gates frontend display. Webhook flips tier on payment confirmation.                  |
| MediaPipe pre-hint to GPT-4o                          | Client-side hand type calculation (element) sent as pre-hint improves GPT-4o accuracy and reduces token cost on ambiguous photos | LOW        | landmarks[] proportions → element pre-calculation → included in capture payload.                                                        |
| Share links as permanent acquisition channel          | UUID-based share links never expire. Every shared reading is a persistent acquisition entry point                                | LOW        | /compartilhar/[reading_id] — public, no auth, partial display. Old links that convert = free revenue.                                   |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature                              | Why Requested                                 | Why Problematic                                                                                                                                                                                   | Alternative                                                                                                                               |
| ------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Store palm photos                    | "For re-analysis", "user gallery"             | LGPD liability, storage cost, security surface, breaks user trust in a product that processes biometric-adjacent data                                                                             | Process and discard. GPT-4o attributes saved as JSONB — re-reading from attributes is free.                                               |
| Client-controlled tier upgrade       | "Simpler flow"                                | Any user can inspect the network request and flip themselves to premium without paying. Entire revenue model collapses                                                                            | Tier only changes via authenticated webhook from AbacatePay. Server owns tier state.                                                      |
| Credit expiration                    | "Urgency mechanics", "revenue predictability" | Credits are pre-paid. Expiring them after purchase is a consumer protection issue in Brazil (CDC). Creates support tickets and chargebacks                                                        | Credits don't expire per PROJECT.md decision. Urgency comes from the reading experience, not expiry threats.                              |
| Admin dashboard (MVP)                | "Visibility into business"                    | Entire separate product to build and secure. Pulls engineering time from the actual user funnel                                                                                                   | Query Neon directly via Prisma Studio or psql for MVP metrics. Build admin after PMF.                                                     |
| Real-time photo analysis (streaming) | "Better UX, faster feel"                      | GPT-4o vision does not support streaming structured JSON. Streaming partial JSON is not parseable. 10s scan ritual is already designed into the product                                           | Scan page is a ritual. The wait is intentional. Single synchronous call to GPT-4o.                                                        |
| Multi-device session sync            | "User switches phone"                         | Clerk handles auth session natively. Building additional sync logic creates race conditions and doubles auth complexity                                                                           | Clerk session cookies work cross-device automatically. Reading history via /api/user/readings is the sync.                                |
| Webhook retry queue                  | "Reliability"                                 | AbacatePay retries on its end. A retry queue on our end adds infrastructure complexity (Redis/Queue) for MVP edge cases                                                                           | Idempotent webhook handler is sufficient. billing_id deduplication catches retries. Migrate to queue if retry failures become measurable. |
| User-uploaded photos (skip camera)   | "Accessibility fallback"                      | Already exists as camera_fallback_upload state in the camera pipeline for MediaPipe failures. Making it a first-class upload flow encourages low-quality photos that produce low-confidence reads | Keep upload as MediaPipe fallback only. Surface it only when camera/MediaPipe fails.                                                      |

---

## Feature Dependencies

```
[Lead Capture — /api/lead/register]
    └──provides session_id──> [Reading Capture — /api/reading/capture]
                                  └──produces reading_id──> [GET /api/reading/[id]]
                                  └──produces reading_id──> [Share Link — /compartilhar/[id]]

[Auth — Clerk middleware]
    └──provides clerk_user_id──> [Reading History — GET /api/user/readings]
    └──provides clerk_user_id──> [User Profile — GET/PUT /api/user/profile]
    └──provides clerk_user_id──> [New Reading (auth) — POST /api/reading/new]
    └──provides clerk_user_id──> [Credit Balance — GET /api/user/credits]
    └──provides clerk_user_id──> [Account Deletion — DELETE /api/user/account]

[POST /api/reading/new (auth)]
    └──requires──> [Auth — Clerk middleware]
    └──requires──> [Credit Balance > 0]
    └──produces──> [Reading Capture — same pipeline as /capture but credit-gated]

[Rate Limiting]
    └──guards──> [Reading Capture]
    └──guards──> [Lead Capture]

[Confidence Threshold]
    └──gates──> [Block Selection — selectBlocks()]
                    └──gates──> [Reading Persistence]

[Security Headers]
    └──no dependency, applied globally via middleware]

[PII-free Logging]
    └──cross-cuts all API routes]
```

### Dependency Notes

- **Lead Capture requires nothing upstream:** It is the entry point. session_id is generated client-side.
- **Reading Capture requires Lead registration:** The session_id ties the reading to a lead for email follow-up. Reading can be created without a lead if session_id is new, but email recovery is lost.
- **Auth must exist before any /api/user/\* or /api/reading/new:** Clerk middleware runs first. Without it, clerk_user_id is undefined and FIFO debit cannot be attributed.
- **Tier enforcement has no dependency but must precede payment integration:** The flag exists from creation (default 'free'). Payment webhook flips it. Building tier enforcement before payment ensures the gate is real before money flows.
- **Credit debit (FIFO) requires credit_packs rows to exist:** Out of scope for this milestone (payment deferred). Credit debit route (/api/reading/new) can be built and tested with seeded credit rows; actual purchase flow comes later.

---

## MVP Definition

This milestone is backend infrastructure. Payment and email are explicitly out of scope (deferred). MVP here = "frontend mocks replaced by real API, reading persisted, auth working."

### Launch With (v1 — this milestone)

- [ ] Prisma schema + Neon connection — all 5 tables: leads, user_profiles, readings, credit_packs, payments
- [ ] Clerk auth middleware — Google OAuth + email/senha, server-side helpers
- [ ] POST /api/lead/register — name, email, gender, session_id, email_opt_in
- [ ] POST /api/reading/capture — photo > GPT-4o > selectBlocks > persist > return report
- [ ] GET /api/reading/[id] — fetch reading by UUID, public
- [ ] POST /api/reading/new — auth-gated, credit debit FIFO, triggers capture pipeline
- [ ] GET /api/user/credits — credit balance from credit_packs, auth required
- [ ] GET /api/user/readings — reading history, auth required
- [ ] GET/PUT /api/user/profile — profile read/update, auth required
- [ ] DELETE /api/user/account — soft delete, auth required
- [ ] GPT-4o wrapper (openai.ts) — structured JSON output, confidence field, system prompt from palmistry.md
- [ ] Pino logger — no PII, reading IDs and action codes only
- [ ] Rate limiting (in-memory Map) — 5/h per IP on capture, 10/h on lead register
- [ ] Security headers — all 6 headers from architecture.md
- [ ] Zod validation — on every API route
- [ ] Frontend adapters — reading-client.ts, user-client.ts transition from mock to real API

### Add After Validation (v1.x — next milestone)

- [ ] AbacatePay integration — POST /api/credits/purchase, POST /api/webhook/abacatepay. Unblocked once AbacatePay v2 webhook documentation is confirmed.
- [ ] Resend email — transactional emails (lead created, payment confirmed, reading for third party). Unblocked once domain is configured.
- [ ] Lead-to-account linking — when a lead creates a Clerk account, tie lead_id to clerk_user_id.

### Future Consideration (v2+)

- [ ] Upstash rate limiting — migrate from in-memory Map when multi-instance Vercel deployment makes per-process state unreliable
- [ ] Hand comparison / left vs right reading — second reading per user correlated to same hand attributes
- [ ] Compatibility between two readings — requires reading relationship table
- [ ] Monthly subscription model — requires recurring billing support in AbacatePay
- [ ] Admin dashboard — after PMF, when business metrics justify the engineering investment
- [ ] Push notifications — requires native app or PWA notification permission flow

---

## Feature Prioritization Matrix

| Feature                      | User Value             | Implementation Cost | Priority            |
| ---------------------------- | ---------------------- | ------------------- | ------------------- |
| GPT-4o analysis pipeline     | HIGH                   | HIGH                | P1                  |
| Reading persistence + GET    | HIGH                   | LOW                 | P1                  |
| Lead capture                 | HIGH                   | LOW                 | P1                  |
| Clerk auth                   | HIGH                   | MEDIUM              | P1                  |
| Rate limiting on capture     | HIGH (cost protection) | LOW                 | P1                  |
| Zod validation everywhere    | HIGH (security)        | LOW                 | P1                  |
| Security headers             | HIGH (security)        | LOW                 | P1                  |
| Photo discard (no storage)   | HIGH (trust + LGPD)    | LOW                 | P1                  |
| Tier enforcement server-side | HIGH                   | LOW                 | P1                  |
| User reading history         | MEDIUM                 | LOW                 | P1                  |
| User profile CRUD            | MEDIUM                 | LOW                 | P1                  |
| POST /api/reading/new (auth) | MEDIUM                 | LOW                 | P1                  |
| Credit balance endpoint      | MEDIUM                 | LOW                 | P1                  |
| Account deletion             | LOW (LGPD compliance)  | LOW                 | P1                  |
| Pino logger (no PII)         | MEDIUM (ops)           | LOW                 | P1                  |
| Frontend adapter transition  | HIGH                   | LOW                 | P1                  |
| AbacatePay payment           | HIGH                   | MEDIUM              | P2 (next milestone) |
| Resend email                 | MEDIUM                 | LOW                 | P2 (next milestone) |
| Lead-to-account linking      | MEDIUM                 | LOW                 | P2 (next milestone) |
| Upstash rate limit migration | LOW                    | LOW                 | P3                  |
| Admin dashboard              | LOW                    | HIGH                | P3                  |

---

## Competitor Feature Analysis

| Feature             | Astrology & Palmistry Coach (US)      | Generic AI reading apps   | Our Approach                                                        |
| ------------------- | ------------------------------------- | ------------------------- | ------------------------------------------------------------------- |
| AI analysis method  | Unknown; likely proprietary CV or LLM | Form-based, not photo     | GPT-4o vision on actual palm photo — real analysis, not form        |
| Lead capture timing | After value delivery (standard)       | After value delivery      | Before value delivery — enables abandoned-funnel recovery           |
| Report persistence  | Cloud-synced, requires account        | Session only or cloud     | UUID-based, no account required. Account optional (adds history)    |
| Gender in text      | Not applicable (English)              | Not applicable            | Gender-concordant Portuguese copy — differentiator in BR market     |
| Share mechanic      | Social sharing (generic)              | Minimal                   | Partial-reveal share card designed for stories virality             |
| Credit model        | Subscription (monthly)                | Per-query or subscription | One-time credit packs — lower commitment, impulse purchase          |
| Payment methods     | Credit card (Stripe)                  | Credit card               | PIX + cartão via AbacatePay — PIX is dominant in Brazil B/C classes |
| Photo storage       | Unknown                               | Unknown                   | Never stored — explicit trust signal, LGPD-correct                  |

---

## Sources

- `docs/architecture.md` — schema, API routes, security, GPT-4o prompt, rate limit design
- `docs/product.md` — market sizing, monetization model, credit packs, funnel stages
- `docs/palmistry.md` — confidence thresholds, JSON schema, what GPT-4o analyzes
- `.planning/PROJECT.md` — milestone scope, out-of-scope decisions, constraints
- `.planning/codebase/ARCHITECTURE.md` — existing frontend patterns, data flow, error handling

---

_Feature research for: MaosFalam backend — freemium AI palmistry reading app_
_Researched: 2026-04-10_
