# STATUS

Ultima atualizacao: 2026-04-11 (backend completo, front-back wired, auditoria final)

## Estado atual

Branch: main (sincronizada com origin)
Build: green (type-check + lint + 82 tests)
Banco: Neon "maosfalam" com 5 tabelas (leads, user_profiles, readings, credit_packs, payments)
Auth: Clerk v7 (Google OAuth + email/senha via componentes built-in)

## Backend (milestone v1.0 — completo)

7 fases executadas via GSD:

| Fase               | O que entregou                                                               |
| ------------------ | ---------------------------------------------------------------------------- |
| 1. Foundation      | Neon DB + Prisma singleton + Pino PII redaction + env docs                   |
| 2. Auth            | Clerk proxy.ts + auth helpers + ClerkProvider                                |
| 3. AI Pipeline     | GPT-4o Structured Outputs + Zod validation + selectBlocks fallbacks          |
| 4. Public API      | lead/register, reading/capture, reading/[id] + rate limit + security headers |
| 5. Protected API   | reading/new (FIFO debit), user/credits, user/readings, user/profile          |
| 6. Client Adapters | reading-client, payment-client, user-client reais + pages migradas           |
| 7. Frontend Wiring | Scan chama API real, useAuth migrado pra Clerk, camera salva base64          |

### API Routes funcionais

| Rota                         | Auth       | Status                                        |
| ---------------------------- | ---------- | --------------------------------------------- |
| POST /api/lead/register      | Nao        | Funcional (201 + Zod + rate limit 10/h)       |
| POST /api/reading/capture    | Nao        | Funcional (GPT-4o + selectBlocks + Prisma)    |
| GET /api/reading/[id]        | Nao        | Funcional (UUID validation + 410 inactive)    |
| POST /api/reading/new        | Sim        | Funcional (FIFO debit atomico)                |
| GET /api/user/credits        | Sim        | Funcional (balance + pack list)               |
| GET /api/user/readings       | Sim        | Funcional (per-user, isActive filter)         |
| GET/PUT /api/user/profile    | Sim        | Funcional (Clerk + Neon merge)                |
| POST /api/credits/purchase   | Sim        | Implementado (AbacatePay v2, front nao chama) |
| POST /api/webhook/abacatepay | Assinatura | Implementado (idempotente, front nao chama)   |

### Seguranca

- Rate limiting: in-memory Map (5/h capture, 10/h lead)
- Security headers: HSTS, X-Frame-Options, Permissions-Policy, Referrer-Policy
- PII redaction: Pino redact (name, email, cpf, phone)
- Zod validation: toda API route
- Tier enforcement: server-only (client nao aceita tier)

## Motor de leitura v2 (completo, implementado em paralelo)

- ~515 textos em `src/data/blocks/` (19 arquivos TS)
- `selectBlocks` em `src/server/lib/select-blocks.ts`
- Tipos: HandAttributes, ReportJSON, TextBlock, LineBlocks
- Fallbacks pra variacoes desconhecidas do GPT-4o
- Gender map com 18 marcadores ({{inteira}} etc)
- 4 mocks de HandAttributes (fire, water, earth, air)

## Front-back integracao

### Conectado e funcional

- /ler/nome → registerLead (com toggle ela/ele + checkbox LGPD)
- /ler/camera → salva foto base64 no sessionStorage (upload real)
- /ler/scan → captureReading (GPT-4o real) com error handling
- /ler/revelacao → le reading_id real do sessionStorage
- /ler/resultado/[id] → getReading da API
- /ler/resultado/[id]/completo → tier gate (redirect se nao premium)
- /conta/leituras → getUserReadings + getCredits reais
- /conta/leituras/[id] → getReading da API
- /compartilhar/[token] → getReading server-side com target_name real
- /login → Clerk <SignIn> component
- /registro → Clerk <SignUp> component

### Pendente (fake/mock)

- useCameraPipeline.ts: timer fake, nao MediaPipe real
- /creditos: pagamento inteiro fake (AbacatePay v2)
- /conta/perfil: edit nome e trocar senha sao no-ops (Clerk gerencia)
- /esqueci-senha: form nao faz nada (Clerk gerencia)
- /redefinir-senha/[token]: form nao faz nada (Clerk gerencia)
- VALID_MOCK_IDS: guard de dev aceita "fire","demo" como IDs
- fallbackName="Marina" em 2 result pages
- Share "Stories" e window.alert() stub
- maosfalam_email escrito mas nunca lido

## Decisoes tecnicas

- [2026-04-11] Neon + Prisma 7 com @prisma/adapter-neon. directUrl pra migrations, DATABASE_URL pooled pra runtime.
- [2026-04-11] Clerk como auth. proxy.ts com clerkMiddleware. Login/registro via componentes built-in <SignIn>/<SignUp> com tema dark customizado.
- [2026-04-11] GPT-4o com Structured Outputs (json_schema strict:true). Zod v4 como safety net. Model pinned gpt-4o-2024-08-06.
- [2026-04-11] selectBlocks com fallback \_fallback em todos os block maps. Logger.warn quando variacao desconhecida.
- [2026-04-11] Rate limit in-memory Map suficiente pro MVP. Migrar pra Upstash antes de escalar.
- [2026-04-11] Foto nunca armazenada. Processada e descartada. Logs so registram element + confidence.
- [2026-04-11] lead_id opcional no /api/reading/capture (users autenticados nao tem lead).
- [2026-04-11] timingSafeEqual com guard de length no webhook.
- [2026-04-11] deleteAccount removido do escopo (nao vai existir).
