# Testing Patterns

**Analysis Date:** 2026-04-10

## Test Framework

**Runner:**

- Vitest v4.1.3
- Config: `vitest.config.ts`
- Environment: jsdom (browser DOM simulation)
- Globals: true (no need to import describe, it, expect)

**Assertion Library:**

- React Testing Library v16.3.2 (render, screen, fireEvent)
- Jest DOM matchers (expect().toBeInTheDocument(), etc.)

**Run Commands:**

```bash
npm test              # Run tests in watch mode
npm test -- --run    # Run tests once (CI mode)
npm run ci:check      # Full check: lint + type + test --run + build
```

## Test File Organization

**Location:**

- Co-located with source files (same directory)
- Convention: `ComponentName.test.tsx` or `ComponentName.spec.tsx`
- Runs automatically via glob: `src/**/*.{test,spec}.{ts,tsx}`

**Naming:**

- Test files follow source file name: `Button.tsx` → `Button.test.tsx`
- Test suites named by component: `describe("Button", () => { ... })`
- Individual tests named by behavior: `it("renders children", () => { ... })`

**Current Coverage:**

- Only `src/components/ui/Button.test.tsx` exists
- All other components/hooks/utilities untested (gaps identified)

## Test Structure

**Suite Organization:**

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Button from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Me mostre</Button>);
    expect(screen.getByRole("button", { name: /me mostre/i })).toBeTruthy();
  });

  it("handles click", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Toque</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

**Patterns:**

- Import React Testing Library tools at top
- Import vitest functions (describe, it, expect, vi) separately
- No setup files (globals: true in vitest.config)
- Each `it()` is a single behavior/assertion

**Setup/Teardown:**

- Component cleanup automatic via React Testing Library
- vi.fn() for mocking callbacks
- No beforeEach/afterEach hooks used yet (simple tests)

## Mocking

**Framework:** Vitest's built-in `vi` module

**Patterns:**

```typescript
// Mock callback with vi.fn()
const onClick = vi.fn();
render(<Button onClick={onClick}>Click</Button>);
fireEvent.click(screen.getByRole("button"));
expect(onClick).toHaveBeenCalledTimes(1);

// Mock modules (pattern, not yet used)
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, login: vi.fn() }),
}));
```

**What to Mock:**

- External callbacks passed as props (onClick, onSubmit, etc.)
- API calls (future: server functions)
- Hooks that interact with external systems (useAuth → Clerk in future)

**What NOT to Mock:**

- Internal component state (let React manage it)
- DOM APIs (Testing Library provides these)
- Component render logic (test real rendering)

## Fixtures and Factories

**Test Data:**

- Not yet formalized
- Mock reading data in `src/mocks/build-reading.ts` serves as factory
- Pattern: functions that return test data (e.g., `buildMockReading(element, name)`)

**Location:**

- Mocks: `src/mocks/`
- Fixtures: None yet (inline test data in tests)
- Factories: `buildMockReading`, `genId()` in `useAuth.ts`

**Recommendation for new tests:**

- Create fixtures in separate `.fixture.ts` files if data > 50 lines
- Export factory functions: `export function mockUser() { ... }`
- Keep test data readable: use actual domain objects, not raw JSON

## Coverage

**Requirements:** None enforced yet

**View Coverage:**

- No coverage threshold configured
- Can run: `vitest --coverage` (requires @vitest/coverage plugin)
- Not yet in CI check

**Gaps Identified:**

- Landing components (HeroTitle, Constellation, etc.) untested
- Hooks untested (useAuth, useCameraPipeline, useMock)
- Type helpers untested (camera.ts helper functions)
- No integration tests for reading flow
- No E2E tests (Playwright available but not configured)

## Test Types

**Unit Tests:**

- Scope: Single component or function behavior
- Approach: Render component, trigger action, assert on output
- Example: `Button.test.tsx` — button renders children, calls onClick
- Coverage: Happy path + simple prop variations

**Integration Tests:**

- Not yet created
- Scope: Multi-component flows (e.g., landing hero, camera pipeline)
- Would test: state transitions, data flow between components
- Pattern (when added):
  ```typescript
  it("flows from landing to camera", async () => {
    render(<Landing />);
    fireEvent.click(screen.getByRole("button", { name: /me mostre/i }));
    expect(screen.getByText(/câmera/i)).toBeInTheDocument();
  });
  ```

**E2E Tests:**

- Framework: Playwright (installed, not configured)
- Not yet implemented
- Would test: full user flows in real browser
- Setup: Would need `playwright.config.ts`

## Common Patterns

**Async Testing:**

- Not yet needed (no async rendering in current tests)
- Pattern when needed:
  ```typescript
  it("fetches data", async () => {
    const { rerender } = render(<Component />);
    await waitFor(() => {
      expect(screen.getByText("Loaded")).toBeInTheDocument();
    });
  });
  ```
- Imports: `waitFor`, `waitForElementToBeRemoved` from React Testing Library

**Error Testing:**

- Not yet used
- Pattern:
  ```typescript
  it("shows error on invalid input", () => {
    render(<Input value="bad" onChange={() => {}} />);
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });
  ```

**Event Testing:**

```typescript
fireEvent.click(element); // Click
fireEvent.change(input, { target: { value: "text" } }); // Input change
fireEvent.submit(form); // Form submit
```

## Current Test Example

**File:** `src/components/ui/Button.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Button from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Me mostre</Button>);
    expect(screen.getByRole("button", { name: /me mostre/i })).toBeTruthy();
  });

  it("handles click", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Toque</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

**Coverage:**

- Renders children text
- Calls onClick callback on click
- Does not test: variant styles, disabled state, sizes

## Best Practices Applied

✓ No `screen.debug()` in final tests (use during development only)
✓ Query by accessible attributes: `getByRole`, `getByLabelText`
✓ Avoid `querySelector` or direct DOM APIs
✓ Mock callbacks with `vi.fn()`
✓ Assert on user-visible behavior, not implementation details
✓ One logical assertion per test (can have multiple expect() for same logical assertion)

## Best Practices to Add

❌ No integration tests yet (recommend adding for reading flow)
❌ No fixtures/factories formalized (recommend for data > 50 lines)
❌ No E2E tests (Playwright ready, need config)
❌ No snapshot tests (avoid unless necessary for visual regression)
❌ No API mocking (will need when backend connects)

## Future Test Setup

**When backend integrates:**

1. Mock API routes with `vi.mock` or MSW (Mock Service Worker)

   ```typescript
   vi.mock("@/server/api/capture", () => ({
     captureHand: vi.fn().mockResolvedValue({ id: "123" }),
   }));
   ```

2. Test async state:

   ```typescript
   it("shows loading then result", async () => {
     render(<ReadingFlow />);
     expect(screen.getByText("Lendo")).toBeInTheDocument();
     await waitFor(() => {
       expect(screen.getByText(/seu coração/i)).toBeInTheDocument();
     });
   });
   ```

3. Test error states:
   ```typescript
   vi.mock("@/server/api/capture", () => ({
     captureHand: vi.fn().mockRejectedValue(new Error("Low confidence")),
   }));
   ```

---

_Testing analysis: 2026-04-10_
