# Architecture

**Analysis Date:** 2026-04-10

## Pattern Overview

**Overall:** Next.js 16 App Router with layered separation: presentation (UI components) → data access (client-side adapters) → state management (hooks) → backend (API routes) → core logic (server libs).

**Key Characteristics:**

- Frontend-first mocking strategy: components built against static mocks, gradually transitioning to real APIs
- Unidirectional data flow from API routes through client adapters to React hooks to components
- Centralized reading engine (block selection + gender/name substitution) on server
- Heavy use of TypeScript with strict mode throughout
- State-machine approach for camera pipeline (explicit state types and transitions)

## Layers

**Presentation (UI Components):**

- Purpose: Render visual interface, consume data via props, emit user actions via callbacks
- Location: `src/components/`
- Contains: Component files organized by domain (ui, landing, reading, camera, account, tarot, lp-venda)
- Depends on: Hooks, type contracts, design system CSS
- Used by: App Router pages

**Data Access (Client Adapters):**

- Purpose: Bridge between components and API routes; encapsulate fetch logic; provide mock-to-real transition point
- Location: `src/lib/` (reading-client.ts, payment-client.ts, user-client.ts, checkout-intent.ts)
- Contains: Async functions (captureReading, getReading, registerLead, requestNewReading, requestPayment, etc.)
- Depends on: API routes, types
- Used by: Pages and hooks

**State Management (Hooks):**

- Purpose: Manage component-level state (auth, camera pipeline, form state); sync with localStorage; coordinate feature flows
- Location: `src/hooks/` (useAuth.ts, useCameraPipeline.ts, useMock.ts, useStoredName.ts)
- Contains: Custom React hooks for cross-cutting concerns
- Depends on: Types, client adapters, DOM APIs
- Used by: Page components

**Backend (API Routes):**

- Purpose: Handle HTTP requests; validate inputs; orchestrate business logic; persist data
- Location: `src/app/api/`
- Contains: POST/GET route handlers (reading/capture, reading/new, credits/purchase, user/\*, webhook/abacatepay, lead/register)
- Depends on: Server libs, Prisma client, types
- Used by: Client adapters, webhooks

**Core Logic (Server Libs):**

- Purpose: Isolated, reusable business logic for AI analysis, reading generation, payment processing, logging
- Location: `src/server/lib/` (select-blocks.ts, openai.ts, abacatepay.ts, resend.ts, rate-limit.ts, auth.ts, prisma.ts, logger.ts)
- Contains: Pure functions, external service wrappers, database client
- Depends on: Types, data blocks, external APIs, environment
- Used by: API routes

**Static Data (Blocks):**

- Purpose: Content blocks for reading reports (intro, body, impact, modifiers, etc.)
- Location: `src/data/blocks/` (heart.ts, head.ts, life.ts, fate.ts, mounts.ts, rare-signs.ts, crossings.ts, etc.)
- Contains: Hardcoded text variations organized by line/axis
- Depends on: Nothing
- Used by: select-blocks.ts

**Types & Contracts:**

- Purpose: Shared TypeScript interfaces across all layers
- Location: `src/types/` (reading.ts, hand-attributes.ts, reading-block.ts, report.ts, camera.ts, blocks.ts, tarot.ts)
- Contains: Type definitions, enums
- Depends on: Nothing
- Used by: All layers

## Data Flow

**Reading Capture Flow:**

1. User submits photo via camera page → `CameraViewport` captures base64
2. `useRouter.push("/ler/scan")` navigates to scan page
3. Scan page calls `captureReading()` (client adapter) → POST `/api/reading/capture`
4. API route validates input (Zod schema), rate-limits by IP
5. `analyzeHand()` sends photo + schema prompt to GPT-4o, gets `HandAttributes` JSON back
6. Confidence check: <0.3 → reject with toast; ≥0.3 → continue
7. `selectBlocks()` consumes `HandAttributes`, retrieves matching text blocks from `src/data/blocks/`
8. Text substitution: gender markers (`{{inteira}}` → `inteira` or `inteiro`), name markers (`{{name}}` → actual name)
9. Report JSON built and saved to Prisma `readings` table
10. Lead email fetched and async email sent via Resend
11. API returns `{ reading_id, report }` to client
12. Client navigates to `/ler/resultado/[id]` with report in state

**State Management:**

Session state (temporary):

- `sessionStorage`: `maosfalam_name_fresh` (name entered on /ler/nome, cleared after scan)

User state (persistent):

- localStorage: `maosfalam_user` (id, name, email) — populated on registration; deleted on logout
- Synced between tabs via custom `maosfalam:auth` event

Camera state (local):

- `useCameraPipeline` hook: manages `CamState` (method_choice → loading_mediapipe → camera_active_no_hand → ... → camera_capturing)
- Validated by MediaPipe in real-time

## Key Abstractions

**ReadingSection:**

- Purpose: Renders one line of the reading (Coração, Cabeça, Vida, Destino) with intro, body, extras, quotes, impact, technical strip
- Examples: `src/components/reading/ReadingSection.tsx`, `src/components/reading/ElementSection.tsx`
- Pattern: Accepts section data as prop, composes child glyphs and layout; intercalates cigana quotes between body extras

**ElementGlyph, LineGlyph, MountGlyph, RareSignGlyph:**

- Purpose: Visual data representations (circular icons with labels and symbols)
- Examples: `src/components/reading/ElementGlyph.tsx`, `src/components/reading/LineGlyph.tsx`
- Pattern: Pure display; receive data, render styled container + text + symbol

**ResultStateSwitcher:**

- Purpose: Toggles between free and premium tier displays of same reading
- Example: `src/components/reading/ResultStateSwitcher.tsx`
- Pattern: Stateful toggle, conditionally renders BlurredCard (free) or ReadingSection (premium)

**Camera State Machine:**

- Purpose: Explicit state transitions for camera initialization, hand detection, capture flow
- Examples: `src/types/camera.ts` (CamState enum), `src/hooks/useCameraPipeline.ts` (state updater)
- Pattern: Single source of truth for camera state; transitions guarded by MediaPipe validation; error states fallback to manual upload

**Client Adapters (reading-client.ts, payment-client.ts, user-client.ts):**

- Purpose: Thin wrappers around fetch to API routes; abstract HTTP details from components
- Pattern: Async functions that return typed promises; throw on non-2xx responses

**select-blocks:**

- Purpose: Reads `HandAttributes`, outputs complete `ReportJSON` with all sections, mounts, crosses, rare signs
- Pattern: Deterministic; all variation choices seeded by reading ID for consistency; applies gender/name substitutions; uses lookup tables (ELEMENT_LABELS, etc.)

## Entry Points

**Web App Root:**

- Location: `src/app/layout.tsx`
- Triggers: HTTP GET to `/` or any route
- Responsibilities: Set up ClerkProvider (auth), import fonts, render grain texture overlay, mount ToastProvider and global UI (SiteHeader, OfflineDetector)

**Home Page:**

- Location: `src/app/page.tsx`
- Triggers: HTTP GET to `/`
- Responsibilities: Render `HomeLanding` component

**Reading Flow Entry:**

- Location: `src/app/ler/nome/page.tsx`
- Triggers: User clicks "Me mostre sua mão" on landing
- Responsibilities: Collect target name + gender; store in sessionStorage; route to camera

**API Route (Reading Capture):**

- Location: `src/app/api/reading/capture/route.ts`
- Triggers: POST from `captureReading()` adapter with photo + session data
- Responsibilities: Validate, analyze with OpenAI, select blocks, persist, send email, return report

**Middleware:**

- Location: `src/middleware.ts`
- Triggers: Every request (except static assets)
- Responsibilities: Clerk authentication check on protected routes (/api/reading/new, /api/credits/_, /api/user/_, /conta/\*)

## Error Handling

**Strategy:** Three-tier approach:

1. **Form/Input Validation:** Zod schemas at API route entry point; reject with 400 if payload doesn't match
2. **Business Logic Errors:** Specific error codes and HTTP status codes (422 for low confidence, 429 for rate limit, 500 for unrecoverable)
3. **Component-Level UI:** Toast notifications (voz da cigana) for user-facing errors; error boundaries at page level (error.tsx)

**Patterns:**

Confidence validation:

```typescript
if (attributes.confidence < 0.3) {
  return NextResponse.json(
    { error: "Suas linhas estão tímidas...", code: "LOW_CONFIDENCE" },
    { status: 422 },
  );
}
```

Rate limiting:

```typescript
if (!rateLimit(`capture:${ip}`, 5)) {
  return NextResponse.json({ error: "Muitas tentativas..." }, { status: 429 });
}
```

Component error boundary:

```typescript
// src/app/ler/error.tsx: catches errors in /ler/* routes, displays fallback UI
```

Client adapter error handling:

```typescript
if (!res.ok) {
  const err = await res.json();
  throw new Error(err.error || "Erro genérico");
}
```

## Cross-Cutting Concerns

**Logging:** Pino logger at `src/server/lib/logger.ts`; used in API routes to log reading creation, analysis, payments; never logs PII (name, email, CPF)

**Validation:** Zod schemas guard every API route; schemas defined inline in route.ts files

**Authentication:** Clerk middleware in `src/middleware.ts`; protects /conta/_, /api/reading/new, /api/credits/_, /api/user/\* routes; clerk_user_id derived from auth context

**Rate Limiting:** In-memory Map with TTL at `src/server/lib/rate-limit.ts`; keyed by IP for public routes, user ID for authenticated routes

**Gender Handling:** `GENDER_MAP` at `src/data/blocks/gender-map.ts` maps markers (`{{inteira}}`, `{{fem}}`, etc.) to gender-specific replacements; applied to all report text by `replaceGender()` in select-blocks.ts

**Naming:** Name template substitution via `replaceName()` in select-blocks.ts; replaces `{{name}}` with target name

---

_Architecture analysis: 2026-04-10_
