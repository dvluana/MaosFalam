---
phase: 18-block-engine-conteudo-misto
plan: "01"
subsystem: block-engine
tags: [tdd, mixed-element, seed-hash, bridge, select-blocks]
dependency_graph:
  requires: []
  provides: [mixed-element-bridge, stable-seed-hash, element-exclusivity-mixed]
  affects: [select-blocks, report-json, element-blocks]
tech_stack:
  added: []
  patterns: [seeded-prng-stable-subset, conditional-rng-consumption, directional-bridge-record]
key_files:
  created:
    - src/server/lib/select-blocks.test.ts
  modified:
    - src/types/hand-attributes.ts
    - src/types/report.ts
    - src/data/blocks/element.ts
    - src/data/blocks/index.ts
    - src/server/lib/select-blocks.ts
decisions:
  - "bridge consumes rng AFTER opening (not after elementBody) to preserve opening seed for non-mixed hands"
  - "secondary_element added to HandAttributes as optional field"
  - "hashInputs serializes explicit stable subset of attrs (excludes secondary_element, confidence)"
  - "ELEMENT_BRIDGE uses Partial<Record> to avoid same-element keys at type level"
metrics:
  duration: 4m
  completed_date: "2026-04-18"
  tasks_completed: 4
  files_modified: 6
---

# Phase 18 Plan 01: Block Engine com Suporte a Mao Mista Summary

Motor de leitura suporta mao mista com bridge text direcional (ELEMENT_BRIDGE 12 pares) e exclusivity especifica (ELEMENT_EXCLUSIVITY_MIXED 12 strings), com seed hash fixado para excluir secondary_element e preservar determinismo de leituras existentes.

## Tasks Completed

| Task               | Description                                                                      | Commit  | Files                                                                 |
| ------------------ | -------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| 1 (RED)            | 9 failing tests para hash estavel + bridge + exclusivity mista                   | 9b3a9a5 | select-blocks.test.ts                                                 |
| 2 (Tipos + Blocos) | ReportJSON.element + HandAttributes + ELEMENT_BRIDGE + ELEMENT_EXCLUSIVITY_MIXED | 990dff4 | hand-attributes.ts, report.ts, element.ts, index.ts, select-blocks.ts |
| 3 (GREEN)          | hashInputs subset fixo + bridge injetado + exclusivity mista                     | 990dff4 | select-blocks.ts                                                      |
| 4 (REFACTOR)       | type-check e lint clean — sem alteracoes adicionais necessarias                  | —       | —                                                                     |

## Test Results

- 17 tests passando (9 novos + 8 existentes)
- 0 regressoes

## Decisions Made

1. **Bridge posicionado apos opening no rng**: O plano dizia "apos elementBody", mas opening vem entre elementBody e as secoes de linhas. Posicionar bridge apos opening garante que mao sem secondary_element produz o mesmo opening. Bridge so consome rng quando secondary_element existe.

2. **hashInputs com subset explicito**: Serializa apenas os campos estaveis (element, heart, head, life, fate, venus, mounts, rare_signs). Exclui secondary_element e confidence para manter seed identico entre leituras com e sem mao mista.

3. **ELEMENT_BRIDGE usa Partial**: `Record<HandElement, Partial<Record<HandElement, TextBlock>>>` evita exigir mesmo-elemento (fire→fire) no tipo.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Bridge posicionado apos opening em vez de apos elementBody**

- **Found during:** Task 3 (GREEN) — teste MIX-06 opening falhava
- **Issue:** Plan dizia consumir bridge "logo apos elementBody", mas opening e selecionado entre elementBody e as secoes de linhas. Inserir bridge antes do opening deslocava o rng e quebrava o determinismo do opening.
- **Fix:** Bridge posicionado apos opening, antes das secoes de linhas. Resultado identico para mao pura (bridge nao consome rng quando secondary_element e undefined).
- **Files modified:** src/server/lib/select-blocks.ts
- **Commit:** 990dff4

## Known Stubs

None. ELEMENT_BRIDGE e ELEMENT_EXCLUSIVITY_MIXED tem todos os 12 pares preenchidos com conteudo real seguindo brand voice.

## Self-Check: PASSED

- src/server/lib/select-blocks.test.ts: FOUND
- src/data/blocks/element.ts: FOUND
- commit 9b3a9a5: FOUND (test RED)
- commit 990dff4: FOUND (feat GREEN)
