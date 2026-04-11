---
phase: 05-docs-sync
plan: "01"
subsystem: docs
tags: [documentation, architecture, stack-alignment]
dependency_graph:
  requires: []
  provides: [accurate-architecture-reference, aligned-claude-instructions]
  affects: [all-future-sessions]
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - docs/architecture.md
    - CLAUDE.md
decisions:
  - architecture.md is source of truth for backend — must match prisma/schema.prisma and src/ exactly
  - proxy.ts (not middleware.ts) is Clerk auth middleware — documented in both files
  - AbacatePay and Resend are stubs in v1.1 — explicitly noted to prevent confusion
metrics:
  duration: "~4 minutes"
  completed: "2026-04-11T16:22:26Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 05 Plan 01: Docs Sync Summary

Docs desatualizados removidos e substituidos por referencias precisas ao codigo v1.1.

## What Was Done

### Task 1: docs/architecture.md

**STATUS header:** "PLANO. Backend ainda nao implementado" → "v1.1 implementado. Pagamentos e email adiados para v2."

**Section 1 (Stack):**
- Clerk v7 com nota sobre `src/proxy.ts`
- Prisma 7 com config em `prisma.config.ts`
- Neon branches (main + develop) adicionados
- Vercel staging URL adicionado
- AbacatePay marcado como "stub em v1.1"
- Resend marcado como "nao implementado em v1.1"
- MediaPipe especificado como `@mediapipe/tasks-vision`

**Section 2 (Estrutura de Pastas):**
- Removida secao `features/` (nao existe em src/)
- Removida secao `server/api/` separada (routes ficam em `app/api/`)
- Removida referencia a `email-client.ts` (nao existe em `src/lib/`)
- Adicionado `proxy.ts` como auth middleware
- Adicionado `generated/` (Prisma client)
- Adicionado `reading-context.ts` em `src/lib/`
- Adicionado `mediapipe.ts` em `src/lib/`

**Section 3 (Funil):**
- Substituido "Leitura pra outra pessoa" pelo fluxo unico com `is_self` flag
- Documentado `ReadingContext` interface
- Documentado comportamento visitante vs logada em `/ler/nome`
- Documentado CreditGate (logada, segunda leitura ou mais)

**Section 5 (Schema):**
- Schema SQL agora reflete `prisma/schema.prisma` real
- Anotacoes explicitas: sem share_token, sem expires_at em credit_packs
- Indexes documentados

**Section 7 (MediaPipe):**
- Adicionado `src/lib/mediapipe.ts` como wrapper
- Documentado `dominant_hand` coletado em `/ler/nome`
- Documentado `captureFrame()` des-espelhamento para camera frontal
- Documentado estabilidade via timestamp (nao frame count)
- Adicionado `camera_wrong_hand` como estado inline-recoverable
- `CameraViewport` explicado (video dentro do componente, nao escondido)

**Section 8 (AbacatePay):**
- Adicionada nota: "stub em v1.1, implementar em v2"

**Section 9 (Auth):**
- Substituido qualquer ref `middleware.ts` por `src/proxy.ts`
- Adicionado: "Clerk v7 — auth() e async"

**Section 10 (Email):**
- Adicionada nota: "Resend nao implementado em v1.1"

**Section 14 (Seguranca):**
- Rate limiting descrito como Map in-memory (implementado)
- Removida mencao ambigua a Upstash
- Exemplo Zod atualizado para Zod v4 (`z.email()` nao `z.string().email()`)
- Headers HTTP: removida referencia a `middleware.ts`

**Section 16 (Setup Local):**
- Ja tinha `cp .env.example .env.local`
- Adicionada secao Neon branches
- Adicionada secao Vercel

### Task 2: CLAUDE.md

**"Estrutura do front" (bloco de codigo):**
- Adicionados `proxy.ts` e `generated/` ao bloco de estrutura

**"Project" section:**
- Descricao atualizada para refletir v1.1: fluxo unico is_self, MediaPipe real, Clerk como unico auth

**"Constraints" section:**
- Adicionado: "`src/proxy.ts` (nao `middleware.ts`) e o arquivo de autenticacao Clerk"

**"Technology Stack" — Frameworks:**
- Adicionado: `@mediapipe/tasks-vision 0.10.34 - Hand Landmarker for client-side hand detection`

**"Key Dependencies":**
- Adicionado: `@mediapipe/tasks-vision - Hand Landmarker for real-time hand detection client-side`

**Architecture Entry Points:**
- `src/middleware.ts` → `src/proxy.ts`

**Docs reference:**
- `@docs/architecture.md` description atualizada para "v1.1 implementado"

## Deviations from Plan

None — plan executed exactly as written.

## Verification

```
architecture.md stale refs (share_token|expires_at|NextAuth|next-auth|R2/Cloudflare|Claude Vision): 0
CLAUDE.md stale refs (NextAuth|next-auth|Claude Vision|R2/Cloudflare): 0
npm run build: PASSED
```

## Self-Check: PASSED
