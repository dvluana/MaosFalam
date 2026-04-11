# TODO

Claude: leia este arquivo no inicio de cada sessao. Quando completar uma tarefa, mova pra DONE com a data. Quando identificar subtarefas, adicione aqui.

## AGORA

### MediaPipe real (bloqueia fluxo de leitura com camera)

- [ ] Instalar @mediapipe/tasks-vision
- [ ] Implementar useCameraPipeline real: getUserMedia + Hand Landmarker + loop de frames
- [ ] Validar landmarks: mao aberta, centralizada, estavel por 1.5s
- [ ] Auto-captura: extrair foto do canvas como base64 JPEG quando estavel
- [ ] Handedness: perguntar destra/canhota no /ler/nome + instrucao na camera + validar mao correta
- [ ] Tratar espelhamento camera frontal (MediaPipe "Left" = mao direita real)
- [ ] Feedback da cigana se mao errada (aviso, nao bloqueio)

### Clerk: substituir forms custom por componentes built-in

- [ ] /esqueci-senha → Clerk gerencia (redirecionar pra /login com forgot password)
- [ ] /redefinir-senha/[token] → Clerk gerencia (deletar pagina ou redirect)
- [ ] /conta/perfil edit nome → Clerk <UserProfile> ou aceitar que Clerk owns name
- [ ] /conta/perfil trocar senha → Clerk <UserProfile> ou link pro Clerk dashboard

### Limpeza de mocks/scaffolding

- [ ] Remover VALID_MOCK_IDS do resultado/[id]/page.tsx (guard de dev)
- [ ] Remover fallbackName="Marina" dos 2 result pages (usar nome do sessionStorage)
- [ ] Limpar login()/register() dead stubs do useAuth.ts
- [ ] Share "Stories" button: implementar real ou remover window.alert stub
- [ ] Remover maosfalam_email do sessionStorage (escrito mas nunca lido) ou usar
- [ ] Limpar TODOs obsoletos do nome/page.tsx (referencia a /api/auth/check-email que nao existe)

### Error handling

- [ ] /conta/leituras: mostrar toast de erro quando API falha (hoje = tela vazia)
- [ ] /ler/resultado/[id]: diferenciar 404 de 500 (hoje trata tudo como "nao encontrada")

## DEPOIS (v2 milestone)

### AbacatePay (pagamento real)

- [ ] Documentacao webhook AbacatePay v2
- [ ] /creditos: chamar purchaseCredits() real
- [ ] /creditos: coletar CPF (primeiro pagamento)
- [ ] /creditos: passar reading_id pra upgrade automatico
- [ ] /creditos: PIX real via AbacatePay (hoje PIX_CODE fake)
- [ ] /creditos: card real via AbacatePay (hoje timer fake)
- [ ] Testar webhook billing.paid end-to-end

### Resend (email transacional)

- [ ] Configurar dominio maosfalam.com.br no Resend
- [ ] Migrar resend.ts pra SDK com idempotency keys
- [ ] Wiring: sendPaymentConfirmed chamado apos webhook
- [ ] Wiring: sendWelcome chamado apos primeiro login Clerk
- [ ] Wiring: sendLeadReading chamado apos reading capture

### Scaling

- [ ] Migrar rate limit de Map in-memory pra @upstash/ratelimit
- [ ] Consolidar Clerk de middleware.ts pra proxy.ts (se Next.js 16 deprecar middleware)

### Features v2

- [ ] Leitura pra outra pessoa (is_self=false, requestNewReading)
- [ ] Compatibilidade entre maos (esquerda vs direita)
- [ ] Geração real da share image (canvas/OG dinamica em /api/share/[token]/og)
- [ ] Assinatura mensal (alem de creditos avulsos)

## BACKLOG

- [ ] Testes E2E Playwright dos fluxos criticos
- [ ] Auditoria de a11y (contraste, breakpoints >=1024px)
- [ ] Bundle analysis + lazy load componentes pesados
- [ ] Profiling animacoes em mobile low-end
- [ ] cursor: none no wrapper da landing pro CrystalCursor
- [ ] OfflineDetector redesign pra casar com DS
- [ ] Loading fallbacks Suspense: trocar "Um momento..." por skeleton visual
- [ ] Sub-nav /conta/layout com so 2 items: virar breadcrumb ou sumir

## DONE (sessao 2026-04-11 — backend)

- [x] 2026-04-11 — Phase 1: Foundation (Neon DB 5 tabelas, Prisma singleton, Pino PII redaction, .env.example com DIRECT_URL)
- [x] 2026-04-11 — Phase 2: Auth (Clerk proxy.ts, auth helpers getClerkUser/getClerkUserId, ClerkProvider no layout, 6 unit tests)
- [x] 2026-04-11 — Phase 3: AI Pipeline (GPT-4o Structured Outputs json_schema, Zod validation, selectBlocks fallbacks \_fallback, 16 tests)
- [x] 2026-04-11 — Phase 4: Public API (lead/register 201, reading/capture com body guard 2MB + UUID validation, 17 route tests)
- [x] 2026-04-11 — Phase 5: Protected API (reading/new FIFO debit, user/credits, user/readings, user/profile — 31 route tests)
- [x] 2026-04-11 — Phase 6: Client Adapters (reading-client reescrito, conta pages migradas, zero @/server imports)
- [x] 2026-04-11 — Phase 7: Frontend Wiring (scan chama captureReading real, useAuth migrado pra Clerk useUser, camera salva base64)
- [x] 2026-04-11 — Audit fix: directUrl restaurado no schema.prisma
- [x] 2026-04-11 — Audit fix: timingSafeEqual length guard no abacatepay.ts
- [x] 2026-04-11 — Audit fix: lead_id opcional no capture route (users autenticados)
- [x] 2026-04-11 — Audit fix: requestNewReading adapter adicionado
- [x] 2026-04-11 — Audit fix: credits reais na conta/leituras (era hardcoded 0)
- [x] 2026-04-11 — Audit fix: tier gate no /completo (redirect se nao premium)
- [x] 2026-04-11 — Audit fix: gender toggle ela/ele no /ler/nome
- [x] 2026-04-11 — Audit fix: checkbox LGPD email opt-in no /ler/nome
- [x] 2026-04-11 — Audit fix: login/registro migrados pra Clerk <SignIn>/<SignUp>
- [x] 2026-04-11 — Audit fix: target_name real no /conta/leituras e /compartilhar (era "Marina")
- [x] 2026-04-11 — Audit fix: camera upload le File como base64 real (era "mock_photo_placeholder")
- [x] 2026-04-11 — Audit fix: creditos Google login redirect pra /login (era stub)
- [x] 2026-04-11 — Cleanup: deleted reading-block.ts, reading.ts shim, reading-blocks.json, user.json, useMock.ts
- [x] 2026-04-11 — Cleanup: 3 componentes importando @/types/reading → @/types/report
- [x] 2026-04-11 — Cleanup: auth.test.ts movido pra **tests**/
- [x] 2026-04-11 — Cleanup: {{igual}} adicionado ao GENDER_MAP
- [x] 2026-04-11 — Cleanup: deleteAccount route + test + adapter removidos
- [x] 2026-04-11 — Codebase map: 7 documentos em .planning/codebase/
- [x] 2026-04-11 — GSD project initialized: PROJECT.md, REQUIREMENTS.md (33 reqs), ROADMAP.md (7 fases), research (5 docs)

## DONE (sessao anterior 2026-04-10 — blocos v2 + front adapt)

- [x] 2026-04-10 — FASE 1 tipos: hand-attributes.ts, blocks.ts, report.ts
- [x] 2026-04-10 — FASE 2A blocos: 19 arquivos em src/data/blocks/ (~515 textos)
- [x] 2026-04-10 — FASE 2B motor: selectBlocks em src/server/lib/select-blocks.ts
- [x] 2026-04-10 — FASE 3 mocks: 4 HandAttributes mocks + reading-client adapter
- [x] 2026-04-10 — FASE 4 front: ~15 componentes adaptados pra v2, TransitionLine + VenusSection criados
- [x] 2026-04-10 — FASE 5 validacao: blocks-integrity.test.ts (5 tests)
