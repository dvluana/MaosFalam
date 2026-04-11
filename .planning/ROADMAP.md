# Roadmap: MaosFalam

## Milestones

- ✅ **v1.0 Backend MVP** - Phases 1-7 (shipped 2026-04-11)
- 🚧 **v1.1 Alinhamento Arquitetural** - Phases 1-5 (in progress)

<details>
<summary>✅ v1.0 Backend MVP (Phases 1-7) - SHIPPED 2026-04-11</summary>

Phase 1: Foundation | Phase 2: Auth | Phase 3: AI Pipeline | Phase 4: Public API | Phase 5: Protected API | Phase 6: Client Adapters | Phase 7: Frontend-Backend Wiring

All 17 plans completed. See `.planning/archive/v1.0/` for history.

</details>

---

### 🚧 v1.1 Alinhamento Arquitetural (In Progress)

**Milestone Goal:** Auditar e alinhar o codigo com as decisoes de arquitetura tomadas, refatorar fluxos core, e implementar MediaPipe real antes de features novas.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Auditoria** - Remover artefatos obsoletos e alinhar nomenclatura com decisoes v1.0
- [x] **Phase 2: ReadingContext + Creditos** - Refatorar fluxo /ler/nome e gate de creditos (completed 2026-04-11)
- [ ] **Phase 3: MediaPipe Real** - Substituir mock por Hand Landmarker real com auto-captura
- [ ] **Phase 4: Clerk Cleanup + Error Handling** - Delegar auth flows ao Clerk e diferenciar erros
- [ ] **Phase 5: Docs Sync** - Alinhar architecture.md e CLAUDE.md com o codigo real

## Phase Details

### Phase 1: Auditoria

**Goal**: Codebase limpa e alinhada com as decisoes arquiteturais de v1.0 — sem referencias a share_token, NextAuth, R2, Claude Vision, ou dados obsoletos
**Depends on**: Nothing (first phase)
**Requirements**: AUDIT-01, AUDIT-02, AUDIT-03, AUDIT-04, AUDIT-05, AUDIT-06, AUDIT-07, AUDIT-08, AUDIT-09, AUDIT-10, AUDIT-11
**Success Criteria** (what must be TRUE):

1. Nenhuma referencia a share_token, share_expires_at, expires_at de credit_packs existe em qualquer arquivo TypeScript ou JSON
2. Nenhuma referencia a NextAuth, next-auth, useSession, getServerSession existe no projeto
3. Nenhuma referencia a R2, Cloudflare, photo_key, photoKey existe no projeto
4. Toda ocorrencia de "Planeta dominante" foi substituida por "Monte dominante" e "Claude Vision" por "GPT-4o"
5. A pagina de resultado nao usa VALID_MOCK_IDS nem fallbackName="Marina"; login()/register() stubs e TODOs obsoletos foram removidos
   **Plans**: 2 plans

Plans:

- [x] 01-01-PLAN.md — Remover share_token, VALID_MOCK_IDS, fallbackName="Marina" de types e paginas
- [x] 01-02-PLAN.md — Corrigir ordem de secoes, verificar items ja limpos, limpar TODOs obsoletos

### Phase 2: ReadingContext + Creditos

**Goal**: Visitante e usuario logado passam pelo /ler/nome com coleta completa de contexto e o debito de credito ocorre no servidor antes de qualquer captura
**Depends on**: Phase 1
**Requirements**: CTX-01, CTX-02, CTX-03, CTX-04, CTX-05, CTX-06, CTX-07, CTX-08, CTX-09
**Success Criteria** (what must be TRUE):

1. Visitante em /ler/nome preenche nome, email, genero e dominancia antes de prosseguir; lead e salvo via POST /api/lead/register
2. Usuario logado ve "Pra mim" / "Pra outra pessoa" na mesma tela e ambos os caminhos montam ReadingContext correto com is_self flag
3. Modal CreditGate aparece para usuario logado fazendo segunda leitura ou mais, mostrando saldo antes de confirmar
4. Sem saldo, o usuario e redirecionado para /creditos antes de chegar na camera
5. Debito de credito acontece exclusivamente via POST /api/reading/new no servidor, nunca no cliente
   **Plans**: 2 plans
   **UI hint**: yes

Plans:

- [x] 02-01-PLAN.md — ReadingContext type, sessionStorage helpers, useCredits hook
- [x] 02-02-PLAN.md — Refatorar /ler/nome com fluxo dual visitante/logada + CreditGate modal

### Phase 3: MediaPipe Real

**Goal**: Camera usa Hand Landmarker real com validacao de landmarks e auto-captura; a mao dominante e coletada antes da camera e validada em tempo real
**Depends on**: Phase 2
**Requirements**: MP-01, MP-02, MP-03, MP-04, MP-05, MP-06, MP-07, MP-08
**Success Criteria** (what must be TRUE):

1. @mediapipe/tasks-vision esta instalado e o Hand Landmarker carrega sem erros em celular moderno
2. Camera abre, detecta a mao em tempo real e exibe feedback textual da cigana quando a posicao esta errada (mao fechada, descentralizada, mao errada)
3. Apos 1.5s de mao valida e estavelizada, a foto e capturada automaticamente do canvas como base64 JPEG sem intervencao do usuario
4. Handedness (destra/canhota) e perguntado antes da camera e dominant_hand e enviado no ReadingContext para o servidor
5. Camera frontal espelhada e camera traseira nao espelhada funcionam corretamente sem inversao de landmarks
   **Plans**: TBD
   **UI hint**: yes

### Phase 4: Clerk Cleanup + Error Handling

**Goal**: Fluxos de senha e perfil delegados ao Clerk sem telas customizadas; pagina de leituras exibe erros claros; resultado diferencia 404 de 500
**Depends on**: Phase 3
**Requirements**: CLK-01, CLK-02, CLK-03, CLK-04, DOCS-03, DOCS-04
**Success Criteria** (what must be TRUE):

1. /esqueci-senha e /redefinir-senha/[token] redirecionam para o fluxo Clerk sem renderizar formulario customizado
2. /conta/perfil usa Clerk UserProfile para edicao de nome e troca de senha; nao existe formulario manual para essas acoes
3. /conta/leituras mostra toast na voz da cigana quando a API falha ao carregar leituras
4. Pagina de resultado exibe mensagem distinta para leitura nao encontrada (404) versus erro de servidor (500)
   **Plans**: TBD
   **UI hint**: yes

### Phase 5: Docs Sync

**Goal**: architecture.md e CLAUDE.md refletem com precisao o codigo que existe hoje, sem referencias a sistemas removidos ou planos nao implementados
**Depends on**: Phase 4
**Requirements**: DOCS-01, DOCS-02
**Success Criteria** (what must be TRUE):

1. architecture.md nao menciona share_token, expires_at de creditos, NextAuth, R2, ou Claude Vision; reflete fluxo unico com is_self flag e decisoes v1.1
2. CLAUDE.md lista Clerk (sem NextAuth), GPT-4o (sem Claude Vision), sem mencao a R2, e a estrutura de pastas bate com o projeto real
   **Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase                             | Milestone | Plans Complete | Status      | Completed |
| --------------------------------- | --------- | -------------- | ----------- | --------- |
| 1. Auditoria                      | v1.1      | 2/2            | Complete    | -         |
| 2. ReadingContext + Creditos      | v1.1      | 2/2 | Complete   | 2026-04-11 |
| 3. MediaPipe Real                 | v1.1      | 1/2 | In Progress|  |
| 4. Clerk Cleanup + Error Handling | v1.1      | 0/?            | Not started | -         |
| 5. Docs Sync                      | v1.1      | 0/?            | Not started | -         |
