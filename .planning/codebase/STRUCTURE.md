# Codebase Structure

**Analysis Date:** 2026-04-10

## Directory Layout

```
MaosFalam/
├── src/
│   ├── app/                           # Next.js App Router routes
│   │   ├── api/                       # HTTP API routes
│   │   ├── ler/                       # Reading flow pages (/ler/toque, /ler/nome, /ler/camera, etc.)
│   │   ├── conta/                     # Authenticated area (/conta/leituras, /conta/perfil)
│   │   ├── login/ registro/           # Auth pages
│   │   ├── creditos/                  # Credit purchase page
│   │   ├── compartilhar/              # Public reading share link
│   │   ├── manifesto/ lp-venda/       # Static pages
│   │   ├── preview/                   # Dev playground (NOT in production)
│   │   ├── tarot/                     # Tarot experience
│   │   ├── layout.tsx                 # Root layout (Clerk, fonts, providers)
│   │   ├── page.tsx                   # Home / landing
│   │   ├── error.tsx                  # Global error boundary
│   │   ├── not-found.tsx              # 404 handler
│   │   └── globals.css                # Global styles (Tailwind)
│   │
│   ├── components/                    # React components (no logic, props only)
│   │   ├── ui/                        # Design system primitives (Button, Input, Card, Badge, Toast, etc.)
│   │   ├── landing/                   # Landing page components (Hero, Nav, LunarClock, EdisonLamp, Smoke, etc.)
│   │   ├── reading/                   # Reading display (ReadingSection, ElementSection, LineGlyph, TechnicalStrip, BlurredCard, etc.)
│   │   ├── camera/                    # Camera flow (CameraViewport, MethodChoice, CameraErrorState, UploadPreview, etc.)
│   │   ├── account/                   # Authenticated area components
│   │   ├── tarot/                     # Tarot components (TarotCard, TarotShareCard)
│   │   └── lp-venda/                  # Sales LP components (Hero, ComoFunciona, Credibilidade, Depoimentos, FAQ, etc.)
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.ts                 # User session state (localStorage sync)
│   │   ├── useCameraPipeline.ts       # Camera state machine + MediaPipe
│   │   ├── useMock.ts                 # Mock/real fetcher transition
│   │   └── useStoredName.ts           # Session name storage
│   │
│   ├── lib/                           # Client-side adapters (thin API wrappers)
│   │   ├── reading-client.ts          # captureReading, getReading, registerLead, requestNewReading
│   │   ├── payment-client.ts          # requestPayment, getCheckoutIntent
│   │   ├── user-client.ts             # User profile, readings list, credits
│   │   ├── checkout-intent.ts         # Payment checkout setup
│   │   └── personalize.ts             # Text personalization helpers
│   │
│   ├── server/                        # Server-side business logic
│   │   └── lib/
│   │       ├── select-blocks.ts       # Reading engine: HandAttributes → ReportJSON
│   │       ├── openai.ts              # GPT-4o wrapper (analyzeHand)
│   │       ├── abacatepay.ts          # Payment provider integration
│   │       ├── resend.ts              # Email provider integration
│   │       ├── rate-limit.ts          # In-memory rate limiter
│   │       ├── auth.ts                # Clerk auth helpers
│   │       ├── prisma.ts              # Prisma client singleton
│   │       └── logger.ts              # Pino logger
│   │
│   ├── data/                          # Static content blocks
│   │   ├── blocks/                    # Reading text by line/axis
│   │   │   ├── index.ts               # Exports all blocks
│   │   │   ├── element.ts             # Element intro/body/impact
│   │   │   ├── heart.ts               # Heart line blocks
│   │   │   ├── head.ts                # Head line blocks
│   │   │   ├── life.ts                # Life line blocks
│   │   │   ├── fate.ts                # Fate line blocks
│   │   │   ├── venus.ts               # Venus mount + cinturão
│   │   │   ├── mounts.ts              # Other mounts (Jupiter, Saturn, etc.)
│   │   │   ├── rare-signs.ts          # Rare sign blocks
│   │   │   ├── crossings.ts           # Crossing/modifier blocks
│   │   │   ├── compatibility.ts       # Compatibility pairs
│   │   │   ├── gender-map.ts          # Gender marker replacements
│   │   │   ├── transitions.ts         # Transition phrases
│   │   │   ├── impact-phrases.ts      # Impact phrases (share card)
│   │   │   ├── epilogue.ts            # Reading close
│   │   │   ├── paywall-teasers.ts     # Upsell teasers
│   │   │   ├── measurements.ts        # Technical line measurements
│   │   │   ├── report-opening.ts      # Report intro
│   │   │   └── section-meta.ts        # Section titles/meta
│   │   │
│   │   └── credit-packs.ts            # Paid package definitions
│   │
│   ├── types/                         # TypeScript contracts
│   │   ├── reading.ts                 # Reading, ReadingSection, User
│   │   ├── report.ts                  # ReportJSON, ReportSection
│   │   ├── hand-attributes.ts         # HandAttributes, HeartVariation, MountState, etc.
│   │   ├── reading-block.ts           # ReadingBlock (old schema, maybe deprecated)
│   │   ├── blocks.ts                  # TextBlock, LineBlocks, MeasurementSet
│   │   ├── camera.ts                  # CamState enum, camera constants
│   │   └── tarot.ts                   # Tarot types
│   │
│   ├── mocks/                         # Mock JSON data
│   │   ├── build-reading.ts           # Mock reading builder function
│   │   └── reading-blocks.json        # (legacy) Old reading blocks format
│   │
│   ├── generated/                     # Generated files (Prisma types)
│   │   └── prisma/
│   │
│   ├── middleware.ts                  # Clerk auth middleware (protects /conta, /api/user/*, etc.)
│   ├── proxy.ts                       # (Utility function, unclear purpose)
│   └── globals.css                    # Global Tailwind + CSS variable setup
│
├── prisma/
│   └── schema.prisma                  # Database schema (not shown, but referenced)
│
├── public/                            # Static assets (favicons, manifesto.html, etc.)
├── .github/                           # GitHub Actions CI/CD
├── .husky/                            # Git hooks
├── package.json                       # Dependencies (Next.js, Tailwind, Clerk, Prisma, Vitest)
├── tsconfig.json                      # TypeScript config (strict: true, paths alias @/*)
├── vitest.config.ts                   # Vitest test runner config
├── eslint.config.mjs                  # ESLint rules (no-console: error)
├── .prettierrc.json                   # Prettier formatting rules
├── .prettierignore                    # Prettier exclude paths
└── tailwind.config.ts                 # Tailwind v4 configuration
```

## Directory Purposes

**src/app:**

- Purpose: Next.js App Router pages and API routes. Defines all HTTP endpoints and page tree.
- Contains: Page components (page.tsx), layouts (layout.tsx), error boundaries (error.tsx), API route handlers (route.ts)
- Key files: `app/layout.tsx` (root), `app/page.tsx` (home), `app/api/reading/capture/route.ts` (main API), `app/ler/**` (reading flow)

**src/components:**

- Purpose: Presentational React components. Receives props, renders UI, emits user actions via callbacks. No data fetching, no business logic.
- Contains: Organized by domain (ui, landing, reading, camera, etc.). Each file = 1 component responsibility.
- Key files: `components/ui/Button.tsx`, `components/reading/ReadingSection.tsx`, `components/camera/CameraViewport.tsx`

**src/hooks:**

- Purpose: Custom React hooks for state management and side effects.
- Contains: useAuth (auth state), useCameraPipeline (camera FSM), useMock (mock/real data transition), useStoredName (session name)
- Key files: `hooks/useAuth.ts`, `hooks/useCameraPipeline.ts`

**src/lib:**

- Purpose: Client-side adapter layer. Wraps fetch() calls to API routes; encapsulates HTTP details.
- Contains: Async functions that return typed promises
- Key files: `lib/reading-client.ts` (captureReading, getReading, etc.), `lib/payment-client.ts`, `lib/user-client.ts`

**src/server/lib:**

- Purpose: Server-side business logic. Core algorithms, external service integration, database interaction.
- Contains: Pure functions and service wrappers, never called directly by components
- Key files: `server/lib/select-blocks.ts` (reading engine), `server/lib/openai.ts`, `server/lib/rate-limit.ts`

**src/data/blocks:**

- Purpose: Static content. Reading text blocks organized by line/axis. Content is hardcoded, not from database (in MVP).
- Contains: TypeScript objects exporting TextBlock arrays indexed by variation
- Key files: `data/blocks/heart.ts`, `data/blocks/head.ts`, `data/blocks/index.ts` (main export)

**src/types:**

- Purpose: TypeScript interfaces shared across all layers. Single source of truth for data contracts.
- Contains: Type definitions, enums, interfaces
- Key files: `types/reading.ts` (Reading, ReadingSection), `types/hand-attributes.ts` (HandAttributes), `types/camera.ts` (CamState)

**src/mocks:**

- Purpose: Mock data for development/testing. Loaded via `useMock()` hook when NODE_ENV=development.
- Contains: JSON mock files and builder functions
- Key files: `mocks/build-reading.ts`, `mocks/reading-blocks.json` (legacy)

## Key File Locations

**Entry Points:**

- **Web app root:** `src/app/layout.tsx` — Sets up ClerkProvider, fonts, global providers (ToastProvider, OfflineDetector)
- **Home page:** `src/app/page.tsx` — Renders HomeLanding component
- **Reading flow start:** `src/app/ler/toque/page.tsx` (touch trigger) or `/ler/nome/page.tsx` (direct entry for loggedIN)
- **API capture endpoint:** `src/app/api/reading/capture/route.ts` — Receives photo, returns report
- **Auth middleware:** `src/middleware.ts` — Clerk auth guard for protected routes

**Core Logic:**

- **Reading generation:** `src/server/lib/select-blocks.ts` — Accepts HandAttributes, outputs ReportJSON
- **OpenAI wrapper:** `src/server/lib/openai.ts` — Sends photo to GPT-4o, parses response to HandAttributes
- **Camera state machine:** `src/hooks/useCameraPipeline.ts` — Manages CamState transitions via MediaPipe
- **Client adapters:** `src/lib/reading-client.ts`, `src/lib/payment-client.ts`, `src/lib/user-client.ts`

**UI Components:**

- **Landing:** `src/components/landing/HomeLanding.tsx` + subs (Hero, Nav, EdisonLamp, LunarClock, Smoke, Constellation, etc.)
- **Reading display:** `src/components/reading/ReadingSection.tsx` (line display), `src/components/reading/ResultStateSwitcher.tsx` (tier toggle)
- **Camera pipeline:** `src/components/camera/CameraViewport.tsx` (video feed), `src/components/camera/CameraFeedback.tsx` (state messages)
- **Design system:** `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/Toast.tsx`, `src/components/ui/Input.tsx`, etc.

**Data/Content:**

- **Reading blocks (heart):** `src/data/blocks/heart.ts` — Text for all heart line variations (long_straight, short_curved, etc.)
- **Reading blocks (all):** `src/data/blocks/index.ts` — Single export of all block arrays
- **Gender map:** `src/data/blocks/gender-map.ts` — Marker → gender-specific word map
- **Credit packages:** `src/data/credit-packs.ts` — Pack definitions (Avulsa, Dupla, Roda, Tsara)

**Configuration:**

- **TypeScript:** `tsconfig.json` (strict: true, paths: { @/_: src/_ })
- **Tailwind:** `tailwind.config.ts` (color tokens, custom utilities)
- **ESLint:** `eslint.config.mjs` (no-console: error, import rules)
- **Test runner:** `vitest.config.ts` (jsdom environment)
- **Prettier:** `.prettierrc.json` (2-space indent, trailing comma)

## Naming Conventions

**Files:**

- Components: `PascalCase.tsx` (e.g., `Button.tsx`, `ReadingSection.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`, `useCameraPipeline.ts`)
- Pages: `page.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Types: `lowercase-with-dashes.ts` → exports `PascalCase` types (e.g., `reading.ts` exports `Reading`, `ReadingSection`)
- Utilities: `camelCase.ts` (e.g., `personalize.ts`, `proxy.ts`)
- Data: `kebab-case.ts` (e.g., `credit-packs.ts`, `gender-map.ts`)

**Directories:**

- Feature folders: `kebab-case` (e.g., `src/components/lp-venda`, `src/app/ler`, `src/data/blocks`)
- Nested routes: URL-like paths (e.g., `src/app/api/reading/capture/`, `src/app/ler/resultado/[id]/`)

**Variables/Functions:**

- Functions: `camelCase` (e.g., `captureReading()`, `selectBlocks()`)
- Constants: `UPPER_SNAKE` (e.g., `CAM_STATES`, `ELEMENT_LABELS`, `CREDIT_PACKS`)
- React state: `camelCase` (e.g., `const [state, setState]`)

## Where to Add New Code

**New Feature (complete flow):**

- Primary code: `src/app/[feature]/` (pages + layout if needed)
- Components: `src/components/[feature]/` (new directory)
- Hooks (if stateful): `src/hooks/use[Feature].ts`
- Client adapter (if API): `src/lib/[feature]-client.ts`
- API routes: `src/app/api/[feature]/[action]/route.ts`
- Server logic: `src/server/lib/[feature].ts`
- Types: `src/types/[feature].ts`
- Tests: Colocate with files (\*.test.tsx for components)

**New Component (UI only):**

- If primitive (Button, Input, etc.): `src/components/ui/ComponentName.tsx`
- If domain-specific (reading, camera, landing): `src/components/[domain]/ComponentName.tsx`
- If shared across domains: `src/components/shared/ComponentName.tsx`
- Style: Use Tailwind exclusively, no CSS files (except globals.css)

**New API Route:**

- Location: `src/app/api/[namespace]/[action]/route.ts`
- Pattern: Zod schema at top → validate → rate-limit → business logic → response
- Always: Add Clerk middleware guard in `src/middleware.ts` if authenticated
- Always: Log via Pino logger, never expose PII
- Always: Return typed responses (NextResponse.json with error/data fields)

**New Data Block/Content:**

- Location: `src/data/blocks/[line-or-axis].ts` (or create new file if new axis)
- Pattern: Export array of TextBlock objects with content, alt, alt2 variations
- Structure: Each block has axis, variation, block_type (intro/body/impact/cross), tier (free/premium), content
- Update: `src/data/blocks/index.ts` to re-export

**New Test:**

- Location: Colocate with source (e.g., `src/components/ui/Button.test.tsx`, `src/server/lib/select-blocks.test.ts`)
- Framework: Vitest (already configured in vitest.config.ts)
- Pattern: Describe suite, test cases with expect()
- Run: `npm test` (watch), `npm test -- --run` (once), `npm test -- --coverage` (coverage)

## Special Directories

**src/app/preview:**

- Purpose: Dev playground for component showcase. NOT exposed in production.
- Generated: No
- Committed: Yes (but excluded from production builds by middleware or deployment config)
- Contains: Page states, isolated component experiments, visual regression testing

**src/generated/prisma:**

- Purpose: Generated TypeScript types from Prisma schema
- Generated: Yes (by `npx prisma generate`)
- Committed: Yes (checked in for CI/CD and local dev)
- Excluded: .gitignore typically excludes node_modules but not .generated/

**public/:**

- Purpose: Static assets (favicon, og-images when added, manifest.html)
- Generated: No
- Committed: Yes
- Deployed: Served at root by Next.js / Vercel

**src/mocks:**

- Purpose: Mock data for development. Loaded conditionally via `useMock()` hook.
- Generated: No (manually maintained)
- Committed: Yes
- Used: Only in development or when realFetcher missing; stripped from production bundles via tree-shaking

---

_Structure analysis: 2026-04-10_
