---
quick_task: 260411-p9a
title: Linking leituras anonimas a contas
completed: 2026-04-11
tags: [auth, readings, anonymous, linking, lead]
key-files:
  created:
    - src/app/api/user/claim-readings/route.ts
  modified:
    - src/app/api/lead/register/route.ts
    - src/hooks/useAuth.ts
    - src/app/ler/nome/page.tsx
    - src/lib/reading-client.ts
    - src/app/api/user/readings/route.ts
decisions:
  - claim-readings uses email match (not sessionId) as primary key for idempotent linking
  - useAuth fires claim on every login until localStorage flag is set; clears on logout
  - registerLead awaited (not fire-and-forget) only to check existing_account; failure still non-blocking for navigation
  - repeat gate checks sessionStorage maosfalam_reading_id set by /ler/scan after successful reading
  - user/readings safety-net fetch via leadId uses getClerkUser (email) not getClerkUserId
---

# Quick Task 260411-p9a: Linking leituras anonimas a contas

**One-liner:** Anonymous readings linked to Clerk accounts via email match, with repeat reading gate and existing-account feedback on /ler/nome.

## Tasks Completed

| Task | Description                                                        | Commit  |
| ---- | ------------------------------------------------------------------ | ------- |
| 1    | POST /api/user/claim-readings — idempotent link by email           | c0725a9 |
| 2    | lead/register — check existing Clerk account before creating lead  | 16eb22d |
| 3    | useAuth — call claim-readings on first authenticated login         | 68d001f |
| 4    | /ler/nome — repeat gate + existing email inline feedback           | d79651d |
| 5    | user/readings — safety-net fetch via leadId for unclaimed readings | ab8cd4a |

## What Was Built

### POST /api/user/claim-readings

- Finds all leads where `email = clerkUser.email AND clerkUserId IS NULL`
- Updates matching leads: `clerkUserId = user.id, converted = true`
- Updates readings: `clerkUserId = user.id` for all readings attached to those leads
- Returns `{ claimed_count: N }`
- Idempotent by design (WHERE clerkUserId IS NULL prevents double-claiming)

### lead/register existing account check

- Before creating a lead: calls `clerkClient().users.getUserList({ emailAddress })`
- If email found in Clerk: returns `{ existing_account: true, lead_id: null }` (status 200, not error)
- No lead created for existing Clerk accounts

### useAuth claim on login

- useEffect fires when `isLoaded && isSignedIn` transitions to true
- Checks `localStorage.getItem("maosfalam_readings_claimed")` — skips if already done
- POSTs to `/api/user/claim-readings` fire-and-forget (failure non-blocking)
- On success: sets localStorage flag so subsequent renders skip the call
- Clears flag on logout so next login re-checks

### /ler/nome repeat gate and email feedback

- On mount: checks `sessionStorage.getItem("maosfalam_reading_id")` — if set, shows repeat gate
- Repeat gate: full-screen message "Sua leitura ja esta feita" with buttons to /registro and /login
- registerLead is now awaited (was fire-and-forget) to detect `existing_account` response
- If `existing_account: true`: inline message below email field with link to /login
- Failure of registerLead is still non-blocking: catch block allows navigation to proceed
- registerLead return type updated to `{ lead_id: string | null; existing_account?: boolean }`

### user/readings safety-net

- Changed from `getClerkUserId()` to `getClerkUser()` to get email
- After fetching by clerkUserId, also finds leads by email and unclaimed readings via leadId
- Merges both sets, deduplicates by id, sorts by createdAt desc
- Catches any readings that slipped through claim-readings (e.g., claim called before reading was saved)

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check

### Files exist

- src/app/api/user/claim-readings/route.ts — created
- src/app/api/lead/register/route.ts — modified
- src/hooks/useAuth.ts — modified
- src/app/ler/nome/page.tsx — modified
- src/lib/reading-client.ts — modified
- src/app/api/user/readings/route.ts — modified

### Commits exist

- c0725a9 — Task 1
- 16eb22d — Task 2
- 68d001f — Task 3
- d79651d — Task 4
- ab8cd4a — Task 5

### Build

`npm run build` passes with no errors.

## Self-Check: PASSED
