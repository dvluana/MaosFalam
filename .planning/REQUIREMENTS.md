# Requirements: MaosFalam v1.3

**Defined:** 2026-04-13
**Core Value:** A foto da palma entra, a leitura personalizada sai.

## v1.3 Requirements

Correcao, seguranca e maturidade do sistema de creditos e fluxos logados.

### Credit — Debito Atomico e Seguranca

- [x] **CREDIT-01**: Debito de credito e criacao de reading acontecem na mesma transacao Prisma atomica (eliminar credit_used do client)
- [x] **CREDIT-02**: Constraint CHECK(remaining >= 0) no banco via migration
- [x] **CREDIT-03**: Debit via raw SQL UPDATE SET remaining = remaining - 1 WHERE remaining > 0 (eliminar race condition)
- [ ] **CREDIT-04**: Eliminar /api/reading/new (debito move pra /api/reading/capture)
- [ ] **CREDIT-05**: Eliminar /api/dev/seed-credits e auto-seed no useAuth
- [x] **CREDIT-06**: /api/user/credits responde 200 corretamente (fix 404)
- [x] **CREDIT-07**: reading_count nao inflaciona com leituras anonimas claimadas

### Flow — Correcao de Fluxos

- [ ] **FLOW-01**: Nome correto em leitura pra outra pessoa (legacy sessionStorage keys sincronizadas)
- [ ] **FLOW-02**: Revelacao redireciona pra /completo quando leitura e premium
- [ ] **FLOW-03**: Fluxo logado pra mim e pra outra pessoa navega corretamente
- [ ] **FLOW-04**: Login Google funcional (SSO callback sem CAPTCHA loop)
- [ ] **FLOW-05**: Login e registro preservam checkout intent e ?return= param
- [ ] **FLOW-06**: Genero configuravel no fluxo pra mim logado (hoje sempre female)

### Log — Logging e Seguranca

- [ ] **LOG-01**: LOG_LEVEL configurado por environment (production=info, dev=debug)
- [ ] **LOG-02**: pino-pretty so carrega em dev (transport condicional)
- [ ] **LOG-03**: Zero dados sensiveis nos logs (audit e correcao)

### Clean — Limpeza de Codigo

- [ ] **CLEAN-01**: Remover CreditGate modal do /ler/nome (desnecessario com transacao atomica)
- [ ] **CLEAN-02**: Remover credit_used de ReadingContext, scan, capture schema
- [ ] **CLEAN-03**: Remover dead code (login/register stubs, purchaseCredits, consumeCheckoutIntent, sendWelcome, maosfalam_email)
- [ ] **CLEAN-04**: Migrar login/registro de @clerk/nextjs/legacy pra @clerk/nextjs
- [ ] **CLEAN-05**: Limpar sessionStorage keys orfas (pending_reading nunca setado, email nunca lido)

## Future Requirements (v2)

- **PAY-01**: Integracao real AbacatePay (PIX + cartao)
- **PAY-02**: Webhook billing.paid funcional
- **EMAIL-01**: Emails transacionais via Resend
- **ACCT-01**: Reset de senha funcional
- **ACCT-02**: Exclusao de conta

## Out of Scope

| Feature                             | Razao                                     |
| ----------------------------------- | ----------------------------------------- |
| Pagamento real (AbacatePay)         | Webhook v2 nao documentado, adiado pra v2 |
| Email transacional (Resend)         | Depende de dominio verificado             |
| App nativo                          | Web-first                                 |
| Assinatura mensal                   | Modelo e creditos avulsos                 |
| Rate limiting distribuido (Upstash) | Suficiente pra staging, resolver em v2    |

## Traceability

| Requirement | Phase    | Status   |
| ----------- | -------- | -------- |
| CREDIT-01   | Phase 6  | Complete |
| CREDIT-02   | Phase 6  | Complete |
| CREDIT-03   | Phase 6  | Complete |
| CREDIT-04   | Phase 7  | Pending  |
| CREDIT-05   | Phase 7  | Pending  |
| CREDIT-06   | Phase 6  | Complete |
| CREDIT-07   | Phase 6  | Complete |
| FLOW-01     | Phase 9  | Pending  |
| FLOW-02     | Phase 9  | Pending  |
| FLOW-03     | Phase 9  | Pending  |
| FLOW-04     | Phase 8  | Pending  |
| FLOW-05     | Phase 8  | Pending  |
| FLOW-06     | Phase 8  | Pending  |
| LOG-01      | Phase 10 | Pending  |
| LOG-02      | Phase 10 | Pending  |
| LOG-03      | Phase 10 | Pending  |
| CLEAN-01    | Phase 11 | Pending  |
| CLEAN-02    | Phase 11 | Pending  |
| CLEAN-03    | Phase 11 | Pending  |
| CLEAN-04    | Phase 11 | Pending  |
| CLEAN-05    | Phase 11 | Pending  |

**Coverage:**

- v1.3 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---

_Requirements defined: 2026-04-13_
_Last updated: 2026-04-13 after roadmap definition_
