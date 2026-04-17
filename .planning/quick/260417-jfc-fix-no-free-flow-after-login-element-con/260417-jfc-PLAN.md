---
phase: quick
plan: 260417-jfc
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/ler/nome/page.tsx
  - src/app/ler/scan/page.tsx
  - src/app/ler/revelacao/page.tsx
  - src/data/blocks/element.ts
  - src/lib/storage-keys.ts
autonomous: true
must_haves:
  truths:
    - "Logged-in user with 0 credits and reading_count > 0 sees two buttons: free reading and buy credits"
    - "Free reading button navigates to /ler/toque (same path as first-reading flow)"
    - "Buy credits button navigates to /creditos"
    - "Cigana message appears in the no-credits state"
    - "Revelacao page shows a bridge line about element after impact phrase typewriter completes"
    - "Element bridge line fades in below the card after the Continuar button appears"
    - "ELEMENT_INTRO entries connect hand shape to element name with cigana personality"
  artifacts:
    - path: "src/app/ler/nome/page.tsx"
      provides: "no_credits bifurcation state with two buttons"
    - path: "src/app/ler/scan/page.tsx"
      provides: "element stored in sessionStorage from API response"
    - path: "src/app/ler/revelacao/page.tsx"
      provides: "bridge line priming element concept"
    - path: "src/data/blocks/element.ts"
      provides: "expanded ELEMENT_INTRO copy connecting shape to element"
  key_links:
    - from: "src/app/ler/scan/page.tsx"
      to: "sessionStorage maosfalam_element"
      via: "sessionStorage.setItem after API response"
      pattern: "sessionStorage\\.setItem.*element"
    - from: "src/app/ler/revelacao/page.tsx"
      to: "sessionStorage maosfalam_element"
      via: "sessionStorage.getItem to read element"
      pattern: "sessionStorage\\.getItem.*element"
---

<objective>
Fix the no-free-flow-after-login bug and implement element concept UX improvements (Option A+C).

Purpose: Logged-in users with 0 credits are currently redirected to /creditos with no free reading option. This blocks a core flow defined in screens.md. Additionally, the element concept (Fire/Water/Earth/Air) appears without prior framing, confusing users unfamiliar with palmistry.

Output: Fixed nome page with two-button no_credits state, revelacao bridge line priming element concept, expanded ELEMENT_INTRO copy.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/ler/nome/page.tsx
@src/app/ler/scan/page.tsx
@src/app/ler/revelacao/page.tsx
@src/data/blocks/element.ts
@src/lib/storage-keys.ts
@docs/screens.md
@docs/brand-voice.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix no-credits bifurcation in /ler/nome + store element in scan</name>
  <files>src/app/ler/nome/page.tsx, src/app/ler/scan/page.tsx, src/lib/storage-keys.ts</files>
  <action>
**Bug fix in src/app/ler/nome/page.tsx:**

1. Add state: `const [showNoCreditsBifurcation, setShowNoCreditsBifurcation] = useState(false);`

2. In `handleLoggedInSubmit`, replace the block at lines 169-173:
```typescript
// OLD:
if (balance === 0) {
  router.push("/creditos");
  return;
}
```
With:
```typescript
if (balance === 0) {
  setShowNoCreditsBifurcation(true);
  return;
}
```

3. Add a new handler `handleFreeReading` that does the same thing as the reading_count === 0 path (lines 149-166): builds ReadingContext with current form state, saves sessionStorage keys, navigates to /ler/toque. Extract the shared navigation logic into a helper function `navigateToReading()` to avoid duplicating the sessionStorage + ReadingContext + router.push logic across three places (first reading, free reading, has-credits). The helper takes the current form values (trimmedName, gender, dominantHand, isSelf) and handles sessionId generation, sessionStorage writes, ReadingContext save, and navigation.

4. In the logged-in form JSX (around line 522-529), replace the single "Continuar" Button with a conditional:
- When `showNoCreditsBifurcation` is false: show the existing "Continuar" button
- When `showNoCreditsBifurcation` is true: show:
  - Cigana message in Cormorant italic: "Voce precisa de creditos pra uma leitura completa. A free ainda e sua."
  - Two buttons side by side in a flex row with gap-3:
    - "Leitura free" (variant="primary") calls handleFreeReading
    - "Comprar creditos" (variant="secondary") navigates to /creditos
  - Reset showNoCreditsBifurcation to false if user changes form inputs (name, isSelf toggle) by adding `setShowNoCreditsBifurcation(false)` to setName onChange and handleIsSelfToggle

Brand voice: The cigana message "Voce precisa de creditos pra uma leitura completa. A free ainda e sua." follows screens.md spec exactly. No hedging, second person, no em dashes.

**Element storage in src/app/ler/scan/page.tsx:**

5. In the `.then()` handler (line 78-81), after `sessionStorage.setItem(STORAGE_KEYS.reading_tier, tier ?? "free")`, add:
```typescript
const element = report.element?.key;
if (element) {
  sessionStorage.setItem(STORAGE_KEYS.element, element);
}
```
This extracts the element key (fire/water/earth/air) from `report.element.key` (type: `HandElement` defined in `src/types/report.ts`) and stores it for the revelacao page.

**Storage key in src/lib/storage-keys.ts:**

6. Add `element: "maosfalam_element"` to the STORAGE_KEYS object. Currently missing from the file.
  </action>
  <verify>
    <automated>cd /Users/luana/Documents/Code\ Projects/Paritech\ projs/MaosFalam && npm run type-check && npm run build</automated>
  </verify>
  <done>
- Logged-in user with reading_count > 0 and balance === 0 sees cigana message + two buttons instead of being redirected
- "Leitura free" button navigates to /ler/toque with full ReadingContext
- "Comprar creditos" button navigates to /creditos
- Scan page stores element key in sessionStorage after API response
- Type-check and build pass
  </done>
</task>

<task type="auto">
  <name>Task 2: Revelacao bridge line + expanded ELEMENT_INTRO copy</name>
  <files>src/app/ler/revelacao/page.tsx, src/data/blocks/element.ts</files>
  <action>
**Bridge line in src/app/ler/revelacao/page.tsx:**

1. In the useEffect that reads sessionStorage (lines 29-37), also read the element key:
```typescript
const element = sessionStorage.getItem(STORAGE_KEYS.element);
```
Store it in a new state variable `const [hasElement, setHasElement] = useState(false);` (set to true if element exists in sessionStorage). Import STORAGE_KEYS if not already imported.

2. Add a new state `const [showBridge, setShowBridge] = useState(false);`

3. In the useEffect that fires when `complete` becomes true (lines 60-63), after the 1400ms delay that shows the button, add a second setTimeout at ~2000ms that sets `setShowBridge(true)` IF hasElement is true.

4. Add the bridge line below the "Continuar" button container (after the `<div className="relative h-12...">` block, around line 365), as a new AnimatePresence block:
```tsx
<AnimatePresence>
  {showBridge && (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 0.7, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="font-cormorant italic text-[15px] sm:text-[17px] text-bone-dim text-center max-w-[280px] leading-[1.4]"
    >
      Eu li sua palma antes de qualquer coisa. A forma da sua mao ja me contou o que eu precisava.
    </motion.p>
  )}
</AnimatePresence>
```

The bridge line is deliberately vague. It does NOT name the element (user hasn't seen it yet). It primes the concept that hand SHAPE matters. Uses cigana voice, second person, no hedging, no em dashes. Use proper accents matching the codebase style (e.g., "mao" should be "mao" without accent since the existing revelacao page text does not use accents consistently -- check the file and match).

**Expanded ELEMENT_INTRO in src/data/blocks/element.ts:**

5. Replace the ELEMENT_INTRO record with expanded versions that connect hand shape to element name with personality punch. Each entry keeps the physical evidence (palm shape, finger length) but adds a "what it means" sentence in cigana voice. IMPORTANT: The existing file uses proper Portuguese accents (e.g., "flexiveis" with accent as "flexíveis", "proporcionais"). Match exactly.

New ELEMENT_INTRO values:

fire:
- content: "Palma quadrada. Dedos curtos. Mão de Fogo. Você age antes de pensar, e o mundo gira na sua direção por causa disso."
- alt: "Palma larga. Dedos que não perdem tempo. Fogo puro. Isso significa que você não espera. Nunca esperou."
- alt2: "Quadrada, compacta, sem enrolação. Mão de Fogo. Quem tem essa mão não pede licença pra entrar."

water:
- content: "Palma longa. Dedos longos e flexíveis. Mão de Água. Você sente o que os outros nem registram, e isso é sua potência e seu peso."
- alt: "Mão longa, dedos que parecem dançar. Água na forma. Tudo te atravessa. Tudo fica."
- alt2: "Palma fina, comprida, dedos articulados. Mão de Água. Sua sensibilidade não é fraqueza. É radar."

earth:
- content: "Palma grande e quadrada. Dedos proporcionais. Mão de Terra. Você constrói em silêncio o que os outros só planejam."
- alt: "Palma larga, firme, dedos sólidos. Terra pura. Suas raízes são fundas. Quando decide ficar, fica."
- alt2: "Mão que parece feita pra segurar peso. Terra. As pessoas confiam em você sem saber por quê."

air:
- content: "Palma quadrada. Dedos longos. Mão de Ar. Sua cabeça trabalha em camadas que os outros nem percebem."
- alt: "Palma compacta, dedos compridos e articulados. Ar. Você entende rápido. Rápido demais, às vezes."
- alt2: "Dedos que gesticulam. Palma quadrada. Mente de Ar. Você já está cinco passos na frente. O problema é que lá é solitário."
  </action>
  <verify>
    <automated>cd /Users/luana/Documents/Code\ Projects/Paritech\ projs/MaosFalam && npm run type-check && npm run build</automated>
  </verify>
  <done>
- Revelacao page shows a subtle bridge line below the card after impact phrase completes, priming the element concept
- Bridge line only appears if element was stored in sessionStorage (graceful degradation)
- ELEMENT_INTRO entries now connect physical evidence (palm shape, finger length) to element name with a personality punchline in cigana voice
- All copy follows brand voice rules: second person, no hedging, no em dashes, no tech words, no esoteric cliches
- Type-check and build pass
  </done>
</task>

</tasks>

<verification>
1. `npm run type-check` passes
2. `npm run build` passes
3. `npm run lint` passes
4. Manual check: logged-in user with 0 credits sees bifurcation UI (requires staging test)
</verification>

<success_criteria>
- Bug fixed: logged-in users with 0 credits see "Leitura free" and "Comprar creditos" buttons
- Element concept primed via revelacao bridge line before result page
- ELEMENT_INTRO copy expanded to connect shape to element with personality
- All user-facing text follows brand voice (cigana, second person, no hedging, no em dashes)
- Build and type-check pass clean
</success_criteria>

<output>
After completion, create `.planning/quick/260417-jfc-fix-no-free-flow-after-login-element-con/260417-jfc-SUMMARY.md`
</output>
