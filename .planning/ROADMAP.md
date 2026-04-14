# Roadmap: MaosFalam

## Milestones

- ✅ **v1.0 Backend MVP** - Phases 1-7 (shipped 2026-04-11)
- ✅ **v1.1 Alinhamento Arquitetural** - Phases 1-5 (shipped 2026-04-11)
- ✅ **v1.2 Fluxo de Mao Dominante** - Phases 1-5 (shipped 2026-04-11)
- 🚧 **v1.3 Sistema de Creditos Robusto** - Phases 6-11 (in progress)

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

---

### 🚧 v1.3 Sistema de Creditos Robusto (In Progress)

**Milestone Goal:** Refactor do sistema de creditos com seguranca, correcao de bugs criticos, e maturidade de logging. Transacao atomica elimina credit_used client-side. Bugs de fluxo corrigidos. Logging auditado. Dead code removido.

## Phases

**Phase Numbering:**

- Integer phases (6, 7, 8...): Planned milestone work for v1.3
- Decimal phases (6.1, 6.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 6: Atomic Credit Transaction** - Debito atomico com raw SQL, CHECK constraint, fix /api/user/credits 404, fix reading_count inflation (completed 2026-04-14)
- [x] **Phase 7: Credit Infrastructure Cleanup** - Eliminar /api/reading/new e /api/dev/seed-credits, remover auto-seed do useAuth (completed 2026-04-14)
- [ ] **Phase 8: Auth & Navigation Fixes** - Login Google sem CAPTCHA loop, ?return= param, genero configuravel no fluxo pra mim
- [ ] **Phase 9: Reading Flow Fixes** - Nome correto em leitura pra outra pessoa, revelacao redireciona pro caminho certo, fluxo logado end-to-end
- [ ] **Phase 10: Logging Hardening** - LOG_LEVEL por environment, pino-pretty so em dev, zero dados sensiveis nos logs
- [ ] **Phase 11: Codebase Cleanup** - Remover CreditGate, eliminar credit_used de ReadingContext, dead code, Clerk legacy migration, sessionStorage orphans

## Phase Details

### Phase 6: Atomic Credit Transaction

**Goal**: Debito de credito e criacao de reading acontecem atomicamente no servidor; o banco impede saldo negativo; o endpoint de saldo responde corretamente; reading_count nao inflaciona com leituras anonimas
**Depends on**: Nothing (first phase of v1.3)
**Requirements**: CREDIT-01, CREDIT-02, CREDIT-03, CREDIT-06, CREDIT-07
**Success Criteria** (what must be TRUE):

1. Uma leitura premium e criada e o credito e debitado na mesma transacao SQL — se a criacao da reading falhar, o credito nao e debitado
2. Um UPDATE concorrente com remaining = 0 retorna 0 rows affected sem erro, sem saldo negativo no banco
3. GET /api/user/credits retorna 200 com balance numerico para usuario logado (sem 404)
4. reading_count em /conta/leituras reflete apenas leituras feitas com a conta logada, nao leituras anonimas claimadas
   **Plans**: 2 plans

Plans:

- [x] 06-01-PLAN.md — CHECK constraint migration, raw SQL debit helper, fix credits 404, fix reading_count
- [x] 06-02-PLAN.md — Atomic debit in /api/reading/capture, eliminate credit_used from client

### Phase 7: Credit Infrastructure Cleanup

**Goal**: /api/reading/new e removido; /api/dev/seed-credits e removido; staging nao cria creditos automaticamente no primeiro login
**Depends on**: Phase 6
**Requirements**: CREDIT-04, CREDIT-05
**Success Criteria** (what must be TRUE):

1. POST /api/reading/new retorna 404 — a rota nao existe mais
2. POST /api/dev/seed-credits retorna 404 — a rota nao existe mais
3. Ao fazer primeiro login no staging, nenhum credit_pack e criado automaticamente
4. O fluxo de leitura logado continua funcionando sem chamar /api/reading/new
   **Plans**: 1 plan

Plans:

- [x] 07-01-PLAN.md — Delete /api/reading/new, /api/dev/seed-credits, remove all callers

### Phase 8: Auth & Navigation Fixes

**Goal**: Login com Google funciona sem loop de CAPTCHA; login e registro preservam o destino e retornam o usuario ao lugar certo; usuario logado pode configurar genero no fluxo "pra mim"
**Depends on**: Nothing (independent of credit model)
**Requirements**: FLOW-04, FLOW-05, FLOW-06
**Success Criteria** (what must be TRUE):

1. Login com Google completa o fluxo OAuth sem loop de CAPTCHA no sso-callback
2. Usuario que acessa /creditos sem estar logado, faz login, e redirecionado de volta ao /creditos (nao para /conta/leituras)
3. ?return= param na URL de login e lido e respeitado apos autenticacao bem-sucedida
4. No fluxo "pra mim" logado, usuario ve toggle de genero e pode escolher ela/ele antes de ir pra camera
   **Plans**: TBD

### Phase 9: Reading Flow Fixes

**Goal**: Nome e genero da outra pessoa aparecem corretamente na leitura; revelacao redireciona para o resultado certo (free ou completo); fluxo logado de ponta a ponta funciona sem surpresas
**Depends on**: Phase 6
**Requirements**: FLOW-01, FLOW-02, FLOW-03
**Success Criteria** (what must be TRUE):

1. Leitura feita para "Carlos" mostra "Carlos" — nao o nome do usuario logado — em todo o resultado
2. Apos uma leitura premium (credito usado), revelacao redireciona para /ler/resultado/{id}/completo; apos leitura free, redireciona para /ler/resultado/{id}
3. Usuario logado com credito completa o funil nome -> toque -> camera -> scan -> revelacao -> resultado sem erro ou redirecionamento inesperado
   **Plans**: TBD

### Phase 10: Logging Hardening

**Goal**: Logs sao controlados por LOG_LEVEL por environment; pino-pretty nao carrega em producao; nenhum dado pessoal aparece em log algum
**Depends on**: Nothing (independent)
**Requirements**: LOG-01, LOG-02, LOG-03
**Success Criteria** (what must be TRUE):

1. Em producao (LOG_LEVEL=info), logs de debug nao aparecem; em dev (LOG_LEVEL=debug), aparecem
2. pino-pretty esta presente apenas como devDependency e o transport condicional nao o importa em producao
3. Audit de todos os loggers confirma: sem nome, email, CPF, foto base64, ou session_id nos logs
   **Plans**: TBD

### Phase 11: Codebase Cleanup

**Goal**: CreditGate e credit_used sao removidos do fluxo; dead code que nao e chamado por ninguem e deletado; login e registro usam @clerk/nextjs correto; sessionStorage keys orfas sao limpas
**Depends on**: Phase 6, Phase 7, Phase 8
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04, CLEAN-05
**Success Criteria** (what must be TRUE):

1. /ler/nome nao exibe mais o modal CreditGate — o fluxo vai direto pra camera sem interrupcao
2. ReadingContext nao tem mais o campo credit_used; /api/reading/capture nao aceita nem usa credit_used no body
3. npm run build e npm run type-check passam sem erros apos a remocao do dead code
4. login e registro importam de @clerk/nextjs (nao @clerk/nextjs/legacy) e funcionam identicamente
5. sessionStorage nao escreve mais maosfalam_email nem maosfalam_pending_reading; clearReadingContext() e chamada nos pontos corretos

## Progress

**Execution Order:**
Phases execute in numeric order: 6 → 7 → 8 (parallel to 9 after 6) → 9 → 10 (parallel to any) → 11

| Phase                            | Milestone | Plans Complete | Status      | Completed  |
| -------------------------------- | --------- | -------------- | ----------- | ---------- |
| 6. Atomic Credit Transaction     | v1.3      | 2/2            | Complete    | 2026-04-14 |
| 7. Credit Infrastructure Cleanup | v1.3      | 1/1            | Complete    | 2026-04-14 |
| 8. Auth & Navigation Fixes       | v1.3      | 0/?            | Not started | -          |
| 9. Reading Flow Fixes            | v1.3      | 0/?            | Not started | -          |
| 10. Logging Hardening            | v1.3      | 0/?            | Not started | -          |
| 11. Codebase Cleanup             | v1.3      | 0/?            | Not started | -          |
