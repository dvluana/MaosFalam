---
phase: 19
plan: 01
subsystem: frontend
tags: [mixed-element, backward-compat, ui]
dependency_graph:
  requires: [Phase 18 — ELEMENT_BRIDGE + ELEMENT_EXCLUSIVITY_MIXED in select-blocks]
  provides: [secondary element display in ElementHero, bridge text in ElementSection, mixed exclusivity in HandSummary]
  affects: [/ler/resultado/[id], /ler/resultado/[id]/completo, /compartilhar/[token]]
tech_stack:
  added: []
  patterns: [optional chaining null-guard, conditional render on optional props]
key_files:
  created: []
  modified:
    - src/components/reading/ElementHero.tsx
    - src/components/reading/ElementSection.tsx
    - src/components/reading/HandSummary.tsx
    - src/app/ler/resultado/[id]/completo/page.tsx
    - src/app/ler/resultado/[id]/page.tsx
decisions:
  - secondaryKey prop bifurca exclusivity render — frase completa do motor para mistas, append elementName em gold para puras
  - badge "Com tracos de [Elemento]" usa font-jetbrains uppercase bone-dim para hierarquia subordinada
  - bridge text usa font-cormorant italic para manter voz da cigana separada do body Raleway
metrics:
  duration: 8m
  completed: "2026-04-18"
  tasks: 4
  files: 5
---

# Phase 19 Plan 01: Frontend Mao Mista Summary

**One-liner:** Secondary element exibido de forma subordinada em ElementHero/ElementSection/HandSummary com backward compat total para leituras sem secondary_key.

## Tasks Completed

| Task | Description                                             | Commit  |
| ---- | ------------------------------------------------------- | ------- |
| 1    | ElementHero — badge subordinado secondary_key           | 2da30d2 |
| 2    | ElementSection — bridge text apos body                  | 2da30d2 |
| 3    | HandSummary — secondaryKey prop + exclusivity bifurcado | 2da30d2 |
| 4    | Verificacao backward compat + tests 162/162             | 2da30d2 |

## What Was Built

### ElementHero (MIX-07)

- Props expandidas: `element: { key: HandElement; secondary_key?: HandElement }`
- Badge sutil com `motion.div` delay 1.35s, texto "Com tracos de [Elemento]"
- Estilo: `font-jetbrains text-[10px] tracking-[1.5px] uppercase text-bone-dim`
- Posicionado entre o ornamental divider e o impact phrase
- Null-guard: `{element.secondary_key && (...)}`

### ElementSection (MIX-08)

- Bridge text inserido entre body e impact phrase
- Estilo: `font-cormorant italic text-[17px] sm:text-[19px] text-bone leading-[1.45]` com `mt-4 mb-4`
- Null-guard: `{element.bridge && (...)}`
- Sem mudanca na interface Props — `element: ReportJSON["element"]` ja inclui `bridge?: string`

### HandSummary (MIX-09 + MIX-10)

- Nova prop `secondaryKey?: HandElement`
- Para mistas (`secondaryKey` presente): renderiza `portrait.exclusivity` puro (frase completa do motor)
- Para puras (`secondaryKey` ausente): renderiza `portrait.exclusivity` + ` ` + `elementName` em gold (comportamento original)
- Corrige bug latente: motor gera frases completas para mistas, antigo append duplicaria o elemento

### Call sites atualizados

- `/ler/resultado/[id]/page.tsx`: passa `secondary_key` para ElementHero
- `/ler/resultado/[id]/completo/page.tsx`: passa `secondary_key` para ElementHero e `secondaryKey` para HandSummary

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] HandSummary exclusivity append duplicaria elemento em leituras mistas**

- **Found during:** Task 3
- **Issue:** Motor gera exclusivity como frase completa para mistas (ex: "Apenas 7% das maos que eu ja li tem Fogo com traco de Agua."). HandSummary sempre anexa `elementName` em gold no final, resultando em "...Agua. Fogo" para leituras mistas.
- **Fix:** Prop `secondaryKey` bifurca o render — frase completa quando mista, append quando pura.
- **Files modified:** HandSummary.tsx, completo/page.tsx
- **Commit:** 2da30d2

## Known Stubs

None — secondary_key e bridge sao opcionais e o motor ja os gera. Nao ha placeholders ou dados mockados.

## Pre-existing Issues (Out of Scope)

Build falha com TypeScript errors em `src/mocks/hand-attributes.ts` e `src/server/lib/openai.ts` referentes a `primary_type` inexistente em `HandAttributes`. Esses erros existem desde Phase 16-01 (Phase 16-02 nao foi executada, que sincronizaria os tipos). Nao causados por este plano. Tests 162/162 passam.

## Self-Check: PASSED

- [x] ElementHero.tsx modificado e commitado (2da30d2)
- [x] ElementSection.tsx modificado e commitado (2da30d2)
- [x] HandSummary.tsx modificado e commitado (2da30d2)
- [x] completo/page.tsx modificado e commitado (2da30d2)
- [x] resultado/[id]/page.tsx modificado e commitado (2da30d2)
- [x] git log confirma commit 2da30d2
- [x] 162 tests passam
- [x] lint passa (zero warnings)
