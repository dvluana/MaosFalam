# Coding Conventions

**Analysis Date:** 2026-04-10

## Naming Patterns

**Files:**

- Components: `PascalCase.tsx` (e.g., `HeroTitle.tsx`, `Button.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`, `useCameraPipeline.ts`)
- Types: `PascalCase.ts` (e.g., `camera.ts`, `reading.ts`)
- Constants: `UPPER_SNAKE_CASE` within files
- Styles: `PascalCase.module.css` (e.g., `HeroTitle.module.css`)
- Directories: `kebab-case` (e.g., `components/ui/`, `hooks/`, `types/`)
- Mocks: `kebab-case.ts` or `kebab-case.json` (e.g., `build-reading.ts`)

**Functions:**

- camelCase for all functions (exported and internal)
- Higher-order functions or state setters prefixed with `on` (e.g., `onCaptured`, `onDone`)
- Private/internal functions with no prefix (e.g., `findBlock`, `charDelay`, `typeLine`)

**Variables & Constants:**

- camelCase for variables, parameters
- `UPPER_SNAKE_CASE` for module-level constants (e.g., `STORAGE_KEY`, `ELEMENT_MOCKS`)
- State variables use `setState` convention (e.g., `setLine1`, `setCursorDone`)

**Types:**

- PascalCase for all types, interfaces, type aliases (e.g., `HandElement`, `ReadingSection`, `CamState`)
- Props interfaces: `{ComponentName}Props` (e.g., `ButtonProps`, `HeroTitleProps`)
- Discriminated union types favored (e.g., `CamState` as union of string literals)

## Code Style

**Formatting:**

- Prettier with config: `printWidth: 100`, `singleQuote: false`, `semi: true`, `trailingComma: "all"`
- File: `.prettierrc.json`
- Run: `npm run format` (check: `npm run format:check`)

**Linting:**

- ESLint v9 with Next.js core rules + TypeScript support
- File: `eslint.config.mjs`
- Key enforced rules:
  - `no-console: error` — console calls disallowed except in error handlers (see Error Handling)
  - `@typescript-eslint/consistent-type-imports: error` — type imports separated from values
  - `@typescript-eslint/no-unused-vars: off` — handled by unused-imports plugin
  - `import/newline-after-import: error` — newline after all import blocks
  - `import/no-duplicates: error` — no duplicate import paths
  - `import/order: error` — enforced import order (see Import Organization)
  - `unused-imports/no-unused-imports: error` — auto-removes unused imports

**Module Boundaries:**

- UI components (`src/components/ui/**`) cannot import from `@/app/*` or `@/mocks/*`
- Hooks (`src/hooks/**`) cannot import from `@/components/*` or `@/app/*`
- Enforced via ESLint `no-restricted-imports`

## Import Organization

**Order (enforced by import/order rule):**

1. Builtin modules (`node:*`, `react`, etc.)
2. External packages (`next`, `framer-motion`, etc.)
3. Internal imports from `@/*`
4. Relative imports (`./`, `../`)
5. Type-only imports (all at end, separated)

**Path Aliases:**

- `@/*` resolves to `src/*`
- Always use `@/` imports, never relative paths for src files

**Style:**

```typescript
import { useEffect, useRef, useState } from "react";

import type { CamState } from "@/types/camera";

// then local code
```

**Rules:**

- Always newline after import block ends
- Alphabetize within each group (case-insensitive)
- No duplicate paths (same file imported twice)
- Type imports use `import type` syntax

## Error Handling

**Strategy:** Defensive, specific errors with context

**Console usage:**

- `no-console: error` is enforced globally
- Exception: Error boundaries and error handlers use `console.error()` in development only
- Pattern in error handlers:
  ```typescript
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[ErrorName]", error);
    }
  }, [error]);
  ```

**Error Boundaries:**

- Global error handler: `src/app/error.tsx` (handles client-side errors)
- Route-specific error handler: `src/app/ler/error.tsx` (for reading flow)
- Pattern: logs in dev, shows user-facing message to user (brand voice)

**Null/undefined handling:**

- Use optional chaining: `obj?.prop`
- Use nullish coalescing: `value ?? default`
- No `!` assertions (bang operator) except when type is provably non-null
- Defensive defaults: `??` preferred over `||`

**Type safety:**

- `TypeScript strict: true` enforced
- No implicit `any`
- All function parameters typed
- All return types inferred or explicit
- Union types preferred over overloads

**Try/catch blocks:**

- Used in API routes and server-side operations
- Returns 400/500 with structured error response
- Client-side: avoid try/catch for async state, use hooks instead

## Logging

**Framework:** No centralized logger yet (project uses mocks)

**Pattern:** Error boundaries and specific handlers only

- Development: `console.error("[Context]", data)`
- Production: Silent, user gets graceful error message
- Future: Pino logging framework available in `package.json`

**What to log:**

- Errors in error boundaries (with context label)
- API route errors (route context)

**What NOT to log:**

- Successful operations
- Debug state changes
- User data (names, emails, etc.)

## Comments

**When to Comment:**

- Complex algorithms or non-obvious logic (e.g., typewriter animation delays in `HeroTitle.tsx`)
- Historical context or TODOs (e.g., MediaPipe integration notes)
- Component behavior that differs from convention
- Archive of old implementation (link to previous approach)

**JSDoc/TSDoc:**

- Used for component props interfaces (describe each prop)
- Used for complex functions with multiple params
- Used for hook behavior and side effects
- Example:
  ```typescript
  interface HeroTitleProps {
    /** Primeira linha do título. */
    title?: string;
    /** Delay base por caractere em ms. */
    typeSpeed?: number;
  }
  ```

**Block comments for complex sections:**

- Typewriter animation setup documented as JSDoc block
- MediaPipe pipeline states documented as constants with inline comments
- Dividers: `// ============================================================`

## Function Design

**Size:** Keep functions small

- If function needs scroll to see full body, extract smaller functions
- Prefer composition of small, single-purpose functions
- Example: `HeroTitle.tsx` breaks typewriter logic into `typeLine`, `charDelay`, `schedule`, `next`

**Parameters:**

- Max 3 parameters; beyond that use object/config pattern
- Props always in single object: `function Component(props: ComponentProps)`
- Callbacks prefixed with `on`: `onCaptured`, `onDone`

**Return Values:**

- Explicit types for all exported functions
- Inferred for internal/helper functions
- Void functions explicitly typed `: void`
- Early returns preferred over nested ifs

**Async/Await:**

- Async functions explicitly typed with `Promise<T>`
- Try/catch for error handling in async functions
- No bare `.then()` chains (use await)

## Module Design

**Exports:**

- Named exports for utilities, types, constants
- Default export only for React components
- Pattern for components:
  ```typescript
  export default function Button({ ... }: ButtonProps) { ... }
  ```

**Barrel Files:**

- Not used currently (each import is explicit path)
- If added, keep to directory-level aggregation only
- Never barrel the entire `src/` or `src/components/`

**Single Responsibility:**

- 1 component = 1 file
- 1 hook = 1 file
- Type definitions: group related types in 1 file per domain (e.g., `camera.ts`, `reading.ts`)
- Constants: co-locate with types or in dedicated domain file

**State Management:**

- Client-side: React hooks (useState, useRef, useContext)
- Transient state: hooks in components
- Persistent state: localStorage via custom hooks (`useAuth`)
- Server state: Prisma (future), API routes (now)
- No global state library; props drilling or context for shared state

## TypeScript Patterns

**Type Imports:**

- Always use `import type` for types:
  ```typescript
  import type { User, Reading } from "@/types/reading";
  ```
- Separate from value imports by ESLint rule

**Discriminated Unions:**

- Preferred pattern for state machines (e.g., `CamState`)
- Type-safe exhaustiveness checking via Zod or pattern matching

**Record<K, V>:**

- Used for state lookup maps (e.g., `CAM_FEEDBACK: Record<CamState, string>`)
- Enforces all states have a mapping

**Branded types:**
Not used yet, but pattern:

```typescript
type UserId = string & { readonly __brand: "UserId" };
```

**Helper functions in types:**

- Co-located with type definitions (e.g., `isErrorState(state)`, `isFrameActive(state)` in `camera.ts`)

## Component Patterns

**Client/Server split:**

- `"use client"` directive at top of file for all interactive components
- Server components for layouts, static content (no directive needed)

**Props drilling:**

- Flat props for small components
- Context for deeply nested shared state (not used yet)

**Component composition:**

```typescript
export default function Button({
  variant = "primary",
  size = "default",
  children,
  ...rest
}: ButtonProps) {
  // conditional return based on variant
  // style objects inline for gradients Tailwind can't express
}
```

**Re-renders:**

- useCallback for event handlers passed to children
- useRef for imperative DOM access (animations, focus)
- Dependency arrays explicitly listed and validated by ESLint

---

_Convention analysis: 2026-04-10_
