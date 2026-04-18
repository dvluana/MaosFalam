# Roadmap: MaosFalam

## Milestones

- ✅ **v1.0 Backend MVP** - Phases 1-7 (shipped 2026-04-11)
- ✅ **v1.1 Alinhamento Arquitetural** - Phases 1-5 (shipped 2026-04-11)
- ✅ **v1.2 Fluxo de Mao Dominante** - Phases 1-5 (shipped 2026-04-11)
- ✅ **v1.3 Sistema de Creditos Robusto** - Phases 6-11 (shipped 2026-04-14)
- ✅ **v2 Monetizacao** - Phases 12-15 (shipped 2026-04-14)
- 🚧 **v1.4 Classificacao de Elemento** - Phases 16-19 (in progress)

<details>
<summary>✅ v1.0 Backend MVP (Phases 1-7) - SHIPPED 2026-04-11</summary>

Phase 1: Foundation | Phase 2: Auth | Phase 3: AI Pipeline | Phase 4: Public API | Phase 5: Protected API | Phase 6: Client Adapters | Phase 7: Frontend-Backend Wiring

All 17 plans completed. See `.planning/archive/v1.0/` for history.

</details>

<details>
<summary>✅ v1.1 Alinhamento Arquitetural (Phases 1-5) - SHIPPED 2026-04-11</summary>

Phase 1: Auditoria | Phase 2: ReadingContext + Creditos | Phase 3: MediaPipe Real | Phase 4: Clerk Cleanup + Error Handling | Phase 5: Docs Sync

All 9 plans completed. See `.planning/archive/v1.1/` for history.

</details>

<details>
<summary>✅ v1.2 Fluxo de Mao Dominante (Phases 1-5) - SHIPPED 2026-04-11</summary>

Phase 1: Camera UI | Phase 2: Upload Pipeline | Phase 3: Edge Cases + Prompt | Phase 4: Outra Pessoa + A11y | Phase 5: Pipeline Refactor

All 13 plans completed. See `.planning/archive/v1.2/` for history.

</details>

<details>
<summary>✅ v1.3 Sistema de Creditos Robusto (Phases 6-11) - SHIPPED 2026-04-14</summary>

Phase 6: Atomic Credit Transaction | Phase 7: Credit Infrastructure Cleanup | Phase 8: Auth & Navigation Fixes | Phase 9: Reading Flow Fixes | Phase 10: Logging Hardening | Phase 11: Codebase Cleanup

All 7 plans completed. See `.planning/archive/v1.3/` for history.

</details>

<details>
<summary>✅ v2 Monetizacao (Phases 12-15) - SHIPPED 2026-04-14</summary>

Phase 12: AbacatePay v2 Backend | Phase 13: Frontend Payment Flow | Phase 14: Email & Hardening | Phase 15: Bug Fixes

All 6 plans completed. See `.planning/archive/v2/` for history.

</details>

---

### 🚧 v1.4 Classificacao de Elemento (In Progress)

**Milestone Goal:** Classificacao de elemento correta e consistente. GPT-4o classifica com prompt multi-indicador (Types A/B/C/D x 6-7 indicadores visuais). MediaPipe valida posicao/angulo/estabilidade (sem classificar elemento). Suporte a maos mistas (primary + secondary element). Leituras antigas sem secondary renderizam normal.

## Phases

- [ ] **Phase 16: GPT-4o Schema e Image Quality** - Prompt multi-indicador, deriveElement(), triple-schema sync, JPEG 0.92, body limit 4MB
- [ ] **Phase 17: MediaPipe Validation Refactor** - Remove computeElementHint, restaura handedness traseira, angulo 25 graus com hysteresis, jitter detection
- [ ] **Phase 18: Block Engine e Conteudo Misto** - secondary_element no motor, ELEMENT_BRIDGE, ELEMENT_EXCLUSIVITY_MIXED, seed hash fix
- [ ] **Phase 19: Frontend Mao Mista** - ElementHero/ElementSection com secondary, backward compat verificado

## Phase Details

### Phase 16: GPT-4o Schema e Image Quality

**Goal**: GPT-4o classifica elemento via tipos neutros A/B/C/D com 6-7 indicadores visuais. Triple schema (OpenAI JSON Schema, Zod, TypeScript) sincronizado. Imagem de qualidade alta antes de chegar ao modelo.
**Depends on**: Nothing (first phase of v1.4)
**Requirements**: ELEM-01, ELEM-02, ELEM-03, ELEM-04, ELEM-05, ELEM-06, IMG-01, IMG-02, IMG-03
**Success Criteria** (what must be TRUE):

1. A mesma foto enviada 3 vezes ao GPT-4o produz o mesmo primary_type nos 3 retornos
2. deriveElement() mapeia A/B/C/D para earth/air/fire/water no servidor, nunca no cliente
3. npm run type-check passa sem erros apos as 3 schemas serem atualizadas em lockstep
4. captureFrame gera JPEG com quality 0.92 e a rota capture rejeita payloads acima de 4MB
5. secondary_type retorna "none" quando mao nao e mista, e o campo secondary_element fica ausente no objeto de saida
   **Plans**: TBD

### Phase 17: MediaPipe Validation Refactor

**Goal**: MediaPipe restringe-se a validar qualidade da foto (angulo, estabilidade, handedness). Nenhum rastro de classificacao de elemento permanece no pipeline.
**Depends on**: Phase 16
**Requirements**: MEDIA-01, MEDIA-02, MEDIA-03, MEDIA-04, MEDIA-05
**Success Criteria** (what must be TRUE):

1. computeElementHint, dist3D, elementSamplesRef e elementMode nao existem em nenhum arquivo do projeto
2. Camera traseira + mao direita passa handedness; camera traseira + mao esquerda falha handedness
3. Mao inclinada mais de 25 graus mostra estado adjusting; ao endireitar a mao o estado stable e alcancado dentro de 3 segundos
4. Countdown visual aparece durante o periodo de estabilidade enquanto o timer conta
5. Jitter acima de 2.5% em 5 frames reseta o contador de estabilidade sem travar o usuario em loop
   **Plans**: TBD

### Phase 18: Block Engine e Conteudo Misto

**Goal**: O motor de leitura suporta mao mista com secondary_element. Novos blocos de conteudo escritos com voz da cigana. Seed hash nao quebra leituras existentes.
**Depends on**: Phase 16
**Requirements**: MIX-01, MIX-02, MIX-03, MIX-04, MIX-05, MIX-06
**Success Criteria** (what must be TRUE):

1. selectBlocks() chamado com e sem secondary_element produz o mesmo texto primario (seed hash estavel)
2. ELEMENT_BRIDGE tem 12 strings, uma por par direcional (fogo+agua e agua+fogo sao distintas)
3. ELEMENT_EXCLUSIVITY_MIXED tem 12 strings e todas passam o checklist de brand-voice (zero palavras proibidas)
4. ReportJSON.element.secondary_key e element.bridge sao opcionais e absent em leituras sem mao mista
5. Unit test falha se secondary_element modificar a variacao textual dos blocos primarios
   **Plans**: TBD

### Phase 19: Frontend Mao Mista

**Goal**: Resultado exibe secondary element de forma subordinada quando presente. Leituras antigas sem secondary renderizam sem crash e sem slots vazios.
**Depends on**: Phase 18
**Requirements**: MIX-07, MIX-08, MIX-09, MIX-10
**Success Criteria** (what must be TRUE):

1. Leitura anterior a v1.4 (sem secondary_key) carrega e renderiza sem erro em ElementHero e ElementSection
2. Leitura nova com mao mista mostra badge subordinado "Com tracos de [secundario]" em ElementHero
3. ElementSection exibe o texto de bridge logo apos o body do elemento primario quando bridge existe
4. HandSummary usa texto de exclusivity mista quando secondary_element esta presente
   **Plans**: TBD
   **UI hint**: yes

## Progress

**Execution Order:**
Phase 16 → 17 (parallel com 18) → 18 → 19

| Phase                             | Milestone | Plans Complete | Status      | Completed  |
| --------------------------------- | --------- | -------------- | ----------- | ---------- |
| 12. AbacatePay v2 Backend         | v2        | 2/2            | Complete    | 2026-04-14 |
| 13. Frontend Payment Flow         | v2        | 2/2            | Complete    | 2026-04-14 |
| 14. Email & Hardening             | v2        | 1/1            | Complete    | 2026-04-14 |
| 15. Bug Fixes                     | v2        | 1/1            | Complete    | 2026-04-14 |
| 16. GPT-4o Schema e Image Quality | v1.4      | 0/TBD          | Not started | -          |
| 17. MediaPipe Validation Refactor | v1.4      | 0/TBD          | Not started | -          |
| 18. Block Engine e Conteudo Misto | v1.4      | 0/TBD          | Not started | -          |
| 19. Frontend Mao Mista            | v1.4      | 0/TBD          | Not started | -          |
