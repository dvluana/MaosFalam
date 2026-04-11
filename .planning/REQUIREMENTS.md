# Requirements: MaosFalam

**Defined:** 2026-04-11
**Core Value:** Foto da palma entra, leitura personalizada sai. Backend conecta GPT-4o ao motor de leitura e persiste resultados.

## v1.0 Requirements (Complete)

All v1.0 requirements shipped. See `.planning/archive/v1.0/` for history.

- ✓ DB-01 through DB-04 (Database schema + Prisma + Neon)
- ✓ AUTH-01 through AUTH-04 (Clerk auth + middleware)
- ✓ AI-01 through AI-04 (GPT-4o integration)
- ✓ API-01 through API-10 (Public + protected API routes)
- ✓ SEC-01 through SEC-07 (Security + rate limiting)
- ✓ INFRA-01 through INFRA-05 (Logger + build + env)
- ✓ ADAPT-01 through ADAPT-04 (Client adapters)
- ✓ WIRE-01 through WIRE-06 (Frontend-backend wiring)

## v1.1 Requirements

Requirements for milestone v1.1: Alinhamento Arquitetural.

### Audit + Cleanup

- [ ] **AUDIT-01**: share_token e share_expires_at removidos de types, mocks, componentes, reading-client
- [ ] **AUDIT-02**: expires_at removido de credit_packs (types, queries, API, componentes)
- [ ] **AUDIT-03**: Referencias NextAuth removidas (useSession, getServerSession, next-auth)
- [ ] **AUDIT-04**: Referencias R2/Cloudflare removidas (photo_key, photoKey)
- [ ] **AUDIT-05**: "Claude Vision" substituido por "GPT-4o" em todo o codigo
- [ ] **AUDIT-06**: "Planeta dominante" substituido por "Monte dominante"
- [ ] **AUDIT-07**: Ordem das secoes do resultado segue v2 (Prologo > Coracao > Paywall > Cabeca > Vida > Venus > Montes > Destino > Cruzamentos > Compatibilidade > Raros > Epilogo)
- [ ] **AUDIT-08**: VALID_MOCK_IDS removido do resultado page
- [ ] **AUDIT-09**: fallbackName="Marina" removido (usa nome do sessionStorage/API)
- [ ] **AUDIT-10**: Dead stubs login()/register() removidos do useAuth
- [ ] **AUDIT-11**: TODOs obsoletos limpos

### ReadingContext + Credits

- [ ] **CTX-01**: ReadingContext type criado (target_name, target_gender, dominant_hand, is_self, session_id, credit_used)
- [ ] **CTX-02**: /ler/nome visitante coleta nome + email + genero + dominancia + opt-in
- [ ] **CTX-03**: /ler/nome logada mostra "Pra mim" / "Pra outra pessoa" na MESMA tela
- [ ] **CTX-04**: Fluxo "pra outra pessoa" monta ReadingContext com is_self=false e dados do formulario
- [ ] **CTX-05**: CreditGate component mostra confirmacao de credito antes de prosseguir
- [ ] **CTX-06**: Visitante e logada primeira leitura passam sem check de credito
- [ ] **CTX-07**: Logada segunda leitura+ confirma credito (com saldo) ou redireciona pra /creditos (sem saldo)
- [ ] **CTX-08**: Debito real acontece no SERVER via POST /api/reading/new (nao no client)
- [ ] **CTX-09**: Lead salvo via POST /api/lead/register ANTES do toque

### MediaPipe

- [ ] **MP-01**: @mediapipe/tasks-vision instalado e Hand Landmarker configurado
- [ ] **MP-02**: useCameraPipeline real: getUserMedia + Hand Landmarker + loop de frames
- [ ] **MP-03**: Validacao de landmarks: mao aberta, centralizada, estavel por 1.5s
- [ ] **MP-04**: Auto-captura do canvas como base64 JPEG quando validacao passa
- [ ] **MP-05**: Handedness: perguntar destra/canhota antes da camera
- [ ] **MP-06**: Instrucao na camera e validacao da mao correta (feedback da cigana se mao errada)
- [ ] **MP-07**: Espelhamento de camera frontal tratado corretamente
- [ ] **MP-08**: dominant_hand salvo no HandAttributes e enviado no ReadingContext

### Clerk Cleanup

- [ ] **CLK-01**: /esqueci-senha redireciona pra fluxo Clerk (nao implementacao custom)
- [ ] **CLK-02**: /redefinir-senha/[token] redireciona pra fluxo Clerk
- [ ] **CLK-03**: /conta/perfil edit nome usa Clerk UserProfile
- [ ] **CLK-04**: /conta/perfil trocar senha usa Clerk UserProfile

### Docs + Error Handling

- [ ] **DOCS-01**: architecture.md alinhado com codigo real (decisoes v1.1 refletidas)
- [ ] **DOCS-02**: CLAUDE.md atualizado (Clerk, sem R2, GPT-4o, estrutura atual)
- [ ] **DOCS-03**: /conta/leituras mostra toast de erro quando API falha
- [ ] **DOCS-04**: Resultado diferencia 404 (leitura nao existe) de 500 (erro de servidor)

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

## Out of Scope

| Feature                        | Reason                                         |
| ------------------------------ | ---------------------------------------------- |
| AbacatePay webhook             | Webhook v2 nao documentado                     |
| Resend email                   | Depende de dominio verificado                  |
| App nativo                     | Web-first                                      |
| Assinatura mensal              | Modelo e creditos avulsos                      |
| Compatibilidade entre maos     | v2 do produto                                  |
| Upload de foto pro storage     | Foto processada e descartada, nunca armazenada |
| dominant_hand no prompt GPT-4o | Fase futura apos MediaPipe funcionar           |
| Blocos de texto novos          | Conteudo atual suficiente                      |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement               | Phase | Status |
| ------------------------- | ----- | ------ |
| (populated by roadmapper) |       |        |

**Coverage:**

- v1.1 requirements: 38 total
- Mapped to phases: 0
- Unmapped: 38

---

_Requirements defined: 2026-04-11_
_Last updated: 2026-04-11 after milestone v1.1 definition_
