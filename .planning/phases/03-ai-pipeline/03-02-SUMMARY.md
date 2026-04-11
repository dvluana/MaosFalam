---
phase: 03-ai-pipeline
plan: "02"
subsystem: api
tags: [select-blocks, fallback, pino, typescript, blocks]

# Dependency graph
requires:
  - phase: 03-ai-pipeline
    provides: "selectBlocks motor de leitura com HEART_BLOCKS, HEAD_BLOCKS, LIFE_BLOCKS, FATE_BLOCKS"
provides:
  - "_fallback entry em todos os quatro mapas de blocos de linha"
  - "buildLineSection nunca retorna undefined silenciosamente para variacao desconhecida"
  - "logger.warn com { axis, variation } sem PII quando variacao desconhecida"
affects: [03-ai-pipeline/03-03, openai-integration, reading-capture]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fallback pattern: blocks[variation] ?? blocks['_fallback'] — garante ReportJSON completo mesmo com schema drift"
    - "Warn log sem PII: logger.warn({ axis, variation }, message) — sem nome, email, ou dado pessoal"

key-files:
  created: []
  modified:
    - src/data/blocks/heart.ts
    - src/data/blocks/head.ts
    - src/data/blocks/life.ts
    - src/data/blocks/fate.ts
    - src/server/lib/select-blocks.ts

key-decisions:
  - "_fallback usa textos com brand voice da cigana (segunda pessoa, sem travessao, sem emojis) — nao e placeholder tecnico, e texto real que pode aparecer pro usuario"
  - "logger importado via './logger' (relativo) nao via alias '@/server/lib/logger' — consistente com outros imports no mesmo arquivo"

patterns-established:
  - "Fallback block pattern: widening Record<XVariation, T> para Record<XVariation | '_fallback', T> permite adicionar chave especial sem quebrar tipagem"

requirements-completed: [AI-02]

# Metrics
duration: 2min
completed: 2026-04-11
---

# Phase 03 Plan 02: selectBlocks Fallback Hardening Summary

**\_fallback blocks adicionados aos quatro mapas de linha (heart, head, life, fate) com buildLineSection usando ?? para nunca jogar undefined em pickRandom**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-11T02:01:25Z
- **Completed:** 2026-04-11T02:03:23Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Quatro mapas de blocos (`HEART_BLOCKS`, `HEAD_BLOCKS`, `LIFE_BLOCKS`, `FATE_BLOCKS`) agora teem entrada `_fallback` com estrutura `LineBlocks` completa (opening, body_past, body_present, cada um com content/alt/alt2)
- `buildLineSection` usa `blocks[variation] ?? blocks["_fallback"]` — `pickRandom` nunca recebe `undefined`
- `logger.warn({ axis: key, variation }, ...)` disparado quando variacao desconhecida — sem PII
- Anotacoes de tipo alargadas: `Record<XVariation | "_fallback", LineBlocks>` em todos os quatro arquivos
- `npm run type-check` passa nos cinco arquivos modificados

## Task Commits

1. **Task 1: Add \_fallback entries to all four block maps** - `b140f5a` (feat)
2. **Task 2: Harden buildLineSection with fallback lookup and warn log** - `8fd7ded` (feat)

## Files Created/Modified

- `src/data/blocks/heart.ts` - Tipo alargado + entrada `_fallback` com textos da cigana sobre Linha do Coracao
- `src/data/blocks/head.ts` - Tipo alargado + entrada `_fallback` com textos da cigana sobre Linha da Cabeca
- `src/data/blocks/life.ts` - Tipo alargado + entrada `_fallback` com textos da cigana sobre Linha da Vida
- `src/data/blocks/fate.ts` - Tipo alargado + entrada `_fallback` com textos da cigana sobre Linha do Destino
- `src/server/lib/select-blocks.ts` - Import de logger + lookup com fallback + warn log em buildLineSection

## Decisions Made

- Textos dos `_fallback` seguem brand voice completa (segunda pessoa, sem travessao, sem emojis, nomenclatura real de quiromancia) porque podem aparecer pro usuario em producao se houver schema drift entre GPT-4o JSON Schema e os mapas de blocos.
- Import do logger usando caminho relativo `"./logger"` para consistencia com o padrao do arquivo existente.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing type error em `src/server/lib/__tests__/openai.test.ts` (regex flag `d` requer `es2018+`) — fora do escopo desta tarefa, nao tocado, registrado em deferred-items conforme regra de scope boundary.

## Known Stubs

None - nenhum stub ou placeholder no codigo modificado. Os textos `_fallback` sao conteudo real da cigana.

## Next Phase Readiness

- `selectBlocks` agora e robusto contra schema drift — pronto para integracao com GPT-4o no plano 03-03
- Qualquer variacao desconhecida retorna ReportJSON completo com texto da cigana, nao erro de runtime

---

_Phase: 03-ai-pipeline_
_Completed: 2026-04-11_
