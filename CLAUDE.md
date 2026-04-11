# MaosFalam

Webapp de quiromancia com IA. Mobile-first. Next.js 16 App Router + TypeScript strict + Tailwind v4 + Framer Motion.
Personagem invisivel: cigana que existe so como voz nos textos. Tecnologia invisivel.

## Workflow

- Leia TODO.md no inicio de cada sessao. Trabalhe na primeira tarefa de AGORA.
- Ao completar tarefa: mova pra DONE no TODO.md com data. Atualize STATUS.md.
- Ao encontrar subtarefa: adicione no TODO.md na secao correta.
- Ao tomar decisao tecnica: registre em STATUS.md na secao "Decisoes tecnicas".

## Commands

```
npm run dev | npm run build | npm run lint | npm run type-check | npm run test | npm run test:e2e
```

## Rules

- TypeScript strict. Sem `any`.
- Componentes: funcoes + export default.
- Tailwind pra estilos. CSS custom so pra canvas/particles.
- `no-console: error` no ESLint.
- Front com mocks primeiro. Hook useMock() pra transicao pro backend.
- `src/app/preview/*` e exclusivamente playground de dev; nao expor em producao.

## Estrutura do front

```
src/
  app/              # rotas, layouts, composicao de pagina
  components/
    ui/             # primitives (Button, Input, Card, Badge, Separator...)
    shared/         # blocos compartilhados entre areas
    landing/        # home/institucional
    lp-venda/       # landing page de venda
    reading/        # componentes de leitura (resultado, glyphs, cards)
    camera/         # componentes de camera
    account/        # componentes da area logada
    tarot/          # componentes do tarot
  hooks/            # hooks genericos/transversais
  lib/              # adapters, ponte mock>backend
  mocks/            # mocks isolados
  types/            # contratos de dados
  data/             # blocos estaticos, pacotes de creditos
  proxy.ts          # auth middleware (Clerk clerkMiddleware)
  generated/        # Prisma client gerado (nao editar)
```

## Modularizacao

- 1 componente = 1 responsabilidade = 1 arquivo.
- Se o componente faz 2 coisas, extraia a segunda pra outro componente.
- Se precisa de scroll pra achar o return(), ta grande. Extraia.
- Logica de dados (fetch, transformacao) fica em hooks, nao em componentes.
- Componente recebe dados prontos por props. Renderiza. So isso.
- Tipos compartilhados em /src/types/. Tipos locais no topo do arquivo.
- Nao criar abstracoes "pra caso precise no futuro". Extraia quando precisar.

## Naming

Componentes: PascalCase.tsx | Hooks: useCamelCase.ts | Types: PascalCase | Constantes: UPPER_SNAKE | Pastas: kebab-case | Mocks: kebab-case.json

## Brand voice (OBRIGATORIO em todo texto pro usuario)

- Segunda pessoa. "Voce", nunca "as pessoas".
- Cigana: direta, sem hedging. Sem "talvez", "pode ser".
- ZERO: travessoes (—), energias, vibracoes, universo, algoritmo, IA, emojis.
- Nomenclatura real: "Monte de Jupiter", "Linha de Saturno".
- A marca revela, nunca explica.

## Docs (leia SO quando precisar)

- @docs/screens.md — telas e estados. ANTES de criar qualquer tela.
- @docs/blocks.md — blocos de texto. Quando criar mocks ou resultado.
- @docs/palmistry.md — quiromancia. Quando tocar em deteccao.
- @docs/brand-voice.md — tom de voz. Quando tiver duvida sobre copy.
- @docs/architecture.md — Arquitetura backend (v1.1 implementado). Stack, banco, APIs, motor de leitura, pagamentos (stub), auth. Referencia precisa do codigo atual.
- @docs/product.md — mercado, monetizacao. Se precisar contexto de negocio.
- @docs/DS.md — design system. Quando criar componentes visuais.

## Colors

black:#08050E deep:#110C1A surface:#171222 parchment:#1C1710(SO reading cards)
gold:#C9A24A rose:#C4647A violet:#7B6BA5 bone:#E8DFD0 ember:#8B5A38 velvet:#2A1830

## Fonts

Cinzel Decorative: LOGO ONLY. Cormorant Garamond italic: voz da cigana. Cinzel: headings. Raleway: corpo/UI. JetBrains Mono: dados tecnicos.

## Git

- **develop**: branch de trabalho padrao. Todo desenvolvimento acontece aqui.
- **main**: protegida. Checks obrigatorios. So recebe merges de develop via PR.
- **feature/\***: so quando a mudanca for maior ou arriscada. Branch de develop.
- Sempre trabalhe na branch develop. Nunca commite direto na main.
- PRs de develop → main quando milestone estiver estavel.

## Neon (Banco de Dados)

- **main** (Neon branch): producao. Vinculada a branch git main. NAO usar pra dev.
- **develop** (Neon branch): desenvolvimento. Vinculada a branch git develop. Usar como padrao.
- Neon project ID: `steep-bread-93583259`
- Develop branch ID: `br-weathered-violet-akp280bb`
- .env.local aponta pra Neon develop por padrao.
- Migrations rodam no Neon develop via `npx prisma migrate deploy`.
- Prisma 7: connection config em `prisma.config.ts`, NAO em `schema.prisma`.

## Vercel (Deploy)

- **Production**: maosfalam.com → branch main. "Em breve" por enquanto.
- **Staging**: staging.maosfalam.com → branch develop. Env vars apontam pra Neon develop.
- Push na develop → staging atualiza automaticamente.
- Push na main → producao atualiza automaticamente.
- Env vars configuradas por environment (production vs preview) na Vercel.
- PWA configurado (manifest.json, icons, apple-touch-icon).

### Env vars de controle por environment

| Env var | Production | Preview | Efeito |
|---------|-----------|---------|--------|
| `NEXT_PUBLIC_COMING_SOON` | `true` | — | Mostra pagina "em breve" em vez do app |
| `NEXT_PUBLIC_ENV_LABEL` | — | `Testes` | Prefixo no titulo da aba + favicon laranja |

**Pra desativar "em breve":** remover `NEXT_PUBLIC_COMING_SOON` no Vercel Dashboard (Settings > Environment Variables) ou via CLI: `vercel env rm NEXT_PUBLIC_COMING_SOON production -y`. Redeploy automatico apos push ou `vercel deploy --prod`.

## Behavior

- Seja direto. Faca o trabalho. Sem explicacoes longas.
- Quando criar tela: leia docs/screens.md pra TODOS os estados.
- Quando escrever texto de UI: siga brand voice.
- Quando terminar: rode `npm run build`.
- Agrupe tarefas. Nao peca confirmacao a cada passo.
- ANTES de editar arquivo existente: leia ele primeiro.

<!-- GSD:project-start source:PROJECT.md -->

## Project

**MaosFalam v1.1 — Alinhamento Arquitetural**

Backend completo com Neon + Prisma 7, Clerk v7 (auth middleware em `src/proxy.ts`), GPT-4o pra analise de palma, MediaPipe Hand Landmarker pra deteccao client-side, API routes, e seguranca. A milestone v1.1 alinha o codigo com as decisoes arquiteturais — fluxo unico com is_self flag, MediaPipe Hand Landmarker real, Clerk como unico auth, e limpeza de artefatos obsoletos. Pagamento (AbacatePay) e email (Resend) ficam pra milestone v2.

**Core Value:** A foto da palma entra, a leitura personalizada sai. O backend precisa conectar GPT-4o ao motor de leitura (`selectBlocks`) e persistir os resultados no Neon.

### Constraints

- **Tech stack**: Next.js 16, TypeScript strict, sem `any`, `no-console: error`
- **Seguranca**: foto nunca armazenada, CPF nunca logado, dados pessoais nunca nos logs
- **Performance**: `selectBlocks` <1ms (zero I/O, tudo em memoria)
- **Auth**: Clerk e source of truth pra name/email/foto. Neon so tem CPF e customer_id. `src/proxy.ts` (nao `middleware.ts`) e o arquivo de autenticacao Clerk
- **Brand voice**: todo texto pro usuario segue `docs/brand-voice.md` (voz da cigana)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5 - All source code, strict mode enforced via `tsconfig.json`
- JSX/TSX - React components, Next.js App Router
- JavaScript - Build configuration files, ESLint/Prettier configs

## Runtime

- Node.js 20+ (inferred from TypeScript target ES2017 and Next.js 16 compatibility)
- Browser: Modern browsers with ES2017+ support
- npm (^10.x inferred)
- Lockfile: `package-lock.json` present

## Frameworks

- Next.js 16.2.3 - Full-stack framework with App Router, server-side rendering, API routes
- React 19.2.4 - UI library for components and state management
- React DOM 19.2.4 - DOM rendering
- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss 4 - PostCSS plugin for Tailwind
- Framer Motion 12.38.0 - Animation library for motion effects and transitions
- Prisma 7.7.0 - TypeScript ORM for database management
- @prisma/client 7.7.0 - Prisma client for database queries
- @prisma/adapter-neon 7.7.0 - Neon serverless PostgreSQL adapter
- @neondatabase/serverless 1.0.2 - Serverless database driver
- @clerk/nextjs 7.0.12 - Auth provider with Google OAuth and email/password support
- @mediapipe/tasks-vision 0.10.34 - Hand Landmarker for client-side hand detection (no server)
- Vitest 4.1.3 - Unit test runner (Vue/React optimized)
- @testing-library/react 16.3.2 - React component testing utilities
- @testing-library/jest-dom 6.9.1 - Custom matchers for DOM assertions
- jsdom 29.0.2 - DOM implementation for test environment
- ESLint 9 - Code linting, strict rule enforcement
- eslint-config-next 16.2.3 - Next.js ESLint rules
- eslint-plugin-import 2.32.0 - Import/export validation
- eslint-plugin-unused-imports 4.4.1 - Detects and removes unused imports
- eslint-import-resolver-typescript 4.4.4 - TypeScript resolution for import plugin
- Prettier 3.8.2 - Code formatter
- Husky 9.1.7 - Git hooks runner
- lint-staged 16.4.0 - Run linters on staged files
- dotenv 17.4.1 - Environment variable loader
- Pino 10.3.1 - Structured logging library
- pino-pretty 13.1.3 - Development pretty-printer for Pino
- Zod 4.3.6 - TypeScript-first schema validation (used for API input validation)

## Key Dependencies

- @clerk/nextjs - Handles all authentication (Google OAuth, email/password, session management)
- @mediapipe/tasks-vision - Hand Landmarker for real-time hand detection client-side (no server cost)
- @prisma/client - Database access layer, type-safe queries
- framer-motion - Provides smooth animations for UI transitions
- zod - Input validation for all API routes (security critical)
- pino - Structured logging without exposing sensitive data
- @neondatabase/serverless - Serverless PostgreSQL connectivity

## Configuration

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key (safe for client)
- `CLERK_SECRET_KEY` - Clerk secret key (server-only)
- `OPENAI_API_KEY` - GPT-4o API key for hand analysis (server-only)
- `ABACATEPAY_API_KEY` - Payment processing API key (server-only)
- `ABACATEPAY_WEBHOOK_SECRET` - Webhook signature validation (server-only)
- `RESEND_API_KEY` - Email service API key (server-only)
- `DATABASE_URL` - Neon PostgreSQL connection string (server-only)
- `NEXT_PUBLIC_BASE_URL` - Application base URL (public, used for redirects)
- `LOG_LEVEL` - Logging level (debug|info|warn|error, default: info)
- `next.config.ts` - Next.js configuration, security headers setup (HSTS, X-Frame-Options, CORS)
- `tsconfig.json` - TypeScript compiler options, path aliases (`@/*` → `./src/*`)
- `vitest.config.ts` - Test runner configuration with jsdom environment
- `eslint.config.mjs` - Linting rules (no-console: error, strict type imports, import ordering)
- `postcss.config.mjs` - PostCSS plugins for Tailwind
- `.prettierrc.json` - Formatter settings (100 char line width, single quotes false)
- `.husky/` - Git hooks for linting and tests
- `lint-staged.config.mjs` - Pre-commit hook configuration

## Platform Requirements

- Node.js 20+
- npm
- Git
- Modern terminal (for pino-pretty color output)
- Vercel (recommended, detects Next.js automatically)
- or any Node.js 20+ hosting supporting Docker/serverless
- Neon PostgreSQL serverless (connection pooling, auto-scaling)
- Clerk (auth provider)
- OpenAI (GPT-4o for hand analysis)
- AbacatePay (payment processing)
- Resend (email transactional)

## Build Output

- **Runtime:** `npm run build` outputs `.next/` directory
- **Type Generation:** `next typegen` generates types in `.next/types/`
- **Prisma Generation:** `npx prisma generate` outputs types in `src/generated/prisma/`

## Development Commands

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Components: `PascalCase.tsx` (e.g., `HeroTitle.tsx`, `Button.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`, `useCameraPipeline.ts`)
- Types: `PascalCase.ts` (e.g., `camera.ts`, `reading.ts`)
- Constants: `UPPER_SNAKE_CASE` within files
- Styles: `PascalCase.module.css` (e.g., `HeroTitle.module.css`)
- Directories: `kebab-case` (e.g., `components/ui/`, `hooks/`, `types/`)
- Mocks: `kebab-case.ts` or `kebab-case.json` (e.g., `build-reading.ts`)
- camelCase for all functions (exported and internal)
- Higher-order functions or state setters prefixed with `on` (e.g., `onCaptured`, `onDone`)
- Private/internal functions with no prefix (e.g., `findBlock`, `charDelay`, `typeLine`)
- camelCase for variables, parameters
- `UPPER_SNAKE_CASE` for module-level constants (e.g., `STORAGE_KEY`, `ELEMENT_MOCKS`)
- State variables use `setState` convention (e.g., `setLine1`, `setCursorDone`)
- PascalCase for all types, interfaces, type aliases (e.g., `HandElement`, `ReadingSection`, `CamState`)
- Props interfaces: `{ComponentName}Props` (e.g., `ButtonProps`, `HeroTitleProps`)
- Discriminated union types favored (e.g., `CamState` as union of string literals)

## Code Style

- Prettier with config: `printWidth: 100`, `singleQuote: false`, `semi: true`, `trailingComma: "all"`
- File: `.prettierrc.json`
- Run: `npm run format` (check: `npm run format:check`)
- ESLint v9 with Next.js core rules + TypeScript support
- File: `eslint.config.mjs`
- Key enforced rules:
- UI components (`src/components/ui/**`) cannot import from `@/app/*` or `@/mocks/*`
- Hooks (`src/hooks/**`) cannot import from `@/components/*` or `@/app/*`
- Enforced via ESLint `no-restricted-imports`

## Import Organization

- `@/*` resolves to `src/*`
- Always use `@/` imports, never relative paths for src files
- Always newline after import block ends
- Alphabetize within each group (case-insensitive)
- No duplicate paths (same file imported twice)
- Type imports use `import type` syntax

## Error Handling

- `no-console: error` is enforced globally
- Exception: Error boundaries and error handlers use `console.error()` in development only
- Pattern in error handlers:
- Global error handler: `src/app/error.tsx` (handles client-side errors)
- Route-specific error handler: `src/app/ler/error.tsx` (for reading flow)
- Pattern: logs in dev, shows user-facing message to user (brand voice)
- Use optional chaining: `obj?.prop`
- Use nullish coalescing: `value ?? default`
- No `!` assertions (bang operator) except when type is provably non-null
- Defensive defaults: `??` preferred over `||`
- `TypeScript strict: true` enforced
- No implicit `any`
- All function parameters typed
- All return types inferred or explicit
- Union types preferred over overloads
- Used in API routes and server-side operations
- Returns 400/500 with structured error response
- Client-side: avoid try/catch for async state, use hooks instead

## Logging

- Development: `console.error("[Context]", data)`
- Production: Silent, user gets graceful error message
- Future: Pino logging framework available in `package.json`
- Errors in error boundaries (with context label)
- API route errors (route context)
- Successful operations
- Debug state changes
- User data (names, emails, etc.)

## Comments

- Complex algorithms or non-obvious logic (e.g., typewriter animation delays in `HeroTitle.tsx`)
- Historical context or TODOs (e.g., MediaPipe integration notes)
- Component behavior that differs from convention
- Archive of old implementation (link to previous approach)
- Used for component props interfaces (describe each prop)
- Used for complex functions with multiple params
- Used for hook behavior and side effects
- Example:
- Typewriter animation setup documented as JSDoc block
- MediaPipe pipeline states documented as constants with inline comments
- Dividers: `// ============================================================`

## Function Design

- If function needs scroll to see full body, extract smaller functions
- Prefer composition of small, single-purpose functions
- Example: `HeroTitle.tsx` breaks typewriter logic into `typeLine`, `charDelay`, `schedule`, `next`
- Max 3 parameters; beyond that use object/config pattern
- Props always in single object: `function Component(props: ComponentProps)`
- Callbacks prefixed with `on`: `onCaptured`, `onDone`
- Explicit types for all exported functions
- Inferred for internal/helper functions
- Void functions explicitly typed `: void`
- Early returns preferred over nested ifs
- Async functions explicitly typed with `Promise<T>`
- Try/catch for error handling in async functions
- No bare `.then()` chains (use await)

## Module Design

- Named exports for utilities, types, constants
- Default export only for React components
- Pattern for components:
- Not used currently (each import is explicit path)
- If added, keep to directory-level aggregation only
- Never barrel the entire `src/` or `src/components/`
- 1 component = 1 file
- 1 hook = 1 file
- Type definitions: group related types in 1 file per domain (e.g., `camera.ts`, `reading.ts`)
- Constants: co-locate with types or in dedicated domain file
- Client-side: React hooks (useState, useRef, useContext)
- Transient state: hooks in components
- Persistent state: localStorage via custom hooks (`useAuth`)
- Server state: Prisma (future), API routes (now)
- No global state library; props drilling or context for shared state

## TypeScript Patterns

- Always use `import type` for types:
- Separate from value imports by ESLint rule
- Preferred pattern for state machines (e.g., `CamState`)
- Type-safe exhaustiveness checking via Zod or pattern matching
- Used for state lookup maps (e.g., `CAM_FEEDBACK: Record<CamState, string>`)
- Enforces all states have a mapping
- Co-located with type definitions (e.g., `isErrorState(state)`, `isFrameActive(state)` in `camera.ts`)

## Component Patterns

- `"use client"` directive at top of file for all interactive components
- Server components for layouts, static content (no directive needed)
- Flat props for small components
- Context for deeply nested shared state (not used yet)
- useCallback for event handlers passed to children
- useRef for imperative DOM access (animations, focus)
- Dependency arrays explicitly listed and validated by ESLint
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## Pattern Overview

- Frontend-first mocking strategy: components built against static mocks, gradually transitioning to real APIs
- Unidirectional data flow from API routes through client adapters to React hooks to components
- Centralized reading engine (block selection + gender/name substitution) on server
- Heavy use of TypeScript with strict mode throughout
- State-machine approach for camera pipeline (explicit state types and transitions)

## Layers

- Purpose: Render visual interface, consume data via props, emit user actions via callbacks
- Location: `src/components/`
- Contains: Component files organized by domain (ui, landing, reading, camera, account, tarot, lp-venda)
- Depends on: Hooks, type contracts, design system CSS
- Used by: App Router pages
- Purpose: Bridge between components and API routes; encapsulate fetch logic; provide mock-to-real transition point
- Location: `src/lib/` (reading-client.ts, payment-client.ts, user-client.ts, checkout-intent.ts)
- Contains: Async functions (captureReading, getReading, registerLead, requestNewReading, requestPayment, etc.)
- Depends on: API routes, types
- Used by: Pages and hooks
- Purpose: Manage component-level state (auth, camera pipeline, form state); sync with localStorage; coordinate feature flows
- Location: `src/hooks/` (useAuth.ts, useCameraPipeline.ts, useMock.ts, useStoredName.ts)
- Contains: Custom React hooks for cross-cutting concerns
- Depends on: Types, client adapters, DOM APIs
- Used by: Page components
- Purpose: Handle HTTP requests; validate inputs; orchestrate business logic; persist data
- Location: `src/app/api/`
- Contains: POST/GET route handlers (reading/capture, reading/new, credits/purchase, user/\*, webhook/abacatepay, lead/register)
- Depends on: Server libs, Prisma client, types
- Used by: Client adapters, webhooks
- Purpose: Isolated, reusable business logic for AI analysis, reading generation, payment processing, logging
- Location: `src/server/lib/` (select-blocks.ts, openai.ts, abacatepay.ts, resend.ts, rate-limit.ts, auth.ts, prisma.ts, logger.ts)
- Contains: Pure functions, external service wrappers, database client
- Depends on: Types, data blocks, external APIs, environment
- Used by: API routes
- Purpose: Content blocks for reading reports (intro, body, impact, modifiers, etc.)
- Location: `src/data/blocks/` (heart.ts, head.ts, life.ts, fate.ts, mounts.ts, rare-signs.ts, crossings.ts, etc.)
- Contains: Hardcoded text variations organized by line/axis
- Depends on: Nothing
- Used by: select-blocks.ts
- Purpose: Shared TypeScript interfaces across all layers
- Location: `src/types/` (reading.ts, hand-attributes.ts, reading-block.ts, report.ts, camera.ts, blocks.ts, tarot.ts)
- Contains: Type definitions, enums
- Depends on: Nothing
- Used by: All layers

## Data Flow

- `sessionStorage`: `maosfalam_name_fresh` (name entered on /ler/nome, cleared after scan)
- localStorage: `maosfalam_user` (id, name, email) — populated on registration; deleted on logout
- Synced between tabs via custom `maosfalam:auth` event
- `useCameraPipeline` hook: manages `CamState` (method_choice → loading_mediapipe → camera_active_no_hand → ... → camera_capturing)
- Validated by MediaPipe in real-time

## Key Abstractions

- Purpose: Renders one line of the reading (Coração, Cabeça, Vida, Destino) with intro, body, extras, quotes, impact, technical strip
- Examples: `src/components/reading/ReadingSection.tsx`, `src/components/reading/ElementSection.tsx`
- Pattern: Accepts section data as prop, composes child glyphs and layout; intercalates cigana quotes between body extras
- Purpose: Visual data representations (circular icons with labels and symbols)
- Examples: `src/components/reading/ElementGlyph.tsx`, `src/components/reading/LineGlyph.tsx`
- Pattern: Pure display; receive data, render styled container + text + symbol
- Purpose: Toggles between free and premium tier displays of same reading
- Example: `src/components/reading/ResultStateSwitcher.tsx`
- Pattern: Stateful toggle, conditionally renders BlurredCard (free) or ReadingSection (premium)
- Purpose: Explicit state transitions for camera initialization, hand detection, capture flow
- Examples: `src/types/camera.ts` (CamState enum), `src/hooks/useCameraPipeline.ts` (state updater)
- Pattern: Single source of truth for camera state; transitions guarded by MediaPipe validation; error states fallback to manual upload
- Purpose: Thin wrappers around fetch to API routes; abstract HTTP details from components
- Pattern: Async functions that return typed promises; throw on non-2xx responses
- Purpose: Reads `HandAttributes`, outputs complete `ReportJSON` with all sections, mounts, crosses, rare signs
- Pattern: Deterministic; all variation choices seeded by reading ID for consistency; applies gender/name substitutions; uses lookup tables (ELEMENT_LABELS, etc.)

## Entry Points

- Location: `src/app/layout.tsx`
- Triggers: HTTP GET to `/` or any route
- Responsibilities: Set up ClerkProvider (auth), import fonts, render grain texture overlay, mount ToastProvider and global UI (SiteHeader, OfflineDetector)
- Location: `src/app/page.tsx`
- Triggers: HTTP GET to `/`
- Responsibilities: Render `HomeLanding` component
- Location: `src/app/ler/nome/page.tsx`
- Triggers: User clicks "Me mostre sua mão" on landing
- Responsibilities: Collect target name + gender; store in sessionStorage; route to camera
- Location: `src/app/api/reading/capture/route.ts`
- Triggers: POST from `captureReading()` adapter with photo + session data
- Responsibilities: Validate, analyze with OpenAI, select blocks, persist, send email, return report
- Location: `src/proxy.ts`
- Triggers: Every request (except static assets)
- Responsibilities: Clerk authentication check on protected routes (/api/reading/new, /api/credits/_, /api/user/_, /conta/\*)

## Error Handling

```typescript

```

```typescript

```

```typescript

```

```typescript

```

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.

<!-- GSD:profile-end -->
