---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-10
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                  |
| ---------------------- | -------------------------------------- |
| **Framework**          | vitest 4.x                             |
| **Config file**        | `vitest.config.ts`                     |
| **Quick run command**  | `npx vitest run --reporter=verbose`    |
| **Full suite command** | `npm run type-check && npx vitest run` |
| **Estimated runtime**  | ~5 seconds                             |

---

## Sampling Rate

- **After every task commit:** Run `npm run type-check`
- **After every plan wave:** Run `npx vitest run && npm run type-check`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type   | Automated Command                      | File Exists | Status     |
| ------- | ---- | ---- | ----------- | ----------- | -------------------------------------- | ----------- | ---------- |
| 1-01-01 | 01   | 1    | DB-01       | integration | `npx prisma generate`                  | ✅          | ⬜ pending |
| 1-01-02 | 01   | 1    | DB-02       | integration | `npm run type-check`                   | ✅          | ⬜ pending |
| 1-01-03 | 01   | 1    | DB-03       | config      | `grep DIRECT_URL .env.example`         | ✅          | ⬜ pending |
| 1-01-04 | 01   | 1    | DB-04       | integration | `npx prisma migrate dev --name init`   | ❌ W0       | ⬜ pending |
| 1-02-01 | 02   | 1    | INFRA-01    | unit        | `npm run type-check`                   | ✅          | ⬜ pending |
| 1-02-02 | 02   | 1    | INFRA-02    | config      | `grep -c '=' .env.example`             | ✅          | ⬜ pending |
| 1-02-03 | 02   | 1    | INFRA-03    | lint        | `npm run lint`                         | ✅          | ⬜ pending |
| 1-02-04 | 02   | 1    | SEC-07      | unit        | `grep redact src/server/lib/logger.ts` | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] Neon database project created via MCP
- [ ] `DATABASE_URL` and `DIRECT_URL` populated in `.env`
- [ ] `npx prisma generate` succeeds with current schema

_Existing vitest infrastructure covers test requirements._

---

## Manual-Only Verifications

| Behavior                               | Requirement | Why Manual          | Test Instructions                                                                            |
| -------------------------------------- | ----------- | ------------------- | -------------------------------------------------------------------------------------------- |
| Prisma Studio shows 5 tables           | DB-01       | Requires running DB | `npx prisma studio` and verify leads, user_profiles, readings, credit_packs, payments tables |
| Hot-reload doesn't exhaust connections | DB-02       | Requires dev server | Start `npm run dev`, save a file 10 times, check no connection errors                        |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
