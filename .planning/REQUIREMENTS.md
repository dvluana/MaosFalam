# Requirements: MaosFalam v2 Monetizacao

**Defined:** 2026-04-14
**Core Value:** A foto da palma entra, a leitura personalizada sai. Monetizacao: primeira leitura gratis, completa requer credito.

## v2 Requirements

Pagamento real end-to-end, email transacional, bug fixes pendentes.

### PAY — AbacatePay v2 Integration

- [x] **PAY-01**: abacatepay.ts migrado pra API v2 — endpoints /v2/checkouts/create, /v2/customers/create; produtos referenciados por ID (nao inline)
- [x] **PAY-02**: 4 produtos criados no AbacatePay (mf_avulsa, mf_dupla, mf_roda, mf_tsara) com externalId mapeado ao CREDIT_PACKS
- [x] **PAY-03**: POST /api/credits/purchase chama createCheckout() v2 e retorna checkout_url do AbacatePay
- [x] **PAY-04**: Webhook handler processa evento checkout.completed (nao billing.paid); valida signature com chave publica fixa do AbacatePay via HMAC-SHA256
- [x] **PAY-05**: Webhook atomico: marca paid → cria credit_pack → debita 1 credito FIFO (se reading_id) → upgrade tier → marca lead converted
- [x] **PAY-06**: methods: ["PIX", "CARD"] no checkout (nao so PIX)
- [ ] **PAY-07**: CPF validacao real no primeiro pagamento (formato XXX.XXX.XXX-XX ou 11 digitos)

### FRONT — Frontend Payment Flow

- [ ] **FRONT-01**: /creditos page chama POST /api/credits/purchase e redireciona pra checkout_url do AbacatePay (sem PIX hardcoded, sem form de cartao local)
- [ ] **FRONT-02**: payment-client.ts exporta initiatePurchase(packType, cpf?, readingId?) que retorna checkout_url
- [ ] **FRONT-03**: checkout-intent wired: se usuario nao logado em /creditos, salva intent antes de redirect pra /login; apos login, consome intent e retorna pra /creditos com pack pre-selecionado
- [ ] **FRONT-04**: UpsellSection.upgradeReading() funcional — chama initiatePurchase ou redirect pra /creditos se sem creditos
- [ ] **FRONT-05**: completionUrl do checkout redireciona pra /ler/resultado/[id]/completo (se veio do upsell) ou /conta/leituras?purchased=1 (se compra avulsa)

### EMAIL — Resend Integration

- [ ] **EMAIL-01**: Resend envia email de pagamento confirmado apos webhook (template com voz da cigana, link pro resultado)
- [ ] **EMAIL-02**: Resend envia email de boas-vindas apos primeira conta criada
- [ ] **EMAIL-03**: Emails so enviados se lead.email_opt_in === true (exceto transacionais de pagamento)
- [ ] **EMAIL-04**: Resend com retry (1x) em falha transiente; falha nao bloqueia fluxo principal

### BUG — Bug Fixes Pendentes

- [ ] **BUG-01**: Manifesto — corrigir 63 palavras sem acento
- [ ] **BUG-02**: Camera handedness — espelhamento so aplica em camera frontal/selfie, nao em upload nem camera traseira
- [ ] **BUG-03**: Revelacao — carta nao corta em telas pequenas (min-height ou scroll)

## Dependency Map

```
PAY-01 → PAY-02 → PAY-03 → FRONT-01
PAY-01 → PAY-04 → PAY-05
PAY-03 → FRONT-02 → FRONT-04
FRONT-02 → FRONT-03
PAY-05 → EMAIL-01
EMAIL-01 → EMAIL-02 (same infra)
BUG-01, BUG-02, BUG-03 — independentes
```

## Traceability

| Requirement | Phase    | Status   |
| ----------- | -------- | -------- |
| PAY-01      | Phase 12 | Done     |
| PAY-02      | Phase 12 | Done     |
| PAY-03      | Phase 12 | Done     |
| PAY-04      | Phase 12 | Complete |
| PAY-05      | Phase 12 | Complete |
| PAY-06      | Phase 12 | Done     |
| PAY-07      | Phase 13 | Pending  |
| FRONT-01    | Phase 13 | Pending  |
| FRONT-02    | Phase 13 | Pending  |
| FRONT-03    | Phase 13 | Pending  |
| FRONT-04    | Phase 13 | Pending  |
| FRONT-05    | Phase 13 | Pending  |
| EMAIL-01    | Phase 14 | Pending  |
| EMAIL-02    | Phase 14 | Pending  |
| EMAIL-03    | Phase 14 | Pending  |
| EMAIL-04    | Phase 14 | Pending  |
| BUG-01      | Phase 15 | Pending  |
| BUG-02      | Phase 15 | Pending  |
| BUG-03      | Phase 15 | Pending  |

**Coverage:**

- v2 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

## Inherited from v1.3 (deferred)

- FLOW-01, FLOW-02, FLOW-03: Verified fixed via Phase 9 cherry-pick (reading_count + target_name)
- CLEAN-04: Clerk legacy migration deferred (signal API incompativel, nao bloqueia v2)

## Out of Scope

| Feature                             | Razao                                  |
| ----------------------------------- | -------------------------------------- |
| Transparent checkout (PIX QR local) | Checkout hosted e suficiente pra MVP   |
| App nativo                          | Web-first                              |
| Assinatura mensal                   | Modelo e creditos avulsos              |
| Rate limiting distribuido (Upstash) | Map in-memory suficiente ate ~1000 CCU |
| Clerk OAuth inline                  | Complexidade alta, baixo impacto       |
| Compatibilidade entre maos          | v3                                     |

---

_Requirements defined: 2026-04-14_
_Last updated: 2026-04-14_
