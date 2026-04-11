# MaosFalam Backend

## What This Is

Backend do MaosFalam, webapp de quiromancia com IA. O frontend existe com mocks. Esta milestone implementa a infraestrutura de backend: banco de dados (Neon + Prisma), autenticacao (Clerk), API routes, integracao GPT-4o pra analise de palma, e seguranca. Pagamento (AbacatePay) e email (Resend) ficam pra milestone futura.

## Core Value

A foto da palma entra, a leitura personalizada sai. O backend precisa conectar GPT-4o ao motor de leitura (`selectBlocks`) e persistir os resultados no Neon.

## Requirements

### Validated

- ✓ Motor de leitura (`selectBlocks`) — existente em `src/server/lib/select-blocks.ts`
- ✓ Blocos de texto (~515 textos) — existente em `src/data/blocks/`
- ✓ Tipos v2 (HandAttributes, ReportJSON) — existente em `src/types/`
- ✓ Frontend completo com mocks — existente em `src/app/`, `src/components/`
- ✓ Design system — existente, documentado em `docs/DS.md`
- ✓ Camera pipeline (MediaPipe) — existente em `src/hooks/useCameraPipeline.ts`

### Active

- [ ] Schema do banco (Prisma + Neon) — 5 tabelas: leads, user_profiles, readings, credit_packs, payments
- [ ] Auth (Clerk) — middleware, Google OAuth + email/senha, helpers server-side
- [ ] API route: POST /api/lead/register — captura lead antes da leitura
- [ ] API route: POST /api/reading/capture — foto > GPT-4o > selectBlocks > salva reading
- [ ] API route: GET /api/reading/[id] — retorna leitura por ID
- [ ] API route: POST /api/reading/new — debita credito FIFO pra nova leitura (auth required)
- [ ] API route: GET /api/user/credits — saldo de creditos (auth required)
- [ ] API route: GET /api/user/readings — historico de leituras (auth required)
- [ ] API route: GET/PUT /api/user/profile — perfil do usuario (auth required)
- [ ] API route: DELETE /api/user/account — soft delete (auth required)
- [ ] Integracao GPT-4o — wrapper que envia foto base64 e recebe HandAttributes
- [ ] Logger (Pino) — sem dados pessoais nos logs
- [ ] Rate limiting — /api/reading/capture: 5/h por IP, /api/lead/register: 10/h por IP
- [ ] Security headers — X-Frame-Options, HSTS, CSP, Permissions-Policy
- [ ] Adapters front > backend — `src/lib/reading-client.ts`, `src/lib/payment-client.ts`

### Out of Scope

- Pagamento (AbacatePay) — webhook nao documentado na v2, resolver depois
- Email transacional (Resend) — depende de dominio configurado
- Webhook route (/api/webhook/abacatepay) — depende de pagamento
- API route: POST /api/credits/purchase — depende de pagamento
- App nativo — web-first
- Assinatura mensal — modelo e creditos avulsos
- Compatibilidade entre maos — v2

## Context

- Frontend 100% pronto com mocks. Transicao mock > backend via adapters em `src/lib/`
- Motor de leitura v2 sendo finalizado em paralelo (blocos e tipos prontos, front sendo adaptado)
- Stack definida: Next.js 16 App Router, TypeScript strict, Tailwind v4, Framer Motion
- Neon (Postgres serverless) como banco, Prisma como ORM com driver adapter `@prisma/adapter-neon`
- Clerk como auth (50K users free tier)
- AbacatePay v2 API: base URL `https://api.abacatepay.com/v2`, Bearer token auth, checkout via `/checkouts/create`
- Docs de referencia: `docs/architecture.md` (schema, API routes, seguranca), `docs/palmistry.md` (quiromancia + JSON schema)

## Constraints

- **Tech stack**: Next.js 16, TypeScript strict, sem `any`, `no-console: error`
- **Seguranca**: foto nunca armazenada, CPF nunca logado, dados pessoais nunca nos logs
- **Performance**: `selectBlocks` <1ms (zero I/O, tudo em memoria)
- **Auth**: Clerk e source of truth pra name/email/foto. Neon so tem CPF e customer_id
- **Brand voice**: todo texto pro usuario segue `docs/brand-voice.md` (voz da cigana)

## Key Decisions

| Decision                     | Rationale                                             | Outcome   |
| ---------------------------- | ----------------------------------------------------- | --------- |
| Neon + Prisma v6 com adapter | Serverless, free tier generoso, driver adapter nativo | — Pending |
| Clerk pra auth               | 50K users free, Google OAuth + email/senha built-in   | — Pending |
| GPT-4o pra visao             | Melhor modelo multimodal pra analise de linhas finas  | — Pending |
| Pagamento adiado             | Webhook AbacatePay v2 nao documentado                 | — Pending |
| Rate limit in-memory (Map)   | Suficiente pro MVP, migrar pra Upstash quando escalar | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-04-10 after initialization_
