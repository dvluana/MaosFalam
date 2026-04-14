# STATUS

Ultima atualizacao: 2026-04-14 (milestone v2 em progresso — pagamento funcional, bugs corrigidos)

## Estado atual

Branch: develop (trabalho ativo)
Build: green (type-check + lint + build + 161 tests)
Banco: Neon develop branch com 5 tabelas + CHECK constraint remaining >= 0
Auth: Clerk v7 (Google OAuth + email/senha, telas custom com useSignIn/useSignUp legacy)
Deploy: staging.maosfalam.com (Vercel preview, branch develop)
Producao: maosfalam.com (em breve)
Pagamento: AbacatePay v2 sandbox integrado (checkout hosted, PIX + cartao)
Email: Resend templates prontos (aguardando RESEND_API_KEY + dominio verificado)

## Milestones completos

### v1.0 Backend MVP (7 fases)

- Neon+Prisma, Clerk, GPT-4o, 9 API routes, client adapters, front-back wiring

### v1.1 Alinhamento Arquitetural (5 fases)

- Auditoria codebase, ReadingContext unificado, MediaPipe real, Clerk cleanup, docs sync

### v1.2 Fluxo de Mao Dominante (5 fases)

- Camera UI, upload pipeline, edge cases, outra pessoa + a11y, pipeline refactor

### v1.3 Sistema de Creditos Robusto (6 fases, 21 reqs)

- Transacao atomica, CHECK constraint, raw SQL debit race-safe, CreditGate removido, logging hardened

### v2 Monetizacao (4 fases, 19 reqs) — em finalizacao

- AbacatePay v2: wrapper migrado, 4 produtos criados, checkout hosted, webhook checkout.completed
- Frontend: /creditos com API real, redirect pro AbacatePay, CPF validation, UpsellSection funcional
- Email: templates redesenhados (pagamento confirmado, boas-vindas, leitura pronta), retry, opt-in check
- Bug fixes: acentuacao (40+ fixes), camera handedness, revelacao responsiva, manifesto contraste, login error handling

### Post-v2 Bug Sweep (sessao 2026-04-14)

- Env vars Vercel limpas (\\n no final causava 500)
- Proxy.ts: API routes retornam 401 JSON em vez de 307 redirect
- /creditos: UX simplificado (botao direto no card, sem secao separada)
- Upsell: redirect pra /creditos em vez de API inexistente
- Nome vazio "Pra mim": validacao + fallback
- Gender markers no template (corrige genero errado)
- Menu numbering sequencial (04→05)
- Copyright 2025→2026
- sessionStorage name override: API target_name prioritario
- Card pula posicao: spinner sem mudar texto
- Manifesto: z-index fix no vignette overlay
- Login email/senha: handle needs_first_factor + mensagens especificas
- Home: cortinas, lampada Edison, cursor cristal desativados (comentados)
- Dados orfaos limpos no banco (9 payments, 5 credit_packs)
- 22 testes E2E automatizados (18 PASS, 4 WARNING)

## Infra

- Git: main (protegida) + develop (trabalho)
- Neon: main (prod) + develop (dev) — project steep-bread-93583259
- Vercel: staging.maosfalam.com (develop) + maosfalam.com (main)
- AbacatePay: 4 produtos sandbox (mf_avulsa, mf_dupla, mf_roda, mf_tsara)
- Webhook AbacatePay: checkout.completed → staging.maosfalam.com/api/webhook/abacatepay
- Env vars separadas por environment (production vs preview)

## Decisoes tecnicas

- [2026-04-14] AbacatePay v2: checkout hosted (redirect), nao transparent (PIX QR local)
- [2026-04-14] Produtos como entidades no AbacatePay, referenciados por externalId com cache lazy
- [2026-04-14] Webhook signature: chave publica fixa HMAC-SHA256 base64 (nao env var)
- [2026-04-14] Payment criado FIRST (pending), checkout com externalId=payment.id
- [2026-04-14] CPF so no primeiro pagamento, gravado em user_profiles
- [2026-04-14] Emails: API key guard + 1x retry, fire-and-forget, nunca bloqueia fluxo
- [2026-04-14] Clerk webhook user.created pra email de boas-vindas (svix signature)
- [2026-04-14] Proxy.ts: API routes sem auth retornam 401 JSON, page routes redirect pro Clerk
- [2026-04-13] Transacao atomica no /api/reading/capture
- [2026-04-13] debitCreditFIFO usa raw SQL UPDATE SET remaining = remaining - 1 WHERE remaining > 0
- [2026-04-13] temperature: 0 no GPT-4o
- [2026-04-11] photo-store.ts: singleton module-level substitui sessionStorage pra foto
- [2026-04-11] useSyncExternalStore pra useCredits

## Pendente

- Clerk Dashboard: mudar nome "PariTech" pra "MaosFalam", remover Facebook OAuth (so Google)
- Clerk legacy migration (@clerk/nextjs/legacy → @clerk/nextjs, API signal incompativel)
- Share card vazio (design issue)
- Configurar RESEND_API_KEY + verificar dominio maosfalam.com.br no Resend
- Configurar CLERK_WEBHOOK_SECRET no Vercel (pra email de boas-vindas)
