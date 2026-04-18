# Requirements: MaosFalam v1.4 Classificacao de Elemento

**Defined:** 2026-04-18
**Core Value:** A foto da palma entra, a leitura personalizada sai. Classificacao de elemento correta e consistente.

## v1.4 Requirements

### GPT-4o Classification

- [x] **ELEM-01**: GPT-4o classifica mao em Types A/B/C/D com 6-7 indicadores visuais por tipo
- [x] **ELEM-02**: Schema inclui primary_type, secondary_type, type_reasoning como campos obrigatorios
- [x] **ELEM-03**: deriveElement() no server mapeia A=earth, B=air, C=fire, D=water
- [x] **ELEM-04**: deriveSecondaryElement() retorna element ou null quando "none"
- [x] **ELEM-05**: Model pinned (gpt-4o-2024-08-06), detail:high, temperature:0
- [x] **ELEM-06**: 3 schemas em sync (OpenAI JSON Schema, Zod, TypeScript HandAttributes)

### MediaPipe Validation

- [x] **MEDIA-01**: computeElementHint removida completamente (e todas as refs)
- [x] **MEDIA-02**: Handedness inversion restaurada pra camera traseira
- [x] **MEDIA-03**: Angulo < 25 graus com hysteresis (buffer N=3 frames)
- [x] **MEDIA-04**: Jitter detection (5 frames, threshold 2.5%)
- [x] **MEDIA-05**: Countdown visual durante estabilidade

### Image Quality

- [x] **IMG-01**: JPEG quality 0.92 no captureFrame
- [x] **IMG-02**: Max dimension 2048px no normalizeImage
- [x] **IMG-03**: Body limit 4MB na capture route

### Mixed Hands

- [ ] **MIX-01**: HandAttributes.secondary_element (optional)
- [ ] **MIX-02**: ReportJSON.element.secondary_key + bridge (optional)
- [ ] **MIX-03**: ELEMENT_BRIDGE com 12 strings (4 elementos x 3 variacoes)
- [ ] **MIX-04**: ELEMENT_EXCLUSIVITY_MIXED com 12 combinacoes
- [ ] **MIX-05**: selectBlocks() inclui bridge quando secondary existe
- [ ] **MIX-06**: Seed hash do selectBlocks exclui secondary_element
- [ ] **MIX-07**: ElementHero mostra "Com tracos de [secundario]"
- [ ] **MIX-08**: ElementSection insere bridge text apos body primario
- [ ] **MIX-09**: HandSummary usa exclusivity mista
- [ ] **MIX-10**: Leituras antigas sem secondary renderizam normalmente

## Future Requirements

- Compatibilidade entre maos (esquerda vs direita comparativa)
- Assinatura mensal
- Previsoes periodicas

## Out of Scope

- App nativo (web-first)
- CNN/modelo custom pra classificacao de elemento (GPT-4o multi-indicador e suficiente)
- MediaPipe pra classificacao de elemento (comprovado instavel)
- Gemini como alternativa ao GPT-4o (quota free insuficiente, sem beneficio claro)

## Traceability

| REQ-ID   | Phase    | Status   |
| -------- | -------- | -------- |
| ELEM-01  | Phase 16 | Complete |
| ELEM-02  | Phase 16 | Complete |
| ELEM-03  | Phase 16 | Complete |
| ELEM-04  | Phase 16 | Complete |
| ELEM-05  | Phase 16 | Complete |
| ELEM-06  | Phase 16 | Complete |
| IMG-01   | Phase 16 | Complete |
| IMG-02   | Phase 16 | Complete |
| IMG-03   | Phase 16 | Complete |
| MEDIA-01 | Phase 17 | Complete |
| MEDIA-02 | Phase 17 | Complete |
| MEDIA-03 | Phase 17 | Complete |
| MEDIA-04 | Phase 17 | Complete |
| MEDIA-05 | Phase 17 | Complete |
| MIX-01   | Phase 18 | Pending  |
| MIX-02   | Phase 18 | Pending  |
| MIX-03   | Phase 18 | Pending  |
| MIX-04   | Phase 18 | Pending  |
| MIX-05   | Phase 18 | Pending  |
| MIX-06   | Phase 18 | Pending  |
| MIX-07   | Phase 19 | Pending  |
| MIX-08   | Phase 19 | Pending  |
| MIX-09   | Phase 19 | Pending  |
| MIX-10   | Phase 19 | Pending  |
