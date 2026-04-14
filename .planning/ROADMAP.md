# Roadmap: MaosFalam

## Milestones

- ✅ **v1.0 Backend MVP** - Phases 1-7 (shipped 2026-04-11)
- ✅ **v1.1 Alinhamento Arquitetural** - Phases 1-5 (shipped 2026-04-11)
- ✅ **v1.2 Fluxo de Mao Dominante** - Phases 1-5 (shipped 2026-04-11)
- ✅ **v1.3 Sistema de Creditos Robusto** - Phases 6-11 (shipped 2026-04-14)
- 🚧 **v2 Monetizacao** - Phases 12-15 (in progress)

<details>
<summary>✅ v1.0 Backend MVP (Phases 1-7) - SHIPPED 2026-04-11</summary>

Phase 1: Foundation | Phase 2: Auth | Phase 3: AI Pipeline | Phase 4: Public API | Phase 5: Protected API | Phase 6: Client Adapters | Phase 7: Frontend-Backend Wiring

All 17 plans completed. See `.planning/archive/v1.0/` for history.

</details>

<details>
<summary>✅ v1.1 Alinhamento Arquitetural (Phases 1-5) - SHIPPED 2026-04-11</summary>

Phase 1: Auditoria | Phase 2: ReadingContext + Creditos | Phase 3: MediaPipe Real | Phase 4: Clerk Cleanup + Error Handling | Phase 5: Docs Sync

All 9 plans completed. See `.planning/archive/v1.1/` for history.

</details>

<details>
<summary>✅ v1.2 Fluxo de Mao Dominante (Phases 1-5) - SHIPPED 2026-04-11</summary>

Phase 1: Camera UI | Phase 2: Upload Pipeline | Phase 3: Edge Cases + Prompt | Phase 4: Outra Pessoa + A11y | Phase 5: Pipeline Refactor

All 13 plans completed. See `.planning/archive/v1.2/` for history.

</details>

<details>
<summary>✅ v1.3 Sistema de Creditos Robusto (Phases 6-11) - SHIPPED 2026-04-14</summary>

Phase 6: Atomic Credit Transaction | Phase 7: Credit Infrastructure Cleanup | Phase 8: Auth & Navigation Fixes | Phase 9: Reading Flow Fixes | Phase 10: Logging Hardening | Phase 11: Codebase Cleanup

All 7 plans completed. See `.planning/archive/v1.3/` for history.

</details>

---

### 🚧 v2 Monetizacao (In Progress)

**Milestone Goal:** Pagamento real end-to-end. Usuario compra creditos via AbacatePay (checkout hosted), webhook credita, leitura premium desbloqueia. Email transacional via Resend confirma pagamento. Bugs de UX pendentes resolvidos.

## Phases

- [x] **Phase 12: AbacatePay v2 Backend** - Migrar wrapper pra API v2, criar produtos, atualizar webhook, testes (completed 2026-04-14)
- [ ] **Phase 13: Frontend Payment Flow** - /creditos real, initiatePurchase, checkout intent, UpsellSection, CPF
- [ ] **Phase 14: Email & Hardening** - Resend emails transacionais, CPF validation, error handling, stale cleanup
- [ ] **Phase 15: Bug Fixes** - Manifesto acentos, camera handedness, revelacao corta

## Phase Details

### Phase 12: AbacatePay v2 Backend

**Goal**: Backend de pagamento migrado pra AbacatePay API v2. Checkout hosted funciona end-to-end: cria checkout → usuario paga no AbacatePay → webhook credita.
**Depends on**: Nothing (first phase of v2)
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06
**Plans:** 2/2 plans complete

Plans:

- [x] 12-01-PLAN.md — v2 wrapper rewrite + purchase route + schema migration + product setup
- [x] 12-02-PLAN.md — Webhook handler rewrite + comprehensive tests

**Success Criteria** (what must be TRUE):

1. abacatepay.ts usa /v2/checkouts/create com items referenciando produto por ID (nao inline products)
2. 4 produtos existem no AbacatePay com externalId mapeado (mf_avulsa, mf_dupla, mf_roda, mf_tsara)
3. POST /api/credits/purchase retorna checkout_url valido do AbacatePay
4. Webhook processa checkout.completed (nao billing.paid) e valida signature com chave publica fixa
5. Transacao atomica no webhook: paid → credit_pack → debit FIFO → tier upgrade (preservado de v1.3)
6. methods inclui PIX e CARD

### Phase 13: Frontend Payment Flow

**Goal**: Usuario consegue comprar creditos pela UI. /creditos chama API real, redireciona pro AbacatePay, volta com creditos. UpsellSection no resultado free funciona.
**Depends on**: Phase 12
**Requirements**: FRONT-01, FRONT-02, FRONT-03, FRONT-04, FRONT-05, PAY-07
**Plans:** 2 plans

Plans:

- [ ] 13-01-PLAN.md — initiatePurchase() + CPF utils + /creditos page rewrite (remove fake payment, real API)
- [ ] 13-02-PLAN.md — UpsellSection update + payment return flow (?paid=1, ?purchased=1)

**Success Criteria** (what must be TRUE):

1. /creditos chama POST /api/credits/purchase e redireciona pra checkout_url (sem PIX hardcoded)
2. payment-client.ts exporta initiatePurchase() usado por /creditos e UpsellSection
3. Usuario nao logado em /creditos → login → volta pra /creditos com pack pre-selecionado (checkout intent)
4. UpsellSection no resultado free redireciona pra /creditos ou inicia compra direta
5. Apos pagamento, completionUrl leva pra /ler/resultado/[id]/completo ou /conta/leituras?purchased=1
6. CPF coletado e validado (formato real) no primeiro pagamento

### Phase 14: Email & Hardening

**Goal**: Emails transacionais enviados via Resend apos eventos chave. Hardening de seguranca e cleanup.
**Depends on**: Phase 12 (webhook trigger)
**Requirements**: EMAIL-01, EMAIL-02, EMAIL-03, EMAIL-04
**Success Criteria** (what must be TRUE):

1. Email de pagamento confirmado enviado apos webhook (voz da cigana, link pro resultado)
2. Email de boas-vindas enviado apos primeira conta criada
3. Emails marketing so enviados se lead.email_opt_in === true
4. Falha no Resend nao bloqueia fluxo principal (retry 1x, catch silencioso)

### Phase 15: Bug Fixes

**Goal**: Bugs pendentes de UX resolvidos.
**Depends on**: Nothing (independent)
**Requirements**: BUG-01, BUG-02, BUG-03
**Success Criteria** (what must be TRUE):

1. Manifesto: 63 palavras sem acento corrigidas
2. Camera: handedness espelhamento so em camera frontal, nao em upload/traseira
3. Revelacao: carta nao corta em telas < 640px (scroll ou min-height)

## Progress

**Execution Order:**
Phase 12 → 13 → 14 (parallel to 15) → 15

| Phase                     | Milestone | Plans Complete | Status      | Completed  |
| ------------------------- | --------- | -------------- | ----------- | ---------- |
| 12. AbacatePay v2 Backend | v2        | 2/2            | Complete    | 2026-04-14 |
| 13. Frontend Payment Flow | v2        | 0/2            | Not started | -          |
| 14. Email & Hardening     | v2        | 0/?            | Not started | -          |
| 15. Bug Fixes             | v2        | 0/?            | Not started | -          |
