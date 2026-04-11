# MaosFalam

## What This Is

Webapp de quiromancia com IA. Mobile-first. Foto da palma entra, leitura personalizada sai. Backend implementado (Neon + Prisma, Clerk auth, GPT-4o, API routes). MediaPipe real com Hand Landmarker. ReadingContext unificado com CreditGate. Pagamento (AbacatePay) e email (Resend) ficam pra milestone futura.

## Core Value

A foto da palma entra, a leitura personalizada sai. O backend conecta GPT-4o ao motor de leitura (`selectBlocks`) e persiste os resultados no Neon.

## Current Milestone: v1.2 Fluxo de Mao Dominante

**Goal:** Completar o fluxo de mao dominante end-to-end: instrucoes visuais na camera, upload pipeline com validacao client-side, edge cases, e prompt GPT-4o com contexto de dominancia.

**Target features:**

- Camera UI: HandInstructionOverlay, HandExpectedBadge, WrongHandFeedback, outline SVG espelhado
- Upload pipeline completo: instrucao → file picker → validacao → confirmacao
- Edge cases: HEIC conversion, EXIF rotation, compressao, orientacao, retry logic
- GPT-4o prompt: contexto de mao dominante + ignorar tatuagens/acessorios
- "Pra outra pessoa" refinements: camera adapta nome+mao da outra pessoa
- A11y basica: aria-labels, aria-live nos feedbacks

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
- MediaPipe real ja funciona: detecta mao, valida landmarks, auto-captura
- Destra/Canhota ja coletado em /ler/nome (ReadingContext.dominant_hand)
- Handedness validation ja existe em mediapipe.ts (detectHandedness)
- Falta: instrucoes visuais, upload pipeline, edge cases, prompt GPT-4o
- Prompt completo em docs/maodominante.md

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

_Last updated: 2026-04-11 after milestone v1.2 start_
