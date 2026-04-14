# STATUS

Ultima atualizacao: 2026-04-14 (milestone v1.3 completo — sistema de creditos robusto)

## Estado atual

Branch: develop (trabalho ativo)
Build: green (type-check + lint + build)
Banco: Neon develop branch com 5 tabelas + CHECK constraint remaining >= 0
Auth: Clerk v7 (Google OAuth + email/senha, telas custom com useSignIn/useSignUp legacy)
Deploy: staging.maosfalam.com (Vercel preview, branch develop)
Producao: maosfalam.com (em breve)

## Milestones completos

### v1.0 Backend MVP (7 fases)

- Neon+Prisma, Clerk, GPT-4o, 9 API routes, client adapters, front-back wiring

### v1.1 Alinhamento Arquitetural (5 fases)

- Auditoria codebase, ReadingContext unificado, MediaPipe real, Clerk cleanup, docs sync

### v1.2 Fluxo de Mao Dominante (5 fases)

- Camera UI, upload pipeline, edge cases, outra pessoa + a11y, pipeline refactor

### v1.3 Sistema de Creditos Robusto (6 fases, 21 reqs)

- Transacao atomica: debito + criacao de reading na mesma operacao Prisma
- CHECK(remaining >= 0) constraint no banco via migration
- Raw SQL debit race-safe (elimina read-then-write)
- credit_used eliminado do client (tier determinado server-side)
- /api/reading/new e /api/dev/seed-credits deletados
- Login/registro: ?return= param + consumeCheckoutIntent
- Genero toggle no fluxo "pra mim" logado
- reading_count nao inflaciona com leituras claimadas
- Pino: pino-pretty devDep, error sanitization, zero PII nos logs
- CreditGate removido, dead code limpo, sessionStorage orfas limpas

## Infra

- Git: main (protegida) + develop (trabalho)
- Neon: main (prod) + develop (dev) — project steep-bread-93583259
- Vercel: staging.maosfalam.com (develop) + maosfalam.com (main)
- Env vars separadas por environment (production vs preview)

## Decisoes tecnicas

- [2026-04-13] Transacao atomica no /api/reading/capture: auth() opcional, se logada com creditos debita via debitCreditFIFO + cria como premium na mesma transaction
- [2026-04-13] debitCreditFIFO usa raw SQL UPDATE SET remaining = remaining - 1 WHERE remaining > 0 — zero race condition
- [2026-04-13] temperature: 0 no GPT-4o — mesma foto sempre gera mesmo elemento
- [2026-04-13] MediaPipe handedness: camera ao vivo usa label direto, upload inverte (foto de palma de frente)
- [2026-04-13] buildCompatibility checa ambas ordens da chave (air_fire e fire_air) — 10 blocos cobrem 16 combinacoes
- [2026-04-13] /conta/leituras/[id] redireciona pra /ler/resultado/[id] ou /completo em vez de renderizar tela legada
- [2026-04-11] photo-store.ts: singleton module-level substitui sessionStorage pra foto
- [2026-04-11] computeElementHint: calcula elemento via ratio palm/fingers dos landmarks MediaPipe
- [2026-04-11] useSyncExternalStore pra useCredits — evita loop infinito

### UI Refactor + Componentizacao (sessao 2026-04-13)

- Home: LogoReveal, LunarClock, Smoke, mandala, glows, cone removidos. Fundo #000, video 40% maior, texto+CTA fixos na base
- Input DS: Raleway branco, corner ornaments, accent line focus
- Camera: StateSwitcher removido (7 pags), botao Voltar, mao errada inline, flash branco removido
- Componentizacao: BrandIcon (6→1), StatusIcon (2→1), ToggleButton, Checkbox, Eyebrow (6→1)
- Centralizacao: menu-items.ts, storage-keys.ts (13 chaves), share-url.ts

## Pendente

- Clerk legacy migration (@clerk/nextjs/legacy → @clerk/nextjs, API signal incompativel)
- Login Google CAPTCHA loop (provavelmente config do Clerk Dashboard)
- Manifesto acentos (63 palavras)
- Camera handedness trocada (espelhamento so em camera frontal)
- Revelacao carta corta em telas pequenas
