---
status: investigating
trigger: "element-concept-ux - O relatório inicia com a identificação do elemento natural sem contexto educativo prévio"
created: 2026-04-17T00:00:00Z
updated: 2026-04-17T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED. The flow has zero educational moment about the 4-element system. The cigana announces the element in ElementHero as if the user already knows what "Fogo" means in this context. The element body text explains the personality, but the framework (why 4 elements, what hand shape has to do with it) is never established.
test: COMPLETE - all relevant files read
expecting: n/a
next_action: Write diagnosis

## Symptoms

expected: User should understand, before the report, that there is a symbolic logic and that the natural element is the base of the reading
actual: Report starts directly with the element (Fire/Water/Earth/Air) without prior explanation
errors: None - this is a UX improvement investigation
reproduction: Complete reading flow and arrive at result page
started: Always been this way - design gap

## Eliminated

- hypothesis: Educational context might exist somewhere in the scan page
  evidence: Scan page shows only 5 rotating cigana phrases ("Vejo uma linha forte aqui...", "Seu coração fala mais alto que você...", etc.) — all about lines/heart, zero mention of elements or the 4-element framework
  timestamp: 2026-04-17

- hypothesis: Revelação page might introduce the element concept
  evidence: Revelação page shows ONLY the impact phrase (e.g., "Você carrega mais do que mostra.") and a "Continuar" button. Zero element context. The phrase is from IMPACT_PHRASES keyed by element+heartTag but does not mention or introduce the element concept. It is a personality revelation, not a framework intro.
  timestamp: 2026-04-17

- hypothesis: The ElementHero component might explain the element framework before naming the element
  evidence: ElementHero opens directly with cigana's line e.g. "Suas mãos queimam, Maria. Eu sei antes de olhar que seu elemento é" → MASSIVE "Fogo" heading. No prior explanation of what the 4-element system is, why it matters, or what hand shape tells us. The framework is assumed known.
  timestamp: 2026-04-17

- hypothesis: The HandSummary component (completo page only) might provide context
  evidence: HandSummary shows "Retrato da mão" — technical metrics (Linhas: 4/4, Montes: 3/8, Sinais Raros: 1/9) plus exclusivity stat (e.g., "18% das mãos que eu já li são Fogo"). This appears ONLY on the premium/completo page. The free result page does NOT have HandSummary. Metrics are technical, not explanatory.
  timestamp: 2026-04-17

- hypothesis: The ReadingOverview (element body + intro) might set context
  evidence: ReadingOverview receives opening (generic cigana line), elementIntro (e.g., "Fogo. Palma quadrada. Dedos curtos. Isso é Fogo."), and elementBody (detailed personality). The elementIntro line IS a brief technical nod to hand shape, but it's inside the report card (after element reveal), written as a pronouncement, not an explanation. It's "Palma quadrada. Dedos curtos. Isso é Fogo." — the cigana declaring, not educating.
  timestamp: 2026-04-17

## Evidence

- timestamp: 2026-04-17
  checked: /ler/scan page
  found: Only PHRASES array with 5-6 cigana lines about lines/heart. No element concept.
  implication: Scan is a ritual loading screen, not an educational moment.

- timestamp: 2026-04-17
  checked: /ler/revelacao page
  found: Single tarot-card style reveal of the impact_phrase via typewriter, then "Continuar". The phrase is derived from element+heart combo (e.g., IMPACT_PHRASES["fire_heart_straight"]) but does NOT name or explain the element.
  implication: Revelação is purely emotional/dramatic. It builds suspense but gives zero conceptual framework.

- timestamp: 2026-04-17
  checked: ElementHero component (used in both free and completo result pages)
  found: Opening cigana line → MASSIVE element name heading. The structure assumes the user knows Fire/Water/Earth/Air is a palmistry concept based on hand shape. The cigana says "eu sei antes de olhar" but never says WHAT she's looking at (hand shape proportions) or WHY that maps to an element.
  implication: The emotional reveal works, but the user who doesn't already know about classical palmistry elements will be confused. "Why is my hand Fire?" is unanswered.

- timestamp: 2026-04-17
  checked: element.ts data blocks (ELEMENT_INTRO, ELEMENT_BODY, ELEMENT_IMPACT)
  found: ELEMENT_INTRO = "Fogo. Palma quadrada. Dedos curtos. Isso é Fogo." — brief technical declaration. ELEMENT_BODY = rich personality description (100+ words). These are raw text blocks that go into ReadingOverview after the hero reveal.
  implication: ELEMENT_INTRO technically names the physical evidence (palm shape + finger length) but only after the user has already seen the element name in giant Cinzel type. It functions as confirmation, not introduction.

- timestamp: 2026-04-17
  checked: ReadingOverview component layout
  found: Order is: eyebrow "O que eu vi na sua mão" → opening (cigana generic line) → elementIntro → elementBody. This is the first card in the report scroll. It is the closest thing to educational context in the current flow.
  implication: ReadingOverview is the natural insertion point. The elementIntro line sits right where context would live. It just needs to do more work.

- timestamp: 2026-04-17
  checked: Free result page (/ler/resultado/[id])
  found: Layout is ElementHero → ReadingOverview → ReadingSection(heart) → paywall teasers → BlurredDeck → UpsellSection. NO HandSummary.
  implication: Free users (the majority who will share to Instagram) see element name with zero contextual framing, then a personality paragraph that confirms the element but doesn't explain the system.

- timestamp: 2026-04-17
  checked: Premium/completo result page
  found: Layout is ElementHero → HandSummary → ReadingOverview → sections. HandSummary shows "X% das mãos que eu já li são Fogo" which is the ONLY statistic that contextualizes scarcity/identity of the element. But again it appears AFTER the reveal, and only for premium users.
  implication: The element exclusivity line is the strongest existing signal about "why this element" but it's premium-only and post-reveal.

## Resolution

root_cause: The 4-element framework (Fire/Water/Earth/Air based on hand shape proportions) is never introduced in the user flow. The cigana announces the element as a revelation ("I knew before looking"), but the logic connecting hand shape → element → personality is invisible to the user. The ElementHero component drops the giant element name with no prior framing. The ELEMENT_INTRO line in ReadingOverview names the physical evidence ("Palma quadrada. Dedos curtos.") but comes after the dramatic reveal, not before it, and reads as a declaration rather than a contextual bridge. Result: users who don't know palmistry traditions will ask "why am I Fire? what does that mean?"

fix: (investigation only — no code changes made)
verification:
files_changed: []
