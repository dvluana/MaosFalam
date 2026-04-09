# MãosFalam · Blocos de Leitura

> Conteúdo dos blocos em `src/mocks/reading-blocks.json`.
> Tipos em `src/types/reading-block.ts`.
> Voz e regras de texto em `docs/brand-voice.md`.

Este doc descreve **como os blocos são estruturados e selecionados**. Os textos ficam no JSON pra não inflar o contexto e pra virarem seed direto do Prisma (`reading_blocks`).

---

## Schema

```ts
interface ReadingBlock {
  axis: 'element' | 'heart' | 'head' | 'life' | 'fate' | 'mount' | 'rare' | 'cross'
  variation: string          // ex: 'heart_long_straight'
  block_type: 'intro' | 'body' | 'impact' | 'cross'
  tier: 'free' | 'premium'
  content: string            // texto principal
  content_alt?: string       // variação 1
  content_alt2?: string      // variação 2
}
```

Mapeia 1:1 pra tabela `reading_blocks` do `docs/architecture.md` (menos `id`, `sort_order`, `is_active`, que são do banco).

### Papel de cada `block_type`

| Tipo | Fonte | Onde aparece |
|------|-------|--------------|
| `intro` | Cormorant Garamond italic | Abertura da seção (voz da cigana) |
| `body` | Raleway | Parágrafo de leitura principal |
| `impact` | Cormorant Garamond italic | Frase sozinha na tela, share card |
| `cross` | Raleway | Cruzamentos e modificadores (bloco único, sem intro/body/impact) |

### Tier

- `free` — elemento + Linha do Coração (intro, body, impact) + modificadores do Coração. É o que a usuária vê sem pagar.
- `premium` — Cabeça, Vida, Destino, Montes, Sinais Raros, Cruzamentos. Só com crédito.

---

## Matching: atributos → variation

O motor de leitura recebe o JSON de atributos da IA de visão (schema em `docs/palmistry.md`) e escolhe 1 `variation` por eixo.

### Regras por eixo

**element** — direto de `hand_type`:
`fire | water | earth | air` → `variation` = mesmo valor.

**heart** — combina `length` + `curve` + `depth`:
- `long` + `straight` → `heart_long_straight`
- `long` + `slightly_curved` → `heart_long_curved`
- `long` + `deeply_curved` → `heart_long_deep_curved`
- `short` + `straight` → `heart_short_straight`
- `short` + `slightly_curved`/`deeply_curved` → `heart_short_curved`
- `medium` + `straight` → `heart_medium_straight`
- `medium` + `slightly_curved`/`deeply_curved` → `heart_medium_curved`
- `depth = faint` (qualquer) → `heart_faint`

**heart modifiers** (`block_type='cross'`, extras além do principal):
- `forks = end_fork` → `heart_end_fork`
- `islands > 0` → `heart_island`
- `breaks > 0` → `heart_break`
- `ends_at = index` → `heart_ends_index`
- `ends_at = middle` → `heart_ends_middle`
- `depth = deep` → `heart_deep`

**head** — mesma lógica de length/curve/depth:
- `long` + `straight` → `head_long_straight`
- `long` + `slightly_curved` → `head_long_curved`
- `long` + `deeply_curved_to_luna` → `head_long_deep_curved`
- `medium` + `straight` → `head_medium_straight`
- `medium` + `slightly_curved` → `head_medium_curved`
- `short` + `straight` → `head_short_straight`
- `short` + `slightly_curved` → `head_short_curved`
- `depth = faint` → `head_faint`

**life** — length/depth/arc:
- `long` + `deep` → `life_long_deep`
- `long` + `faint` → `life_long_faint`
- `short` + `deep` → `life_short_deep`
- `short` + `faint` → `life_short_faint`
- `arc_width = wide` → `life_curved_wide`
- `arc_width = tight` → `life_curved_tight`
- `chained = true` → `life_chained`
- `breaks > 0` e `break_offset = true` → `life_broken_restart`

**fate** — presença + start_point:
- `present = false` → `fate_absent`
- `present = true` + `depth = deep` → `fate_present_deep`
- `present = true` + `depth = faint` → `fate_present_faint`
- `multiple = true` → `fate_multiple`
- `start_point = mid_palm` → `fate_late_start`
- `breaks > 0` → `fate_broken`

**mount** — só gera bloco quando `pronounced`:
`jupiter | saturn | apollo | mercury | venus | luna | mars_positive | mars_negative` → `mount_<nome>`.

**rare** — entrada direta de `rare_signs[]`:
`star_jupiter | star_apollo | mystic_cross | solomon_ring | sun_line | venus_girdle | intuition_line | protection_square | triangle_center`.

**cross** — gerados por combinações especiais (ver variations com prefixo `cross_` no JSON). Opcionais, o motor escolhe os mais relevantes.

### Escolha de variação textual

Cada bloco tem até 3 variações (`content`, `content_alt`, `content_alt2`). O motor escolhe uma por seed determinístico baseado em `reading.id` pra mesma leitura sempre renderizar o mesmo texto.

---

## Exemplos (1 por eixo)

```json
{
  "axis": "element",
  "variation": "fire",
  "block_type": "intro",
  "tier": "free",
  "content": "Suas mãos queimam, {{name}}. Eu senti antes de olhar."
}
```

```json
{
  "axis": "heart",
  "variation": "heart_long_straight",
  "block_type": "impact",
  "tier": "free",
  "content": "Quando você ama, é tudo. Quando sai, queima o caminho. E não olha pra trás."
}
```

```json
{
  "axis": "head",
  "variation": "head_long_straight",
  "block_type": "body",
  "tier": "premium",
  "content": "Mente afiada. Lógica domina. Você analisa antes de sentir..."
}
```

```json
{
  "axis": "life",
  "variation": "life_long_deep",
  "block_type": "impact",
  "tier": "premium",
  "content": "Você levanta. Sempre levanta. As pessoas se impressionam..."
}
```

```json
{
  "axis": "fate",
  "variation": "fate_absent",
  "block_type": "body",
  "tier": "premium",
  "content": "Ausência de Linha do Destino não é ausência de destino..."
}
```

```json
{
  "axis": "mount",
  "variation": "mount_jupiter",
  "block_type": "body",
  "tier": "premium",
  "content": "Seu Monte de Júpiter é pronunciado..."
}
```

```json
{
  "axis": "rare",
  "variation": "mystic_cross",
  "block_type": "body",
  "tier": "premium",
  "content": "Cruz mística no centro da sua palma..."
}
```

```json
{
  "axis": "cross",
  "variation": "cross_heart_deep_head_long",
  "block_type": "cross",
  "tier": "premium",
  "content": "Você carrega mais do que mostra. E isso te protege e te prende..."
}
```

---

## Regras de escrita

Todo texto segue `docs/brand-voice.md`:
- Segunda pessoa. `{{name}}` quando fizer sentido.
- Zero travessões (em dash). Ponto ou vírgula.
- Zero emojis, zero "energias/vibrações/universo".
- Nomenclatura real: "Monte de Júpiter", "Linha de Saturno".
- A cigana revela, não explica.

## Cobertura atual

143 blocos no `reading-blocks.json`.

## Seed do Prisma (quando o backend subir)

```ts
// prisma/seed.ts
import blocks from '../src/mocks/reading-blocks.json'
import type { ReadingBlock } from '../src/types/reading-block'

await prisma.readingBlock.createMany({
  data: (blocks as ReadingBlock[]).map((b, i) => ({ ...b, sort_order: i })),
})
```
