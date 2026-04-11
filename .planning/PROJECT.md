# MaosFalam

## What This Is

Webapp de quiromancia com IA. Mobile-first. Foto da palma entra, leitura personalizada sai. Frontend completo, backend v1.0 implementado (Neon + Prisma, Clerk auth, GPT-4o, API routes, client adapters). Pagamento (AbacatePay) e email (Resend) ficam pra milestone futura.

## Core Value

A foto da palma entra, a leitura personalizada sai. O backend conecta GPT-4o ao motor de leitura (`selectBlocks`) e persiste os resultados no Neon.

## Current Milestone: v1.1 Alinhamento Arquitetural

**Goal:** Auditar e alinhar o codigo com as decisoes de arquitetura tomadas, refatorar fluxos core, e implementar MediaPipe real antes de features novas.

**Target features:**

- Auditoria + limpeza (share_token, expires_at, NextAuth, R2, nomenclatura)
- ReadingContext unificado + gate de creditos no /ler/nome
- MediaPipe real (hand landmarker, auto-captura, handedness)
- Clerk cleanup (esqueci-senha, redefinir, perfil via Clerk)
- Docs sync + error handling (architecture.md, CLAUDE.md alinhados)

## Requirements

### Validated

- ✓ Motor de leitura (`selectBlocks`) — `src/server/lib/select-blocks.ts` (v1.0)
- ✓ Blocos de texto (~515 textos) — `src/data/blocks/` (v1.0)
- ✓ Tipos v2 (HandAttributes, ReportJSON) — `src/types/` (v1.0)
- ✓ Frontend completo com mocks — `src/app/`, `src/components/` (v1.0)
- ✓ Design system — `docs/DS.md` (v1.0)
- ✓ Camera pipeline (mock MediaPipe) — `src/hooks/useCameraPipeline.ts` (v1.0)
- ✓ Schema do banco (Prisma + Neon) — 5 tabelas (v1.0 Phase 1)
- ✓ Auth (Clerk) — proxy.ts, Google OAuth + email/senha (v1.0 Phase 2)
- ✓ Integracao GPT-4o — wrapper + Zod validation (v1.0 Phase 3)
- ✓ API routes publicas — lead/register, reading/capture, reading/[id] (v1.0 Phase 4)
- ✓ API routes protegidas — reading/new, user/credits, user/readings, user/profile, user/account (v1.0 Phase 5)
- ✓ Client adapters — reading-client.ts, mock-to-API transition (v1.0 Phase 6)
- ✓ Frontend-backend wiring — funnel conectado (v1.0 Phase 7)
- ✓ Logger (Pino) — sem dados pessoais (v1.0 Phase 1)
- ✓ Rate limiting — in-memory Map (v1.0 Phase 4)
- ✓ Security headers (v1.0 Phase 4)

### Active

- [ ] Auditoria: remover share_token de types, mocks, componentes, reading-client
- [ ] Auditoria: remover expires_at de credit_packs
- [ ] Auditoria: limpar referencias NextAuth, R2/Cloudflare, "Claude Vision"
- [ ] Auditoria: "Planeta dominante" → "Monte dominante"
- [ ] Auditoria: verificar e corrigir ordem das secoes (v2)
- [ ] Auditoria: remover VALID_MOCK_IDS, fallbackName="Marina", dead stubs
- [ ] ReadingContext unificado (target_name, target_gender, dominant_hand, is_self, session_id)
- [ ] /ler/nome refatorado: visitante (nome+email+genero+dominancia+opt-in) vs logada (pra mim/pra outra)
- [ ] CreditGate component (modal de confirmacao de credito)
- [ ] Debito real no server via POST /api/reading/new antes do capture
- [ ] MediaPipe real: @mediapipe/tasks-vision, useCameraPipeline com Hand Landmarker
- [ ] MediaPipe: validacao landmarks (mao aberta, centralizada, estavel 1.5s)
- [ ] MediaPipe: auto-captura do canvas como base64 JPEG
- [ ] Handedness: perguntar destra/canhota + instrucao na camera + validar mao correta
- [ ] Clerk cleanup: esqueci-senha, redefinir-senha, perfil edit via Clerk
- [ ] Docs: architecture.md alinhado com codigo real
- [ ] Docs: CLAUDE.md atualizado
- [ ] Error handling: /conta/leituras toast de erro, resultado diferenciar 404 de 500

### Out of Scope

- Pagamento (AbacatePay) — webhook nao documentado na v2, resolver depois
- Email transacional (Resend) — depende de dominio configurado
- App nativo — web-first
- Assinatura mensal — modelo e creditos avulsos
- Compatibilidade entre maos — v2
- Blocos de texto novos — conteudo atual suficiente
- Mao dominante no prompt GPT-4o — fase futura apos MediaPipe funcionar

## Context

- Backend v1.0 completo (7 fases, 17 plans executados)
- 10 decisoes arquiteturais tomadas que mudaram tipos, fluxos e nomenclatura
- Codigo pode estar desalinhado com essas decisoes
- Fluxo unico de leitura com is_self flag (nao rota separada)
- Creditos nao expiram, share_token removido, fotos nunca armazenadas
- MediaPipe atual e mock/stub — precisa implementacao real

## Constraints

- **Tech stack**: Next.js 16, TypeScript strict, sem `any`, `no-console: error`
- **Seguranca**: foto nunca armazenada, CPF nunca logado, dados pessoais nunca nos logs
- **Performance**: `selectBlocks` <1ms (zero I/O, tudo em memoria)
- **Auth**: Clerk e source of truth pra name/email/foto. Neon so tem CPF e customer_id
- **Brand voice**: todo texto pro usuario segue `docs/brand-voice.md` (voz da cigana)

## Key Decisions

| Decision                     | Rationale                                             | Outcome   |
| ---------------------------- | ----------------------------------------------------- | --------- |
| Neon + Prisma 7 com adapter  | Serverless, free tier generoso, driver adapter nativo | ✓ Good    |
| Clerk pra auth               | 50K users free, Google OAuth + email/senha built-in   | ✓ Good    |
| GPT-4o pra visao             | Melhor modelo multimodal pra analise de linhas finas  | ✓ Good    |
| Pagamento adiado             | Webhook AbacatePay v2 nao documentado                 | — Pending |
| Rate limit in-memory (Map)   | Suficiente pro MVP, migrar pra Upstash quando escalar | ✓ Good    |
| Fluxo unico com is_self flag | Nao existe rota separada pra "ler outra pessoa"       | — Pending |
| Creditos nao expiram         | Simplifica logica, sem check de expiracao             | — Pending |
| Share via reading UUID       | Remover share_token, URL usa reading ID direto        | — Pending |
| MediaPipe Hand Landmarker    | Deteccao client-side, zero server, ~30fps             | — Pending |

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

_Last updated: 2026-04-11 after milestone v1.1 start_
