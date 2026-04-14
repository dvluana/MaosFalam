# MaosFalam

## What This Is

Webapp de quiromancia com IA. Mobile-first. Foto da palma entra, leitura personalizada sai. Backend implementado (Neon + Prisma, Clerk auth, GPT-4o, API routes). MediaPipe real com Hand Landmarker. ReadingContext unificado com CreditGate. Pagamento (AbacatePay) e email (Resend) ficam pra milestone futura.

## Core Value

A foto da palma entra, a leitura personalizada sai. O backend conecta GPT-4o ao motor de leitura (`selectBlocks`) e persiste os resultados no Neon.

## Current Milestone: v1.3 Sistema de Creditos Robusto

**Goal:** Refactor do sistema de creditos com seguranca, correcao de bugs criticos, e maturidade de logging. Nao e feature nova — e correcao e hardening.

**Target features:**

- Transacao atomica: debito de credito + criacao de reading na mesma transacao Prisma (eliminar credit_used client-side)
- Fix /api/user/credits 404 que bloqueia fluxo logado
- Fix nome errado em leitura pra outra pessoa (sessionStorage legacy keys)
- Fix revelacao sempre redirecionando pra view free
- Fix login Google (CAPTCHA loop no SSO callback)
- CHECK constraint remaining >= 0 no banco (migration)
- Audit Pino: LOG_LEVEL por env, zero dados sensiveis, pino-pretty so em dev
- Remover auto-seed de creditos e /api/dev/seed-credits
- Eliminar /api/reading/new (debito move pra capture)
- Rollback de gambiarras acumuladas nessa sessao

## Requirements

### Validated

- ✓ Motor de leitura (`selectBlocks`) — v1.0
- ✓ Blocos de texto (~515 textos) — v1.0
- ✓ Schema do banco (Prisma + Neon) — v1.0
- ✓ Auth (Clerk) — v1.0
- ✓ GPT-4o integration — v1.0
- ✓ API routes (9 total) — v1.0
- ✓ Client adapters — v1.0
- ✓ Auditoria codebase limpa — v1.1
- ✓ ReadingContext unificado + CreditGate — v1.1
- ✓ MediaPipe real (Hand Landmarker, auto-captura 1.5s, handedness) — v1.1
- ✓ Clerk cleanup (esqueci/redefinir-senha, UserProfile) — v1.1
- ✓ Docs alinhados (architecture.md, CLAUDE.md) — v1.1
- ✓ Error handling (toast, 404 vs 500) — v1.1

### Active

(Populated by v1.2 requirements definition)

### Out of Scope

- Pagamento (AbacatePay) — webhook v2 nao documentado
- Email transacional (Resend) — depende de dominio configurado
- App nativo — web-first
- Assinatura mensal — modelo e creditos avulsos
- Compatibilidade entre maos — v2
- Leitura da mao nao-dominante — MVP le apenas dominante

## Context

- v1.0 Backend MVP completo (7 fases)
- v1.1 Alinhamento Arquitetural completo (5 fases)
- v1.2 Fluxo de Mao Dominante completo (5 fases)
- Sistema de creditos existe mas com vulnerabilidades criticas
- Codigo de creditos adicionado incrementalmente por subagents sem TDD nem visao do todo
- Login/registro custom (Clerk hooks) substituiu componentes prontos do Clerk
- Linking de leituras anonimas a contas implementado mas com bugs

## Constraints

- **Tech stack**: Next.js 16, TypeScript strict, sem `any`, `no-console: error`
- **Seguranca**: foto nunca armazenada, CPF nunca logado, dados pessoais nunca nos logs
- **Performance**: `selectBlocks` <1ms (zero I/O, tudo em memoria)
- **Auth**: Clerk e source of truth pra name/email/foto. Neon so tem CPF e customer_id
- **Brand voice**: todo texto pro usuario segue `docs/brand-voice.md` (voz da cigana)
- **MediaPipe**: handedness assume input espelhado (front camera labels corretos, back camera swap)

## Key Decisions

| Decision                         | Rationale                                  | Outcome   |
| -------------------------------- | ------------------------------------------ | --------- |
| Neon + Prisma 7 com adapter      | Serverless, free tier generoso             | ✓ Good    |
| Clerk pra auth                   | 50K users free, Google OAuth + email/senha | ✓ Good    |
| GPT-4o pra visao                 | Melhor modelo multimodal                   | ✓ Good    |
| Pagamento adiado                 | Webhook AbacatePay v2 nao documentado      | — Pending |
| Fluxo unico com is_self flag     | Nao existe rota separada                   | ✓ Good    |
| Creditos nao expiram             | Simplifica logica                          | ✓ Good    |
| Share via reading UUID           | URL usa reading ID direto                  | ✓ Good    |
| MediaPipe Hand Landmarker        | Deteccao client-side, zero server          | ✓ Good    |
| Camera traseira como default     | Mais resolucao, sem espelhamento           | — Pending |
| Mao errada = aviso, nao bloqueio | Edge case: amputacao, deficiencia          | — Pending |

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

_Last updated: 2026-04-13 after milestone v1.3 start_
