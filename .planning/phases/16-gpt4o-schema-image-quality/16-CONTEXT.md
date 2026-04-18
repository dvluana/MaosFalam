# Phase 16: GPT-4o Schema e Image Quality - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Task Boundary

Reescrever o prompt do GPT-4o pra classificacao de elemento usando tipos neutros (A/B/C/D) com multiplos indicadores visuais. Sincronizar 3 schemas (OpenAI JSON Schema, Zod, TypeScript). Subir qualidade da imagem (JPEG 0.92, max 2048px, body limit 4MB). deriveElement() e deriveSecondaryElement() server-side.

</domain>

<decisions>
## Implementation Decisions

### Prompt approach

- Multi-indicator: 4 tipos (A/B/C/D) com 6-7 indicadores visuais cada
- System prompt em ingles: "You are a hand type classifier..."
- User prompt lista indicadores por tipo e pede contagem
- Modelo NAO sabe que esta classificando elementos de quiromancia
- Nomes neutros (Type A/B/C/D) — server mapeia A=earth, B=air, C=fire, D=water
- Prompt ja testado extensivamente na sessao experimental (git stash)

### Schema fields

- primary_type: enum ["A", "B", "C", "D"] (obrigatorio)
- secondary_type: enum ["A", "B", "C", "D", "none"] (obrigatorio)
- type_reasoning: string (chain-of-thought, contagem de indicadores)
- Remover: palm_proportions, finger_vs_palm, palm_shape, finger_length, observation, element_hint
- Manter: heart, head, life, fate, venus, mounts, rare_signs, confidence

### deriveElement

- A = earth, B = air, C = fire, D = water
- deriveElement(primaryType) retorna HandElement
- deriveSecondaryElement(secondaryType) retorna HandElement | null
- element e secondary_element sao injetados no HandAttributes APOS o Zod parse

### HandAttributes type changes

- Adicionar: primary_type (HandType), secondary_type (HandType | "none"), type_reasoning (string), secondary_element (optional)
- Remover: PalmProportions, FingerVsPalm, observation (se existirem — podem ja estar no stash)
- Manter element como campo derivado

### OpenAI call config

- Model pinned: gpt-4o-2024-08-06 (ja esta assim)
- detail: "high" (ja esta assim)
- temperature: 0 (ja esta assim)
- response_format: json_schema strict:true (ja esta assim)
- max_tokens: 2000

### Image quality

- captureFrame: JPEG quality 0.82 → 0.92
- normalizeImage: max dimension 1280 → 2048
- capture route: body limit 2MB → 4MB
- Sem checks de brilho/contraste/nitidez no client (geram falsos positivos)

### Confidence handling

- confidence < 0.3: rejeitar (manter comportamento atual)
- Nao adicionar warning pra low confidence nesta phase

### Capture route cleanup

- Remover element_hint do Zod schema da rota
- Remover logica de override do elemento (finalAttributes)
- analyzeHand() perde o parametro elementHint
- Response inclui attributes no JSON (pra debug/teste)

### Claude's Discretion

- Ordem exata dos campos no schema JSON
- Texto exato do dominanceContext (pode simplificar)
- Estrutura interna do Zod vs OpenAI schema (manter em sync)

</decisions>

<specifics>
## Specific Ideas

- O prompt testado na sessao experimental esta em git stash (ref: "experimental: element classification multi-indicator (session 2026-04-17)")
- A test route /api/test/openai-palm tem o prompt funcionando — usar como referencia
- A pagina /test-element tambem esta no stash — util pra teste manual

</specifics>

<canonical_refs>

## Canonical References

- .planning/research/SUMMARY.md — synthesis da pesquisa
- .planning/research/PITFALLS.md — 3-schema sync como risco principal
- .planning/research/ARCHITECTURE.md — build order e dependency graph
- docs/palmistry.md — regras de quiromancia pra indicadores
- git stash — codigo experimental testado como referencia

</canonical_refs>
