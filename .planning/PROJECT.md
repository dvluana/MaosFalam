# MaosFalam

## What This Is

Webapp de quiromancia com IA. Mobile-first. Foto da palma entra, leitura personalizada sai. Backend completo (Neon + Prisma 7, Clerk v7, GPT-4o, 9 API routes, motor de leitura com ~168 blocos). MediaPipe Hand Landmarker pra deteccao client-side. Sistema de creditos robusto com transacao atomica e debit FIFO race-safe. Staging ativo em staging.maosfalam.com. Falta: pagamento real (AbacatePay) e email transacional (Resend).

## Core Value

A foto da palma entra, a leitura personalizada sai. Monetizacao: primeira leitura (Coracao) gratis, leitura completa requer credito comprado via AbacatePay.

## Current Milestone: v1.4 Classificação de Elemento

**Goal:** Classificação de elemento correta e consistente. GPT-4o classifica com prompt multi-indicador (Types A/B/C/D × 6-7 indicadores visuais). MediaPipe valida posição/ângulo/estabilidade (sem classificar elemento). Suporte a mãos mistas (primary + secondary element).

**Target features:**

- GPT-4o multi-indicator: prompt semântico com 4 tipos × 6-7 indicadores, primary_type + secondary_type, type_reasoning, deriveElement server-side
- MediaPipe validation only: estabilidade de movimento (buffer 5 frames, jitter 2.5%), ângulo < 25°, remover computeElementHint
- Imagem quality: JPEG 0.92, max 2048px, detail:high, body limit 4MB
- Mãos mistas tipos: HandAttributes.secondary_element, ReportJSON.element.secondary_key + bridge
- Mãos mistas blocos: ELEMENT_BRIDGE (12 strings), ELEMENT_EXCLUSIVITY_MIXED (12 strings)
- Mãos mistas frontend: ElementHero/ElementSection com secondary, HandSummary com exclusivity mista
- Backward compatible: leituras antigas sem secondary renderizam normal

## Requirements

### Validated

- ✓ Motor de leitura (`selectBlocks`) — v1.0
- ✓ Blocos de texto (~461 textos, ~168 blocos) — v1.0
- ✓ Schema do banco (Prisma + Neon, 5 tabelas) — v1.0
- ✓ Auth (Clerk v7, Google OAuth + email/senha) — v1.0
- ✓ GPT-4o integration — v1.0
- ✓ API routes (9 total) — v1.0
- ✓ Client adapters — v1.0
- ✓ ReadingContext unificado — v1.1
- ✓ MediaPipe real (Hand Landmarker, auto-captura, handedness) — v1.1
- ✓ Camera UI (mao dominante, upload, edge cases) — v1.2
- ✓ Pipeline refatorado (photo-store, element hint, race condition fix) — v1.2
- ✓ Transacao atomica (debit + reading na mesma transaction) — v1.3
- ✓ CHECK constraint remaining >= 0 — v1.3
- ✓ Raw SQL debit race-safe — v1.3
- ✓ Logging hardened (Pino, zero PII) — v1.3
- ✓ Dead code cleanup — v1.3

### Active

(Populated by v2 requirements below)

### Out of Scope

- App nativo — web-first
- Assinatura mensal — modelo e creditos avulsos
- Compatibilidade entre maos — v3
- Leitura da mao nao-dominante — MVP le apenas dominante
- Rate limit Upstash — Map in-memory funciona ate ~1000 concurrent
- Clerk OAuth inline (login Google sem redirect) — complexidade alta, baixo impacto

## Context

- v1.0 Backend MVP completo (7 fases)
- v1.1 Alinhamento Arquitetural completo (5 fases)
- v1.2 Fluxo de Mao Dominante completo (5 fases)
- v1.3 Sistema de Creditos Robusto completo (6 fases)
- AbacatePay wrapper existe mas usa API v1 (v2 mudou endpoints, payload, webhook)
- /creditos page tem UI mas QR PIX e hardcoded e form de cartao nao faz nada
- Resend wrapper existe com templates reais mas dominio nao verificado
- 162+ testes, build green, staging ativo
- v2 Monetizacao completo (AbacatePay v2, Resend, bug fixes)
- Elemento: GPT-4o classifica mas non-deterministic. MediaPipe landmarks não serve pra classificar. Sessão experimental extensa em git stash com prompt multi-indicador testado.

## Constraints

- **Tech stack**: Next.js 16, TypeScript strict, sem `any`, `no-console: error`
- **Seguranca**: foto nunca armazenada, CPF nunca logado, dados pessoais nunca nos logs
- **Performance**: `selectBlocks` <1ms (zero I/O, tudo em memoria)
- **Auth**: Clerk e source of truth pra name/email/foto. Neon so tem CPF e customer_id
- **Brand voice**: todo texto pro usuario segue `docs/brand-voice.md` (voz da cigana)
- **Pagamento**: checkout hosted (redirect pro AbacatePay), nao transparent
- **AbacatePay v2**: produtos sao entidades separadas, checkout referencia por ID

## Key Decisions

| Decision                          | Rationale                                  | Outcome |
| --------------------------------- | ------------------------------------------ | ------- |
| Neon + Prisma 7 com adapter       | Serverless, free tier generoso             | ✓ Good  |
| Clerk pra auth                    | 50K users free, Google OAuth + email/senha | ✓ Good  |
| GPT-4o pra visao                  | Melhor modelo multimodal                   | ✓ Good  |
| Fluxo unico com is_self flag      | Nao existe rota separada                   | ✓ Good  |
| Creditos nao expiram              | Simplifica logica                          | ✓ Good  |
| Share via reading UUID            | URL usa reading ID direto                  | ✓ Good  |
| MediaPipe Hand Landmarker         | Deteccao client-side, zero server          | ✓ Good  |
| Checkout hosted (nao transparent) | AbacatePay cuida do form, menos codigo     | ✓ v2    |
| AbacatePay v2 API                 | v1 deprecated, v2 tem produtos separados   | ✓ v2    |
| Transacao atomica no capture      | Debit + reading na mesma transaction       | ✓ Good  |
| Raw SQL debit FIFO                | Previne race condition                     | ✓ Good  |

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

_Last updated: 2026-04-18 after milestone v1.4 start_
