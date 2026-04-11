# Technology Stack

**Analysis Date:** 2025-04-10

## Languages

**Primary:**

- TypeScript 5 - All source code, strict mode enforced via `tsconfig.json`
- JSX/TSX - React components, Next.js App Router

**Secondary:**

- JavaScript - Build configuration files, ESLint/Prettier configs

## Runtime

**Environment:**

- Node.js 20+ (inferred from TypeScript target ES2017 and Next.js 16 compatibility)
- Browser: Modern browsers with ES2017+ support

**Package Manager:**

- npm (^10.x inferred)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**

- Next.js 16.2.3 - Full-stack framework with App Router, server-side rendering, API routes
- React 19.2.4 - UI library for components and state management
- React DOM 19.2.4 - DOM rendering

**UI & Styling:**

- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss 4 - PostCSS plugin for Tailwind
- Framer Motion 12.38.0 - Animation library for motion effects and transitions

**Data & ORM:**

- Prisma 7.7.0 - TypeScript ORM for database management
- @prisma/client 7.7.0 - Prisma client for database queries
- @prisma/adapter-neon 7.7.0 - Neon serverless PostgreSQL adapter
- @neondatabase/serverless 1.0.2 - Serverless database driver

**Authentication:**

- @clerk/nextjs 7.0.12 - Auth provider with Google OAuth and email/password support

**Testing:**

- Vitest 4.1.3 - Unit test runner (Vue/React optimized)
- @testing-library/react 16.3.2 - React component testing utilities
- @testing-library/jest-dom 6.9.1 - Custom matchers for DOM assertions
- jsdom 29.0.2 - DOM implementation for test environment

**Build/Dev:**

- ESLint 9 - Code linting, strict rule enforcement
- eslint-config-next 16.2.3 - Next.js ESLint rules
- eslint-plugin-import 2.32.0 - Import/export validation
- eslint-plugin-unused-imports 4.4.1 - Detects and removes unused imports
- eslint-import-resolver-typescript 4.4.4 - TypeScript resolution for import plugin
- Prettier 3.8.2 - Code formatter
- Husky 9.1.7 - Git hooks runner
- lint-staged 16.4.0 - Run linters on staged files
- dotenv 17.4.1 - Environment variable loader

**Logging:**

- Pino 10.3.1 - Structured logging library
- pino-pretty 13.1.3 - Development pretty-printer for Pino

**Validation:**

- Zod 4.3.6 - TypeScript-first schema validation (used for API input validation)

## Key Dependencies

**Critical:**

- @clerk/nextjs - Handles all authentication (Google OAuth, email/password, session management)
- @prisma/client - Database access layer, type-safe queries
- framer-motion - Provides smooth animations for UI transitions
- zod - Input validation for all API routes (security critical)

**Infrastructure:**

- pino - Structured logging without exposing sensitive data
- @neondatabase/serverless - Serverless PostgreSQL connectivity

## Configuration

**Environment:**
Configuration via `.env.local` (local) and deployment secrets in Vercel:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key (safe for client)
- `CLERK_SECRET_KEY` - Clerk secret key (server-only)
- `OPENAI_API_KEY` - GPT-4o API key for hand analysis (server-only)
- `ABACATEPAY_API_KEY` - Payment processing API key (server-only)
- `ABACATEPAY_WEBHOOK_SECRET` - Webhook signature validation (server-only)
- `RESEND_API_KEY` - Email service API key (server-only)
- `DATABASE_URL` - Neon PostgreSQL connection string (server-only)
- `NEXT_PUBLIC_BASE_URL` - Application base URL (public, used for redirects)
- `LOG_LEVEL` - Logging level (debug|info|warn|error, default: info)

**Build:**

- `next.config.ts` - Next.js configuration, security headers setup (HSTS, X-Frame-Options, CORS)
- `tsconfig.json` - TypeScript compiler options, path aliases (`@/*` → `./src/*`)
- `vitest.config.ts` - Test runner configuration with jsdom environment
- `eslint.config.mjs` - Linting rules (no-console: error, strict type imports, import ordering)
- `postcss.config.mjs` - PostCSS plugins for Tailwind
- `.prettierrc.json` - Formatter settings (100 char line width, single quotes false)
- `.husky/` - Git hooks for linting and tests
- `lint-staged.config.mjs` - Pre-commit hook configuration

## Platform Requirements

**Development:**

- Node.js 20+
- npm
- Git
- Modern terminal (for pino-pretty color output)

**Production:**

- Vercel (recommended, detects Next.js automatically)
- or any Node.js 20+ hosting supporting Docker/serverless

**Database:**

- Neon PostgreSQL serverless (connection pooling, auto-scaling)

**External Services Required:**

- Clerk (auth provider)
- OpenAI (GPT-4o for hand analysis)
- AbacatePay (payment processing)
- Resend (email transactional)

## Build Output

- **Runtime:** `npm run build` outputs `.next/` directory
- **Type Generation:** `next typegen` generates types in `.next/types/`
- **Prisma Generation:** `npx prisma generate` outputs types in `src/generated/prisma/`

## Development Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
npm run test             # Run Vitest
npm run test:e2e         # E2E tests (if configured)
npm run check            # lint + type-check + test + build
npm run ci:check         # Full CI pipeline (format:check + lint + type-check + test + build)
```

---

_Stack analysis: 2025-04-10_
