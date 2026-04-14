# TODO

Claude: leia este arquivo no inicio de cada sessao. Quando completar uma tarefa, mova pra DONE com a data.

## AGORA

### Clerk Dashboard (manual)

- [ ] Mudar nome da app de "PariTech" pra "MaosFalam"
- [ ] Remover Facebook OAuth, deixar so Google
- [ ] Criar webhook user.created → staging.maosfalam.com/api/webhook/clerk
- [ ] Copiar Signing Secret e adicionar como CLERK_WEBHOOK_SECRET no Vercel preview

### Resend (manual)

- [ ] Verificar dominio maosfalam.com.br no Resend Dashboard
- [ ] Adicionar RESEND_API_KEY no Vercel preview

### Share card

- [ ] Redesenhar share card (atualmente vazio/minimo)

## DEPOIS

### Scaling

- [ ] Migrar rate limit de Map in-memory pra @upstash/ratelimit

### Tech debt

- [ ] Clerk legacy migration (@clerk/nextjs/legacy → @clerk/nextjs, API signal incompativel)
- [ ] Reativar cortinas, lampada Edison, cursor cristal quando design estiver pronto

## BACKLOG

- [ ] Testes E2E Playwright automatizados (CI)
- [ ] Auditoria de a11y (contraste, breakpoints >=1024px)
- [ ] Bundle analysis + lazy load componentes pesados
- [ ] Share image real (canvas/OG dinamica)
- [ ] Compatibilidade entre maos (esquerda vs direita)

## DONE (sessao 2026-04-14 — v2 Monetizacao + bug sweep)

- [x] 2026-04-14 — v2 Phase 12: AbacatePay v2 Backend (wrapper, produtos, webhook, testes)
- [x] 2026-04-14 — v2 Phase 13: Frontend Payment Flow (creditos real, initiatePurchase, CPF, UpsellSection)
- [x] 2026-04-14 — v2 Phase 14: Email & Hardening (Resend templates, Clerk webhook, opt-in)
- [x] 2026-04-14 — v2 Phase 15: Bug Fixes (manifesto acentos, camera handedness, revelacao responsiva)
- [x] 2026-04-14 — Fix: env vars Vercel com \\n (causava 500 no AbacatePay)
- [x] 2026-04-14 — Fix: proxy.ts API routes 401 JSON em vez de 307 redirect
- [x] 2026-04-14 — Fix: /creditos UX simplificado (botao direto no card)
- [x] 2026-04-14 — Fix: email templates redesenhados (visual da marca)
- [x] 2026-04-14 — Fix: acentuacao em 10 arquivos (40+ fixes)
- [x] 2026-04-14 — Fix: upsell redirect pra /creditos (era API 403)
- [x] 2026-04-14 — Fix: nome vazio "Pra mim" (validacao + fallback)
- [x] 2026-04-14 — Fix: gender markers no template
- [x] 2026-04-14 — Fix: menu numbering 04→05
- [x] 2026-04-14 — Fix: copyright 2025→2026
- [x] 2026-04-14 — Fix: sessionStorage name override (API prioritario)
- [x] 2026-04-14 — Fix: card pula posicao (spinner sem mudar texto)
- [x] 2026-04-14 — Fix: manifesto contraste (z-index vignette)
- [x] 2026-04-14 — Fix: login email/senha (handle needs_first_factor)
- [x] 2026-04-14 — Desativar cortinas, lampada Edison, cursor cristal
- [x] 2026-04-14 — Limpar dados orfaos no banco (9 payments, 5 credit_packs)
- [x] 2026-04-14 — 22 testes E2E staging (seguranca, webhook, creditos, data integrity)

## DONE (sessao 2026-04-13 — UI refactor + componentizacao)

- [x] 2026-04-13 — Remover StateSwitcher de todas as paginas (7 arquivos)
- [x] 2026-04-13 — Home: fundo preto puro, video 40% maior, texto+CTA fixos na base
- [x] 2026-04-13 — Componentizacao: BrandIcon, StatusIcon, ToggleButton, Checkbox, Eyebrow
- [x] 2026-04-13 — Centralizacao: menu-items.ts, storage-keys.ts, share-url.ts
- [x] 2026-04-13 — Vercel: staging.maosfalam.com → develop, coming soon via env var

## DONE (sessao 2026-04-11)

- [x] 2026-04-11 — v1.0-v1.2 completas (17 fases)
- [x] 2026-04-11 — Infra: Git branching, Neon branching, Vercel staging+prod
