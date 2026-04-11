# TODO

Claude: leia este arquivo no inicio de cada sessao. Quando completar uma tarefa, mova pra DONE com a data.

## AGORA

### Home layout refinamento

- [ ] Testar vídeo + lâmpada em múltiplos tamanhos de tela (verificar sobreposição)
- [ ] Cortinas: confirmar clareamento progressivo no mobile
- [ ] Video blend: testar mask-image em Safari/iOS

### Manifesto acentos

- [ ] Corrigir 63 palavras sem acento no manifesto page

### Clerk OAuth inline

- [ ] Login Google direto no modal (sem redirect pra tela Clerk separada)

## DEPOIS (v2 milestone)

### AbacatePay (pagamento real)

- [ ] Documentacao webhook AbacatePay v2
- [ ] /creditos: chamar purchaseCredits() real
- [ ] /creditos: coletar CPF (primeiro pagamento)
- [ ] /creditos: PIX real via AbacatePay
- [ ] Testar webhook billing.paid end-to-end

### Resend (email transacional)

- [ ] Configurar dominio maosfalam.com.br no Resend
- [ ] Migrar resend.ts pra SDK com idempotency keys
- [ ] Emails: pagamento confirmado, boas-vindas, leitura pronta

### Scaling

- [ ] Migrar rate limit de Map in-memory pra @upstash/ratelimit

## BACKLOG

- [ ] Testes E2E Playwright dos fluxos criticos
- [ ] Auditoria de a11y (contraste, breakpoints >=1024px)
- [ ] Bundle analysis + lazy load componentes pesados
- [ ] Share image real (canvas/OG dinâmica)
- [ ] Compatibilidade entre mãos (esquerda vs direita)

## DONE (sessão 2026-04-11 — milestones v1.1 + v1.2 + UI polish)

- [x] 2026-04-11 — v1.1 Phase 1: Auditoria (share_token, expires_at, NextAuth, R2, mocks limpos)
- [x] 2026-04-11 — v1.1 Phase 2: ReadingContext + CreditGate + /ler/nome dual flow
- [x] 2026-04-11 — v1.1 Phase 3: MediaPipe real (Hand Landmarker, auto-captura, handedness)
- [x] 2026-04-11 — v1.1 Phase 4: Clerk cleanup (esqueci/redefinir-senha, UserProfile)
- [x] 2026-04-11 — v1.1 Phase 5: Docs sync (architecture.md, CLAUDE.md alinhados)
- [x] 2026-04-11 — v1.2 Phase 1: Camera UI (badge, feedback, landmarks real-time, camera switch)
- [x] 2026-04-11 — v1.2 Phase 2: Upload pipeline (instrução, validação, confirmação)
- [x] 2026-04-11 — v1.2 Phase 3: Edge cases + Prompt (HEIC, EXIF, compressão, GPT-4o dominant hand)
- [x] 2026-04-11 — v1.2 Phase 4: Outra Pessoa + A11y (camera/upload adaptam nome, aria-labels)
- [x] 2026-04-11 — v1.2 Phase 5: Pipeline Refactor (photo-store, race condition, element pre-hint)
- [x] 2026-04-11 — Infra: Git branching (main+develop), Neon branching, Vercel staging+prod
- [x] 2026-04-11 — Fix: photo stale (mesmo resultado repetido), race condition scan, camera permission
- [x] 2026-04-11 — Fix: useCredits infinite loop (50+ req/s), typewriter chars perdidos
- [x] 2026-04-11 — Fix: hydration mismatch, landscape guard PC, crypto.randomUUID HTTP
- [x] 2026-04-11 — UI: Clerk dark mode, camera loading state, /ler/nome modal card, input redesign
- [x] 2026-04-11 — UI: Menu auth detection, Tarot Online label, login page cleanup
- [x] 2026-04-11 — UI: Hero mobile-first refactor, CTA fixed, video blend, cortinas timing
- [x] 2026-04-11 — UI: PWA manifest dinâmico, theme-color, acentos corrigidos
- [x] 2026-04-11 — 82 → 98 testes (16 novos)

## DONE (sessão 2026-04-11 — backend v1.0)

- [x] 2026-04-11 — 7 fases backend: Neon, Clerk, GPT-4o, APIs, adapters, wiring
- [x] 2026-04-11 — GSD project: PROJECT.md, REQUIREMENTS.md, ROADMAP.md, research
- [x] 2026-04-11 — Codebase map: 7 documentos em .planning/codebase/

## DONE (sessão 2026-04-10 — blocos v2)

- [x] 2026-04-10 — Motor de leitura v2: tipos, blocos, selectBlocks, mocks, front adapt
