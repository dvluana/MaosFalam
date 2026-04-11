# Blocos de Texto + Motor de Leitura v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrar o sistema de leitura do MaosFalam pra v2: blocos TS estaticos (~515 textos) + motor selectBlocks + adaptar front.

**Architecture:** Blocos em `src/data/blocks/` como Records tipados. Motor puro em `src/server/lib/select-blocks.ts`. Adapter em `src/lib/reading-client.ts`. Front consome ReportJSON via adapter. Alinhado com `docs/architecture.md` secoes 2, 4, 6.

**Tech Stack:** TypeScript strict, Next.js 16 App Router, Vitest, Tailwind v4, Framer Motion.

**Source of truth para textos:** `docs/blocos-resultado.md` — transcrever fielmente, sem inventar ou alterar.

---

## FASE 1: Tipos

### Task 1: Criar hand-attributes.ts

**Files:**
- Create: `src/types/hand-attributes.ts`

**Step 1: Create the types file**

```typescript
// src/types/hand-attributes.ts

export type HeartVariation =
  | 'long_straight' | 'long_curved' | 'long_deep_curved'
  | 'short_straight' | 'short_curved'
  | 'medium_straight' | 'medium_curved'
  | 'faint';

export type HeartModifier =
  | 'fork_end' | 'island' | 'break'
  | 'ends_index' | 'ends_middle' | 'deep';

export type HeadVariation =
  | 'long_straight' | 'long_curved' | 'long_deep_curved'
  | 'short_straight' | 'short_curved'
  | 'medium_straight' | 'medium_curved'
  | 'faint';

export type HeadModifier =
  | 'fork_moon' | 'touches_life' | 'island' | 'break';

export type LifeVariation =
  | 'long_deep' | 'long_faint'
  | 'short_deep' | 'short_faint'
  | 'curved_wide' | 'curved_tight'
  | 'broken_restart' | 'chained';

export type FateVariation =
  | 'present_deep' | 'present_faint'
  | 'broken' | 'multiple'
  | 'late_start' | 'absent';

export type MountKey = 'jupiter' | 'saturn' | 'apollo' | 'mercury' | 'mars' | 'moon';

export type MountState = 'pronounced' | 'normal' | 'flat';

export type RareSignKey =
  | 'star_jupiter' | 'mystic_cross' | 'ring_solomon'
  | 'sun_line' | 'intuition_line' | 'protection_marks';

export interface HandAttributes {
  element: 'fire' | 'water' | 'earth' | 'air';

  heart: {
    variation: HeartVariation;
    modifiers: HeartModifier[];
  };

  head: {
    variation: HeadVariation;
    modifiers: HeadModifier[];
  };

  life: {
    variation: LifeVariation;
  };

  fate: {
    variation: FateVariation;
  };

  venus: {
    mount: 'pronounced' | 'flat';
    cinturao: boolean;
  };

  mounts: Record<MountKey, MountState>;

  rare_signs: Record<RareSignKey, boolean>;

  confidence: number;
}
```

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS (new file, no consumers yet)

**Step 3: Commit**

```
git add src/types/hand-attributes.ts
git commit -m "feat: add HandAttributes types for v2 reading engine"
```

---

### Task 2: Criar blocks.ts

**Files:**
- Create: `src/types/blocks.ts`

**Step 1: Create the types file**

```typescript
// src/types/blocks.ts

export interface TextBlock {
  readonly content: string;
  readonly alt: string;
  readonly alt2: string;
}

export interface LineBlocks {
  readonly opening: TextBlock;
  readonly body_past: TextBlock;
  readonly body_present: TextBlock;
}

export interface MountBlocks {
  readonly intro: TextBlock;
  readonly body: TextBlock;
}

export interface MeasurementSet {
  readonly [field: string]: string;
}
```

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```
git add src/types/blocks.ts
git commit -m "feat: add block shape types for v2 static data"
```

---

### Task 3: Criar report.ts

**Files:**
- Create: `src/types/report.ts`

**Step 1: Create the types file**

```typescript
// src/types/report.ts

export type HandElement = 'fire' | 'water' | 'earth' | 'air';
export type Tier = 'free' | 'premium';
export type SectionKey = 'prologue' | 'heart' | 'head' | 'life' | 'venus' | 'mounts' | 'fate' | 'crossings' | 'compatibility' | 'rare_signs';
export type Accent = 'gold' | 'rose' | 'violet' | 'bone';

export interface ReportJSON {
  opening: string;
  impact_phrase: string;

  element: {
    key: HandElement;
    intro: string;
    body: string;
  };

  portrait: {
    dominant_mount: string;
    lines_detected: string;
    mounts_mapped: string;
    rare_signs_found: string;
    exclusivity: string;
  };

  sections: ReportSection[];

  venus: ReportVenus;

  crossings: ReportCrossing[];
  compatibility: ReportCompat[];
  rare_signs: ReportRareSign[];

  epilogue: string;
}

export interface ReportSection {
  chapter: number;
  key: string;
  title: string;
  label: string;
  icon: string | null;
  accent: Accent;
  tier: Tier;
  opening: string;
  body_past: string;
  body_present: string;
  modifiers: string[];
  measurement: Record<string, string>;
  transition: string;
}

export interface ReportVenus {
  chapter: number;
  title: string;
  label: string;
  accent: 'rose';
  tier: 'premium';
  opening: string;
  body: string;
  cinturao: string | null;
  closing: string;
  measurement: Record<string, string>;
  transition: string;
}

export interface ReportCrossing {
  key: string;
  body: string;
}

export interface ReportCompat {
  key: string;
  pair: string;
  word: string;
  body: string;
}

export interface ReportRareSign {
  key: string;
  name: string;
  body: string;
}

export interface Reading {
  id: string;
  tier: Tier;
  share_token: string;
  share_expires_at: string;
  report: ReportJSON;
  created_at: string;
}
```

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: Errors in files still importing old types from `@/types/reading`. That's expected — we fix them in fase 4.

**Step 3: Commit**

```
git add src/types/report.ts
git commit -m "feat: add ReportJSON types for v2 reading engine"
```

---

## FASE 2A: Blocos de texto

> Pode rodar em PARALELO com Fase 2B.
> Source of truth: `docs/blocos-resultado.md`. Transcrever fielmente. Nenhum texto inventado.
> Manter marcadores `{{name}}`, `{{inteira}}`, etc. intactos.
> Usar `as const` em tudo que e estatico.

### Task 4: section-meta.ts + transitions.ts + impact-phrases.ts + report-opening.ts + epilogue.ts + paywall-teasers.ts

**Files:**
- Create: `src/data/blocks/section-meta.ts`
- Create: `src/data/blocks/transitions.ts`
- Create: `src/data/blocks/impact-phrases.ts`
- Create: `src/data/blocks/report-opening.ts`
- Create: `src/data/blocks/epilogue.ts`
- Create: `src/data/blocks/paywall-teasers.ts`

**Step 1:** Read `docs/blocos-resultado.md` sections 0, 0.1, 1, 2, 14. Transcrever os textos pra TS.

**section-meta.ts:** Copiar exatamente o bloco TypeScript da secao 0.1 do doc. Tipar como `Record<SectionKey, {...}>`.

**transitions.ts:** 10 frases fixas da secao 2. Exportar como `TRANSITIONS` Record com keys como `prologue_to_heart`, `heart_to_paywall`, etc.

**impact-phrases.ts:** 8 frases fixas da secao 1. Exportar como `IMPACT_PHRASES` Record.

**report-opening.ts:** 3 variacoes da secao 0. Exportar como `REPORT_OPENING: TextBlock`.

**epilogue.ts:** 3 variacoes da secao 0. Exportar como `EPILOGUE: TextBlock`.

**paywall-teasers.ts:** 5 frases da secao 14. Exportar como `PAYWALL_TEASERS: readonly string[]`.

**Step 2:** Run `npm run type-check`. Expected: PASS (no consumers yet).

**Step 3:** Commit.

```
git add src/data/blocks/
git commit -m "feat: add section meta, transitions, impact phrases, opening, epilogue, paywall teasers"
```

---

### Task 5: gender-map.ts + measurements.ts

**Files:**
- Create: `src/data/blocks/gender-map.ts`
- Create: `src/data/blocks/measurements.ts`

**Step 1:** gender-map — mapa de substituicao. Listar TODOS os marcadores encontrados no doc (linha 5 do blocos-resultado.md):

```typescript
export const GENDER_MAP = {
  female: {
    '{{inteira}}': 'inteira',
    '{{fria}}': 'fria',
    '{{cirúrgica}}': 'cirúrgica',
    '{{sonhadora}}': 'sonhadora',
    '{{sozinha}}': 'sozinha',
    '{{preparada}}': 'preparada',
    '{{outra}}': 'outra',
    '{{ela}}': 'ela',
    '{{dela}}': 'dela',
    '{{uma}}': 'uma',
    '{{ligada}}': 'ligada',
    '{{quieta}}': 'quieta',
    '{{devastada}}': 'devastada',
    '{{vista}}': 'vista',
    '{{presa}}': 'presa',
    '{{segura}}': 'segura',
    '{{certa}}': 'certa',
    '{{perdida}}': 'perdida',
  },
  male: {
    '{{inteira}}': 'inteiro',
    '{{fria}}': 'frio',
    '{{cirúrgica}}': 'cirúrgico',
    '{{sonhadora}}': 'sonhador',
    '{{sozinha}}': 'sozinho',
    '{{preparada}}': 'preparado',
    '{{outra}}': 'outro',
    '{{ela}}': 'ele',
    '{{dela}}': 'dele',
    '{{uma}}': 'um',
    '{{ligada}}': 'ligado',
    '{{quieta}}': 'quieto',
    '{{devastada}}': 'devastado',
    '{{vista}}': 'visto',
    '{{presa}}': 'preso',
    '{{segura}}': 'seguro',
    '{{certa}}': 'certo',
    '{{perdida}}': 'perdido',
  },
} as const;
```

**measurements.ts:** Secao 13 do doc. 4 tabelas (coracao, cabeca, vida, destino). Exportar como Records tipados por variation key.

```typescript
import type { HeartVariation, HeadVariation, LifeVariation, FateVariation } from '@/types/hand-attributes';
import type { MeasurementSet } from '@/types/blocks';

export const HEART_MEASUREMENTS: Record<HeartVariation, MeasurementSet> = { ... };
export const HEAD_MEASUREMENTS: Record<HeadVariation, MeasurementSet> = { ... };
export const LIFE_MEASUREMENTS: Record<LifeVariation, MeasurementSet> = { ... };
export const FATE_MEASUREMENTS: Record<FateVariation, MeasurementSet> = { ... };
```

**Step 2:** Run type-check. PASS.

**Step 3:** Commit.

```
git add src/data/blocks/gender-map.ts src/data/blocks/measurements.ts
git commit -m "feat: add gender map and measurement data"
```

---

### Task 6: element.ts

**Files:**
- Create: `src/data/blocks/element.ts`

**Step 1:** Transcrever secao 3 do `docs/blocos-resultado.md`. 4 elementos x 3 tipos (impact, intro, body) x 3 variacoes = 36 textos.

Formato:
```typescript
import type { TextBlock } from '@/types/blocks';
import type { HandElement } from '@/types/report';

export const ELEMENT_IMPACT: Record<HandElement, TextBlock> = { ... };
export const ELEMENT_INTRO: Record<HandElement, TextBlock> = { ... };
export const ELEMENT_BODY: Record<HandElement, TextBlock> = { ... };
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

### Task 7: heart.ts

**Files:**
- Create: `src/data/blocks/heart.ts`

**Step 1:** Transcrever secao 4 do doc. 8 variacoes x (opening + body_past + body_present) x 3 = 72 textos de variacoes + 6 modifiers x 3 = 18 textos de modifiers. Total 90.

```typescript
import type { LineBlocks, TextBlock } from '@/types/blocks';
import type { HeartVariation, HeartModifier } from '@/types/hand-attributes';

export const HEART_BLOCKS: Record<HeartVariation, LineBlocks> = { ... };
export const HEART_MODIFIERS: Record<HeartModifier, TextBlock> = { ... };
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

### Task 8: head.ts

**Files:**
- Create: `src/data/blocks/head.ts`

**Step 1:** Secao 5 do doc. 8 variacoes x 3 blocos x 3 = 72 + 4 modifiers x 3 = 12. Total 84.

```typescript
import type { LineBlocks, TextBlock } from '@/types/blocks';
import type { HeadVariation, HeadModifier } from '@/types/hand-attributes';

export const HEAD_BLOCKS: Record<HeadVariation, LineBlocks> = { ... };
export const HEAD_MODIFIERS: Record<HeadModifier, TextBlock> = { ... };
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

### Task 9: life.ts

**Files:**
- Create: `src/data/blocks/life.ts`

**Step 1:** Secao 6 do doc. 8 variacoes x (opening + body_past + body_present) x 3 = 72 textos. Sem modifiers.

```typescript
import type { LineBlocks } from '@/types/blocks';
import type { LifeVariation } from '@/types/hand-attributes';

export const LIFE_BLOCKS: Record<LifeVariation, LineBlocks> = { ... };
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

### Task 10: venus.ts

**Files:**
- Create: `src/data/blocks/venus.ts`

**Step 1:** Secao 7 do doc. venus_opening x 3 + venus_body_pronounced x 3 + venus_body_flat x 3 + cinturao_present x 3 + venus_closing x 3 = 15 textos (+ 3 do cinturao).

```typescript
import type { TextBlock } from '@/types/blocks';

export const VENUS_OPENING: TextBlock = { ... };
export const VENUS_BODY_PRONOUNCED: TextBlock = { ... };
export const VENUS_BODY_FLAT: TextBlock = { ... };
export const VENUS_CINTURAO: TextBlock = { ... };
export const VENUS_CLOSING: TextBlock = { ... };
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

### Task 11: mounts.ts

**Files:**
- Create: `src/data/blocks/mounts.ts`

**Step 1:** Secao 8 do doc. 6 montes x (intro + body) x 3 = 36.

```typescript
import type { MountBlocks } from '@/types/blocks';
import type { MountKey } from '@/types/hand-attributes';

export const MOUNT_BLOCKS: Record<MountKey, MountBlocks> = { ... };
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

### Task 12: fate.ts

**Files:**
- Create: `src/data/blocks/fate.ts`

**Step 1:** Secao 9 do doc. 6 variacoes x (opening + body_past + body_present) x 3 = 54.

```typescript
import type { LineBlocks } from '@/types/blocks';
import type { FateVariation } from '@/types/hand-attributes';

export const FATE_BLOCKS: Record<FateVariation, LineBlocks> = { ... };
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

### Task 13: crossings.ts + compatibility.ts + rare-signs.ts

**Files:**
- Create: `src/data/blocks/crossings.ts`
- Create: `src/data/blocks/compatibility.ts`
- Create: `src/data/blocks/rare-signs.ts`

**Step 1:** Transcrever secoes 10, 11, 12 do doc.

**crossings.ts:** 8 cruzamentos x 3 variacoes = 24.
```typescript
import type { TextBlock } from '@/types/blocks';
export const CROSSING_BLOCKS: Record<string, TextBlock> = { ... };
```
Keys: `heart_straight_x_head_long`, `heart_curved_x_head_short`, `life_wide_x_venus_pronounced`, `fate_deep_x_jupiter`, `head_moon_x_moon_pronounced`, `heart_deep_x_venus_cinturao`, `life_broken_x_fate_late`, `head_touches_life_x_earth`.

**compatibility.ts:** 10 combos x 3 = 30.
```typescript
import type { TextBlock } from '@/types/blocks';

interface CompatBlock {
  pair: string;
  word: TextBlock;  // Palavra-chave: "Faisca", "Vapor" etc (1 so, nao 3 variacoes)
  body: TextBlock;
}

export const COMPAT_BLOCKS: Record<string, CompatBlock> = { ... };
```
Keys: `fire_fire`, `fire_water`, `fire_earth`, `fire_air`, `water_water`, `water_earth`, `water_air`, `earth_earth`, `earth_air`, `air_air`.

**rare-signs.ts:** 6 sinais x 3 = 18.
```typescript
import type { TextBlock } from '@/types/blocks';
import type { RareSignKey } from '@/types/hand-attributes';

interface RareSignBlock {
  name: string;
  body: TextBlock;
}

export const RARE_SIGN_BLOCKS: Record<RareSignKey, RareSignBlock> = { ... };
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

### Task 14: index.ts

**Files:**
- Create: `src/data/blocks/index.ts`

**Step 1:** Re-exportar tudo:

```typescript
export { SECTION_META } from './section-meta';
export { TRANSITIONS } from './transitions';
export { IMPACT_PHRASES } from './impact-phrases';
export { REPORT_OPENING } from './report-opening';
export { EPILOGUE } from './epilogue';
export { PAYWALL_TEASERS } from './paywall-teasers';
export { GENDER_MAP } from './gender-map';
export { HEART_MEASUREMENTS, HEAD_MEASUREMENTS, LIFE_MEASUREMENTS, FATE_MEASUREMENTS } from './measurements';
export { ELEMENT_IMPACT, ELEMENT_INTRO, ELEMENT_BODY } from './element';
export { HEART_BLOCKS, HEART_MODIFIERS } from './heart';
export { HEAD_BLOCKS, HEAD_MODIFIERS } from './head';
export { LIFE_BLOCKS } from './life';
export { VENUS_OPENING, VENUS_BODY_PRONOUNCED, VENUS_BODY_FLAT, VENUS_CINTURAO, VENUS_CLOSING } from './venus';
export { MOUNT_BLOCKS } from './mounts';
export { FATE_BLOCKS } from './fate';
export { CROSSING_BLOCKS } from './crossings';
export { COMPAT_BLOCKS } from './compatibility';
export { RARE_SIGN_BLOCKS } from './rare-signs';
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

```
git add src/data/blocks/index.ts
git commit -m "feat: add blocks barrel export"
```

---

## FASE 2B: Motor de leitura

> Pode rodar em PARALELO com Fase 2A.

### Task 15: selectBlocks + helpers

**Files:**
- Create: `src/server/lib/select-blocks.ts`

**Step 1:** Criar o diretorio e o arquivo.

Run: `mkdir -p src/server/lib`

**Step 2:** Implementar. O arquivo importa de `@/data/blocks` e `@/types/hand-attributes` e `@/types/report`.

Funcao principal: `selectBlocks(attributes, name, gender) → ReportJSON`.

Helpers internos (nao exportados exceto pra teste):
- `pickRandom(block: TextBlock): string` — escolhe content/alt/alt2 aleatoriamente
- `replaceGender(text: string, gender: 'female' | 'male'): string` — aplica GENDER_MAP
- `replaceName(text: string, name: string): string` — substitui `{{name}}`
- `applyReplacements(text: string, name: string, gender: 'female' | 'male'): string` — compoe os dois
- `getDominantMount(mounts: HandAttributes['mounts']): MountKey` — prioridade: jupiter > mercury > apollo > mars > saturn > moon
- `matchCrossings(attributes: HandAttributes): string[]` — retorna keys de cruzamentos ativos
- `getCompatCombos(element: HandElement): string[]` — retorna 4 keys de compatibilidade

Logica de `matchCrossings`: cada crossing key codifica duas condicoes. Exemplo:
- `heart_straight_x_head_long`: heart.variation inclui 'straight' E head.variation inclui 'long'
- `life_wide_x_venus_pronounced`: life.variation === 'curved_wide' E venus.mount === 'pronounced'
- etc.

Implementar como mapa de condicoes, nao como parsing de string.

Logica de `getCompatCombos`: dado element 'fire', retorna ['fire_fire', 'fire_water', 'fire_earth', 'fire_air']. Ordem padrao.

**Step 3:** Type-check. Pode ter erros se fase 2A nao concluiu (imports de blocks). Se paralelo, usar stubs temporarios ou esperar.

**Step 4:** Commit.

```
git add src/server/lib/select-blocks.ts
git commit -m "feat: add selectBlocks reading engine v2"
```

---

## FASE 3: Mocks + Adapter

### Task 16: Mocks de HandAttributes

**Files:**
- Create: `src/mocks/hand-attributes.ts`

**Step 1:** Criar 4 mocks com variacoes diferentes. Basear nos mocks v1 de `build-reading.ts` (fire=Marina, water=Camila, earth=Beatriz, air=Helena) mas adaptando pro schema v2.

| Elemento | Heart | Head | Life | Fate | Venus | Mounts pronunciados | Raros |
|---|---|---|---|---|---|---|---|
| fire | long_straight + [ends_index, deep] | long_curved + [fork_moon] | long_deep | late_start | pronounced, cinturao: true | jupiter, mercury | star_jupiter, mystic_cross |
| water | long_curved + [island] | long_deep_curved + [] | curved_wide | present_faint | pronounced, cinturao: true | moon, saturn | mystic_cross, intuition_line |
| earth | medium_straight + [ends_middle] | short_straight + [break] | curved_wide | late_start | flat, cinturao: false | saturn, jupiter | protection_marks, sun_line |
| air | faint + [fork_end] | long_straight + [touches_life] | long_faint | multiple | flat, cinturao: false | mercury, moon | mystic_cross, intuition_line, ring_solomon |

Todos os mounts nao listados como pronunciados devem ser 'normal' ou 'flat'. Todos os rare_signs nao listados devem ser false. Confidence: 0.85 pra todos.

```typescript
import type { HandAttributes } from '@/types/hand-attributes';
import type { HandElement } from '@/types/report';

export const MOCK_ATTRIBUTES: Record<HandElement, HandAttributes> = { ... };
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

### Task 17: Adapter reading-client.ts

**Files:**
- Create: `src/lib/reading-client.ts` (ja existe como checkout-intent.ts no mesmo dir, entao o dir existe)

**Step 1:** Criar adapter.

```typescript
import { selectBlocks } from '@/server/lib/select-blocks';
import { MOCK_ATTRIBUTES } from '@/mocks/hand-attributes';
import type { HandElement, ReportJSON, Reading } from '@/types/report';

export async function getReading(
  name: string,
  gender: 'female' | 'male',
  element?: HandElement,
): Promise<Reading> {
  const key = element ?? 'fire';
  const attributes = MOCK_ATTRIBUTES[key];
  const report = selectBlocks(attributes, name, gender);
  return {
    id: `mock-${key}-001`,
    tier: 'premium',
    share_token: `${key}-mock-token`,
    share_expires_at: '2026-12-31T00:00:00.000Z',
    report,
    created_at: new Date().toISOString(),
  };
}
```

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

## FASE 4: Adaptar front

> Fase mais delicada. Muitos arquivos mudam de interface.
> Estrategia: primeiro apagar tipos antigos e criar aliases temporarios, depois adaptar componente por componente.

### Task 18: Migrar tipos — apagar v1, atualizar imports

**Files:**
- Delete: `src/types/reading-block.ts`
- Modify: `src/types/reading.ts` — substituir conteudo por re-exports dos novos tipos
- Delete: `src/mocks/build-reading.ts` (depois de task 19)
- Delete: `src/mocks/reading-blocks.json` (depois de task 19)

**Step 1:** Substituir `src/types/reading.ts` por arquivo de compatibilidade que re-exporta dos novos:

```typescript
// src/types/reading.ts
// Backward compat — re-exports from v2 types.
// TODO: remove this file after all imports are updated to @/types/report

export type { HandElement, Tier, Reading, ReportJSON, ReportSection, ReportVenus, ReportCrossing, ReportCompat, ReportRareSign, Accent, SectionKey } from './report';
export type { HandAttributes } from './hand-attributes';
```

Isso permite que os ~20 arquivos que importam de `@/types/reading` continuem compilando enquanto migramos.

**Step 2:** Apagar `src/types/reading-block.ts`.

**Step 3:** Type-check — vai dar muitos erros porque os tipos antigos (ReadingReport, ReadingSection v1, CompatibilityEntry, ReadingStats, MountDetail, LineName, User) nao existem mais. Esses erros guiam as tasks seguintes.

**Step 4:** Commit.

```
git commit -m "refactor: replace v1 reading types with v2 re-exports"
```

---

### Task 19: Criar TransitionLine + VenusSection

**Files:**
- Create: `src/components/reading/TransitionLine.tsx`
- Create: `src/components/reading/VenusSection.tsx`

**TransitionLine:** Componente trivial.

```tsx
interface Props {
  text: string;
}

export default function TransitionLine({ text }: Props) {
  return (
    <div className="py-8 px-4 text-center">
      <p className="font-cormorant italic text-[18px] sm:text-[21px] text-bone-dim leading-[1.4] max-w-md mx-auto">
        {text}
      </p>
    </div>
  );
}
```

**VenusSection:** Extrair do JSX inline de intimidade que existe em `completo/page.tsx` linhas 96-181. Adaptar pra receber `ReportVenus` como prop em vez de `ReadingReport['intimacy']`.

Manter o visual identico (rose glow, corner ornaments, body paragraphs com cigana quote intercalada). Mudar apenas a interface de dados:
- `intimacy.title` → `venus.title`
- `intimacy.subtitle` → `venus.label`
- `intimacy.quote` → `venus.opening`
- `intimacy.body[]` → splittar `venus.body` em paragrafos + `venus.cinturao` como paragrafo extra
- `intimacy.cigana_quotes[]` → `venus.closing` como quote final
- `intimacy.technical[]` → `venus.measurement`

**Step 2:** Type-check. Pode ter erros pendentes — ok.
**Step 3:** Commit.

---

### Task 20: Adaptar componentes de leitura

**Files:**
- Modify: `src/components/reading/ElementHero.tsx`
- Modify: `src/components/reading/ReadingOverview.tsx`
- Modify: `src/components/reading/HandSummary.tsx`
- Modify: `src/components/reading/ReadingSection.tsx`
- Modify: `src/components/reading/TechnicalStrip.tsx`
- Modify: `src/components/reading/BlurredCard.tsx`
- Modify: `src/components/reading/BlurredDeck.tsx`
- Modify: `src/components/reading/CompatibilityGrid.tsx`

Adaptar cada componente pra receber os novos tipos. Mudancas por componente:

**ElementHero:** Props mudam de `element: ReadingReport['element']` pra `element: ReportJSON['element']`, `impactPhrase: string`. O campo `impact` antes vinha dentro de element, agora vem separado como `impact_phrase`. Remover referencia a `element.impact` e usar prop dedicada.

**ReadingOverview:** Remover openings hardcoded por elemento. Receber `opening: string` como prop (vem do ReportJSON.opening). Manter visual identico.

**HandSummary:** Props mudam de `stats: ReadingStats` pra `portrait: ReportJSON['portrait']`. Substituir "Planeta dominante" por "Monte dominante". Renderizar strings humanizadas do portrait em vez de numeros com barras.

**ReadingSection:** Props mudam pra `section: ReportSection` (v2). Substituir `body` + `body_extras` + `cigana_quotes` por `body_past` + `body_present` + `modifiers`. Substituir `technical: string[]` por `measurement: Record<string,string>` passado pro TechnicalStrip adaptado. Remover `impact_phrase` da secao (nao existe mais por secao). Atualizar `lineMeta` pra usar dados de `section` (title, label, accent) em vez de hardcoded.

**TechnicalStrip:** Aceitar `measurement: Record<string,string>` em vez de `items: string[]`. Renderizar como key-value. Manter visual identico (cantinhos ornamentais, header "Medicao da palma", grid com barras).

**BlurredCard:** Simplificar props. Em vez de `line/symbol/planet/teaser`, receber `section: string, teaser: string`. Os 5 teasers vem de PAYWALL_TEASERS, nao das secoes.

**BlurredDeck:** Adaptar cards pra novo BlurredCard.

**CompatibilityGrid:** Converter de grid pra narrativo. Receber `items: ReportCompat[]`. Renderizar como lista de paragrafos em Cormorant italic (voz da cigana), cada combo com pair label em JetBrains + word em Cormorant grande + body em Raleway. Sem grid de 2 colunas. Renomear pra CompatibilityNarrative (ou manter nome e mudar layout).

**Step 2:** Type-check. Deve resolver maioria dos erros.
**Step 3:** Commit.

```
git commit -m "refactor: adapt reading components to v2 ReportJSON interface"
```

---

### Task 21: Adaptar paginas de resultado

**Files:**
- Modify: `src/app/ler/resultado/[id]/page.tsx`
- Modify: `src/app/ler/resultado/[id]/completo/page.tsx`

**[id]/page.tsx (free):**
- Importar `getReading` de `@/lib/reading-client` em vez de `buildMockReading`
- Chamar `getReading(name, 'female', element)` (nome do sessionStorage, gender hardcoded por enquanto)
- Renderizar: ElementHero + HandSummary + ReadingOverview + TransitionLine + ReadingSection(heart) + Paywall (BlurredDeck com PAYWALL_TEASERS) + UpsellSection + ShareButton

**[id]/completo/page.tsx (premium):**
- Mesmo import de `getReading`
- Renderizar na ordem v2:
  ```
  ElementHero + HandSummary
  ReportOpening (ReadingOverview adaptado)
  TransitionLine(prologue_to_heart)
  ReadingSection(heart)
  TransitionLine(heart_to_paywall)
  ReadingSection(head)
  TransitionLine(head_to_life)
  ReadingSection(life)
  TransitionLine(life_to_venus)
  VenusSection
  TransitionLine(venus_to_mounts)
  Mount cards (loop, reaproveitando JSX inline existente)
  TransitionLine(mounts_to_fate)
  ReadingSection(fate)
  TransitionLine(fate_to_crossings)
  Crossing cards (loop, reaproveitando JSX inline existente)
  TransitionLine(crossings_to_compat)
  CompatibilityNarrative
  TransitionLine(compat_to_rare)
  RareSign cards (loop, se existirem)
  Epilogue
  ShareButton + "Ler outra mao"
  ```
- Remover secao "Na cama" (absorvida por VenusSection)
- Remover "Planeta dominante" do HandSummary (ja feito na task 20)
- Remover qualquer ocorrencia de "Na quiromancia classica" (se existir em textos hardcoded)

**Step 2:** Type-check + build. Pode ter erros em outras paginas (compartilhar, conta/leituras) que importam tipos antigos — resolver com stubs minimos.

**Step 3:** Commit.

```
git commit -m "refactor: wire v2 reading engine to result pages"
```

---

### Task 22: Adaptar paginas secundarias

**Files:**
- Modify: `src/app/compartilhar/[token]/page.tsx`
- Modify: `src/app/conta/leituras/page.tsx`
- Modify: `src/app/conta/leituras/[id]/page.tsx`
- Modify: `src/components/reading/ResultStateSwitcher.tsx`
- Modify: `src/hooks/useAuth.ts` (se importa tipos antigos)

Essas paginas importam de `@/types/reading` e usam `buildMockReading`. Adaptar pra novos tipos. Pode ser simples (so mudar import e ajustar campos) ou precisar de stubs (a pagina de conta/leituras pode precisar de um mock de lista de readings).

`ResultStateSwitcher`: so importa `HandElement`, que ja existe no novo report.ts. Mudar import de `@/types/reading` pra `@/types/report`.

**Step 2:** Type-check. PASS.
**Step 3:** Commit.

---

### Task 23: Limpar arquivos v1

**Files:**
- Delete: `src/mocks/build-reading.ts`
- Delete: `src/mocks/reading-blocks.json`
- Modify: `src/types/reading.ts` — apagar o arquivo inteiro (todos os imports ja apontam pra report.ts)
- Delete: `src/types/reading-block.ts` (se nao apagou na task 18)

**Step 1:** Verificar que NENHUM arquivo importa dos deletados: `grep -r "reading-block\|build-reading\|reading-blocks" src/`.

**Step 2:** Apagar.
**Step 3:** Type-check + build. PASS.
**Step 4:** Commit.

```
git commit -m "chore: remove v1 reading types, mocks, and blocks JSON"
```

---

## FASE 5: Validacao

### Task 24: Teste de integridade dos blocos

**Files:**
- Create: `src/data/blocks/__tests__/blocks-integrity.test.ts`

**Step 1:** Escrever testes:

```typescript
import { describe, it, expect } from 'vitest';
import { GENDER_MAP } from '../gender-map';
// import all block files...

describe('blocks integrity', () => {
  it('all gender markers in texts exist in GENDER_MAP', () => {
    const allTexts = collectAllTexts(); // helper que extrai todos os strings dos blocos
    const markerRegex = /\{\{(\w+)\}\}/g;
    const femaleKeys = new Set(Object.keys(GENDER_MAP.female));

    for (const text of allTexts) {
      let match;
      while ((match = markerRegex.exec(text)) !== null) {
        const marker = `{{${match[1]}}}`;
        if (marker === '{{name}}') continue;
        expect(femaleKeys.has(marker), `Marker ${marker} not found in GENDER_MAP. Text: "${text.slice(0, 60)}..."`).toBe(true);
      }
    }
  });

  it('no em dashes in any text', () => {
    const allTexts = collectAllTexts();
    for (const text of allTexts) {
      expect(text.includes('—'), `Em dash found: "${text.slice(0, 80)}..."`).toBe(false);
    }
  });

  it('no empty content/alt/alt2', () => {
    const allBlocks = collectAllTextBlocks();
    for (const block of allBlocks) {
      expect(block.content.length).toBeGreaterThan(0);
      expect(block.alt.length).toBeGreaterThan(0);
      expect(block.alt2.length).toBeGreaterThan(0);
    }
  });
});
```

**Step 2:** Run tests.

Run: `npm run test -- src/data/blocks/__tests__/blocks-integrity.test.ts`
Expected: PASS

**Step 3:** Commit.

```
git commit -m "test: add blocks integrity validation"
```

---

### Task 25: Build + smoke test

**Step 1:** Run full checks.

```bash
npm run type-check
npm run lint
npm run build
npm run test
```

All must PASS.

**Step 2:** Start dev server and manually verify:

```bash
npm run dev
```

- Navigate to `/ler/resultado/fire?element=fire` — relatorio completo com textos dos blocos
- Navigate to `/ler/resultado/fire?element=water` — relatorio DIFERENTE do fire
- Reload page — textos podem mudar (variacoes alt/alt2 randomizadas)
- Verificar ordem v2 das secoes
- Verificar "Monte dominante" (nao "Planeta dominante")
- Verificar compatibilidade narrativa (nao grid)
- Verificar zero travessoes nos textos renderizados
- Verificar zero "Na quiromancia classica"

**Step 3:** Final commit.

```
git commit -m "chore: v2 reading engine complete — 515 blocks, motor, adapted front"
```

---

## Arquivos afetados (resumo)

**Criar (~25 arquivos):**
- `src/types/hand-attributes.ts`
- `src/types/blocks.ts`
- `src/types/report.ts`
- `src/data/blocks/` (18 arquivos)
- `src/server/lib/select-blocks.ts`
- `src/mocks/hand-attributes.ts`
- `src/lib/reading-client.ts`
- `src/components/reading/TransitionLine.tsx`
- `src/components/reading/VenusSection.tsx`
- `src/data/blocks/__tests__/blocks-integrity.test.ts`

**Modificar (~15 arquivos):**
- `src/types/reading.ts` (vira re-export temporario, depois apagado)
- `src/components/reading/ElementHero.tsx`
- `src/components/reading/ReadingOverview.tsx`
- `src/components/reading/HandSummary.tsx`
- `src/components/reading/ReadingSection.tsx`
- `src/components/reading/TechnicalStrip.tsx`
- `src/components/reading/BlurredCard.tsx`
- `src/components/reading/BlurredDeck.tsx`
- `src/components/reading/CompatibilityGrid.tsx`
- `src/components/reading/ResultStateSwitcher.tsx`
- `src/app/ler/resultado/[id]/page.tsx`
- `src/app/ler/resultado/[id]/completo/page.tsx`
- `src/app/compartilhar/[token]/page.tsx`
- `src/app/conta/leituras/page.tsx`
- `src/app/conta/leituras/[id]/page.tsx`

**Apagar (~4 arquivos):**
- `src/types/reading-block.ts`
- `src/types/reading.ts` (eventual)
- `src/mocks/build-reading.ts`
- `src/mocks/reading-blocks.json`
