---
phase: 04-clerk-cleanup-error-handling
plan: "02"
subsystem: error-handling
tags: [error-handling, toast, ux, feedback]
dependency_graph:
  requires: []
  provides: [DOCS-03, DOCS-04]
  affects: [conta/leituras, ler/resultado]
tech_stack:
  added: []
  patterns: [useToast hook, serverError state separation]
key_files:
  created: []
  modified:
    - src/app/conta/leituras/page.tsx
    - src/app/ler/resultado/[id]/page.tsx
decisions:
  - "showToast adicionado ao useEffect dependency array para evitar stale closure (correto, useCallback garante referencia estavel)"
  - "ServerError renderiza com window.location.href para reload da mesma URL — correto para retry de 5xx"
metrics:
  duration: 65s
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_modified: 2
---

# Phase 04 Plan 02: Error Handling — Toast e ServerError Summary

**One-liner:** Toast na voz da cigana quando /conta/leituras falha + estado serverError separado de notFound em /ler/resultado.

## Tasks Completed

| Task | Name                                              | Commit  | Files                               |
| ---- | ------------------------------------------------- | ------- | ----------------------------------- |
| 1    | Toast de erro em /conta/leituras quando API falha | 859bf29 | src/app/conta/leituras/page.tsx     |
| 2    | Diferenciar 404 de 500 em /ler/resultado/[id]     | d385d69 | src/app/ler/resultado/[id]/page.tsx |

## What Was Built

### Task 1: /conta/leituras toast de erro

`LeiturasContent` agora importa `useToast` de `@/components/ui/ToastProvider` e chama `showToast` no bloco `.catch()` do `Promise.all`. Quando o carregamento de perfil, leituras ou creditos falha, o usuario ve um toast rose com a mensagem "Nao consegui trazer suas leituras. Tenta de novo." em vez de silencio. A lista exibe o estado empty (correto), e o toast complementa com a mensagem de erro.

### Task 2: /ler/resultado/[id] — serverError separado

`ResultadoInner` ganhou um estado `serverError` separado de `notFound`. Antes, o `.catch()` do `getReading` definia `notFound=true` indiscriminadamente — o que mostrava a mensagem "Essa leitura nao existe" mesmo quando o erro era de servidor (5xx ou falha de rede). Agora:

- `getReading` retorna `null` (404/410) → `notFound=true` → `InvalidReading` ("Essa leitura nao existe. Mas a sua pode comecar agora.")
- `getReading` lanca excecao (5xx, rede) → `serverError=true` → `ServerError` ("Eu preciso de um momento. Volte em breve." + botao de retry)

O componente `ServerError` usa `window.location.href` para o botao de retry, recarregando a mesma URL sem estado cacheado.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — ambas as paginas tem fluxo de dados real conectado. Os novos estados de erro sao triggered por falhas reais da API.

## Self-Check: PASSED

- [x] src/app/conta/leituras/page.tsx modificado e commit 859bf29 existe
- [x] src/app/ler/resultado/[id]/page.tsx modificado e commit d385d69 existe
- [x] grep -n "serverError" confirma estado separado (linhas 87, 110)
- [x] grep -n "showToast" confirma toast importado e chamado (linhas 378, 395, 401)
- [x] npm run build passa sem erros
