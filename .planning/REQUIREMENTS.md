# Requirements: MaosFalam Backend

**Defined:** 2026-04-10
**Core Value:** Foto da palma entra, leitura personalizada sai. Backend conecta GPT-4o ao motor de leitura e persiste resultados.

## v1 Requirements

Requirements para esta milestone. Cada um mapeia pra fases do roadmap.

### Database

- [x] **DB-01**: Schema Prisma com 5 tabelas (leads, user_profiles, readings, credit_packs, payments) alinhado com docs/architecture.md secao 5
- [x] **DB-02**: Prisma client singleton com Neon adapter (`@prisma/adapter-neon`) e connection pooling
- [x] **DB-03**: DIRECT_URL configurado pra Prisma migrations (conexao direta, nao pooled)
- [x] **DB-04**: Migration inicial roda sem erro (`prisma migrate dev --name init`)

### Auth

- [x] **AUTH-01**: Clerk middleware em proxy.ts protegendo rotas /api/user/_, /api/credits/_, /api/reading/new, /conta/\*
- [x] **AUTH-02**: Rotas publicas acessiveis sem auth: /, /ler/_, /compartilhar/_, /api/lead/register, /api/reading/capture, /api/reading/[id]
- [x] **AUTH-03**: ClerkProvider wrapping o app no layout.tsx
- [x] **AUTH-04**: Helpers server-side getClerkUser() e getClerkUserId() funcionais

### API Public

- [ ] **API-01**: POST /api/lead/register salva lead no banco (name, email, gender, session_id, email_opt_in)
- [ ] **API-02**: POST /api/reading/capture recebe foto base64, chama GPT-4o, roda selectBlocks, salva reading com tier 'free'
- [ ] **API-03**: POST /api/reading/capture rejeita com mensagem da cigana quando confidence < 0.3
- [ ] **API-04**: GET /api/reading/[id] retorna leitura por UUID, retorna 410 se is_active = false

### API Protected

- [ ] **API-05**: POST /api/reading/new debita 1 credito FIFO atomicamente (transaction SQL), retorna 402 sem creditos
- [ ] **API-06**: GET /api/user/credits retorna saldo e lista de packs
- [ ] **API-07**: GET /api/user/readings retorna historico de leituras do usuario
- [ ] **API-08**: GET /api/user/profile retorna name/email (Clerk) + cpf/phone (Neon)
- [ ] **API-09**: PUT /api/user/profile faz upsert de cpf e phone no user_profiles
- [ ] **API-10**: DELETE /api/user/account faz soft delete (is_active = false) com confirmacao "EXCLUIR"

### GPT-4o

- [ ] **AI-01**: Wrapper envia foto base64 pro GPT-4o com Structured Outputs (json_schema, nao json_object)
- [ ] **AI-02**: Prompt retorna HandAttributes valido conforme src/types/hand-attributes.ts
- [ ] **AI-03**: Foto nunca armazenada — processada e descartada
- [ ] **AI-04**: Logs registram apenas element e confidence, nunca a foto

### Security

- [ ] **SEC-01**: Rate limit POST /api/reading/capture: 5/hora por IP
- [ ] **SEC-02**: Rate limit POST /api/lead/register: 10/hora por IP
- [ ] **SEC-03**: Rate limit POST /api/credits/purchase: 5/hora por user (quando implementado)
- [ ] **SEC-04**: Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS
- [ ] **SEC-05**: Nenhuma API route aceita 'tier' como input do client
- [ ] **SEC-06**: Zod valida input em TODA API route
- [x] **SEC-07**: Nenhum dado pessoal (nome, email, CPF) nos logs do Pino

### Infrastructure

- [x] **INFRA-01**: Logger Pino configurado com pino-pretty em dev
- [x] **INFRA-02**: .env.example com todas as vars necessarias
- [x] **INFRA-03**: ESLint no-console: error ativo e funcionando
- [ ] **INFRA-04**: npm run build passa sem erro
- [ ] **INFRA-05**: npm run type-check passa sem erro

### Adapters

- [ ] **ADAPT-01**: src/lib/reading-client.ts com funcoes pra chamar API de leitura (captureReading, getReading, registerLead)
- [ ] **ADAPT-02**: src/lib/payment-client.ts com funcoes pra chamar API de creditos (purchaseCredits, getCredits)
- [ ] **ADAPT-03**: src/lib/user-client.ts com funcoes pra chamar API de usuario (getUserProfile, updateProfile, getUserReadings, deleteAccount)
- [ ] **ADAPT-04**: Nenhum import de @/server/\* em arquivos client

## v2 Requirements

Adiados para milestone futura.

### Payment

- **PAY-01**: POST /api/credits/purchase cria checkout no AbacatePay v2
- **PAY-02**: POST /api/webhook/abacatepay processa billing.paid atomicamente
- **PAY-03**: Webhook idempotente (mesmo billing_id processado uma vez)
- **PAY-04**: Validacao de assinatura do webhook

### Email

- **EMAIL-01**: Email de pagamento confirmado via Resend SDK
- **EMAIL-02**: Email de boas-vindas via Resend SDK
- **EMAIL-03**: Email de leitura pronta pra lead via Resend SDK
- **EMAIL-04**: Idempotency keys em todos os envios

### Scaling

- **SCALE-01**: Migrar rate limiting de Map in-memory pra @upstash/ratelimit
- **SCALE-02**: Consolidar Clerk de middleware.ts pra proxy.ts

## Out of Scope

| Feature                    | Reason                                         |
| -------------------------- | ---------------------------------------------- |
| AbacatePay webhook         | Webhook v2 nao documentado                     |
| Resend email               | Depende de dominio verificado                  |
| App nativo                 | Web-first                                      |
| Assinatura mensal          | Modelo e creditos avulsos                      |
| Compatibilidade entre maos | v2 do produto                                  |
| Seed de blocos no banco    | Blocos ficam em TS estatico, nao no banco      |
| Upload de foto pro storage | Foto processada e descartada, nunca armazenada |

## Traceability

| Requirement | Phase   | Status   |
| ----------- | ------- | -------- |
| DB-01       | Phase 1 | Complete |
| DB-02       | Phase 1 | Complete |
| DB-03       | Phase 1 | Complete |
| DB-04       | Phase 1 | Complete |
| AUTH-01     | Phase 2 | Complete |
| AUTH-02     | Phase 2 | Complete |
| AUTH-03     | Phase 2 | Complete |
| AUTH-04     | Phase 2 | Complete |
| AI-01       | Phase 3 | Pending  |
| AI-02       | Phase 3 | Pending  |
| AI-03       | Phase 3 | Pending  |
| AI-04       | Phase 3 | Pending  |
| API-01      | Phase 4 | Pending  |
| API-02      | Phase 4 | Pending  |
| API-03      | Phase 4 | Pending  |
| API-04      | Phase 4 | Pending  |
| API-05      | Phase 5 | Pending  |
| API-06      | Phase 5 | Pending  |
| API-07      | Phase 5 | Pending  |
| API-08      | Phase 5 | Pending  |
| API-09      | Phase 5 | Pending  |
| API-10      | Phase 5 | Pending  |
| SEC-01      | Phase 4 | Pending  |
| SEC-02      | Phase 4 | Pending  |
| SEC-03      | Phase 5 | Pending  |
| SEC-04      | Phase 4 | Pending  |
| SEC-05      | Phase 4 | Pending  |
| SEC-06      | Phase 4 | Pending  |
| SEC-07      | Phase 1 | Complete |
| INFRA-01    | Phase 1 | Complete |
| INFRA-02    | Phase 1 | Complete |
| INFRA-03    | Phase 1 | Complete |
| INFRA-04    | Phase 6 | Pending  |
| INFRA-05    | Phase 6 | Pending  |
| ADAPT-01    | Phase 6 | Pending  |
| ADAPT-02    | Phase 6 | Pending  |
| ADAPT-03    | Phase 6 | Pending  |
| ADAPT-04    | Phase 6 | Pending  |

**Coverage:**

- v1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0

---

_Requirements defined: 2026-04-10_
_Last updated: 2026-04-10 after initial definition_
