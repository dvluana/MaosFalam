# STATUS

Ultima atualizacao: 2026-04-11 (milestones v1.1 + v1.2 completos, pipeline refatorado, UI polish)

## Estado atual

Branch: develop (trabalho ativo)
Build: green (type-check + lint + 98 tests)
Banco: Neon develop branch com 5 tabelas (leads, user_profiles, readings, credit_packs, payments)
Auth: Clerk v7 (Google OAuth + email/senha, dark mode configurado)
Deploy: staging.maosfalam.com (Vercel preview, branch develop)
Producao: maosfalam.com (em breve)

## Milestones completos

### v1.0 Backend MVP (7 fases, 17 plans)

- Neon+Prisma, Clerk, GPT-4o, 9 API routes, client adapters, front-back wiring

### v1.1 Alinhamento Arquitetural (5 fases, 9 plans)

- Auditoria codebase (share_token, expires_at, NextAuth, R2 removidos)
- ReadingContext unificado + CreditGate + /ler/nome dual flow
- MediaPipe real (Hand Landmarker, auto-captura 1.5s, handedness, mirroring)
- Clerk cleanup (esqueci/redefinir-senha redirect, UserProfile)
- Docs sync (architecture.md e CLAUDE.md alinhados)

### v1.2 Fluxo de Mão Dominante (5 fases, 12 plans)

- Camera UI (HandExpectedBadge, WrongHandFeedback, landmarks real-time)
- Upload pipeline (instrução, validação progressiva, confirmação)
- Edge cases (HEIC, EXIF, compressão, landscape, retry, screenshot)
- Outra pessoa + A11y (camera/upload adaptam nome+mão, aria-labels)
- Pipeline refactor (photo-store module, race condition fix, element pre-hint GPT-4o)

## Infra

- Git: main (protegida) + develop (trabalho)
- Neon: main (prod) + develop (dev) — project steep-bread-93583259
- Vercel: staging.maosfalam.com (develop) + maosfalam.com (main)
- Env vars separadas por environment (production vs preview)
- PWA dinâmico (staging mostra "MãosFalam Staging")

## Bugs corrigidos nesta sessão

- Photo stale no sessionStorage → mesma leitura repetida (agora usa photo-store module-level)
- Race condition scan/API → scan navegava antes do GPT-4o responder (agora 3-effect gate)
- Camera permission timing → só aparecia ao trocar câmera (effect agora depende de state)
- useCredits infinite loop → 50+ req/s (agora useSyncExternalStore)
- Typewriter chars perdidos → re-mount duplicava chars (agora revealIdx counter)
- Hydration mismatch → useSyncExternalStore crashava em prod (removido)
- Landscape guard → bloqueava PC (agora só touch devices)
- crypto.randomUUID → falhava em HTTP inseguro (agora generateUUID com getRandomValues)

## UI melhorias nesta sessão

- Clerk dark mode (appearance config com DS colors)
- Camera loading state (spinner + "Preciso ver melhor...")
- /ler/nome modal card (corner ornaments, gold accent, "Já tenho conta")
- Input component redesenhado (bg-surface, bordered, mais contraste)
- Menu detecta auth na home (mostra items corretos pra logado/visitante)
- "Taro" → "Tarot Online", Manifesto removido do menu
- Login page limpa (sem "Voltou. Suas mãos não mudaram")
- Hero layout mobile-first (video centralizado, sem gap)
- CTA fixed bottom com safe-area e max-width
- LunarClock posicionado acima do CTA
- Video edges com mask-image blend
- Cortinas: stageDark dissolve mais cedo (cena clareia durante abertura)
- Typewriter fix (revealIdx em vez de append)
- Acentos corrigidos em 12+ arquivos

## Pendente

### Home layout (precisa refinamento visual)

- Video pode estar muito perto da lâmpada em alguns devices
- Testar em múltiplos tamanhos de tela
- Cortinas: verificar se clareamento progressivo ficou OK

### Manifesto

- 63 palavras sem acento no manifesto page

### Funcionalidades futuras

- AbacatePay pagamento real
- Resend email transacional
- Clerk OAuth inline (sem redirect pra tela separada)
- Upload: Clerk login direto no modal

## Decisoes tecnicas

- [2026-04-11] photo-store.ts: singleton module-level substitui sessionStorage pra foto. Sobrevive router.push, garbage-collected no refresh.
- [2026-04-11] Scan page 3-effect gate: Effect 1 (API), Effect 2 (animação), Effect 3 (gate navega quando ambos prontos).
- [2026-04-11] computeElementHint: calcula fire/water/earth/air via ratio palm/fingers dos landmarks MediaPipe. Enviado como element_hint pro GPT-4o.
- [2026-04-11] JPEG quality 0.82 (era 0.92) — 40% menor, sem perda visual pra palma.
- [2026-04-11] DrawingUtils do MediaPipe pra desenhar skeleton 21 pontos em real-time.
- [2026-04-11] useSyncExternalStore pra useCredits — evita loop infinito de objeto ref instável do useAuth().user.
- [2026-04-11] HeroTitle revealIdx counter em vez de char append — elimina bug de re-mount.
- [2026-04-11] generateUUID com crypto.getRandomValues — funciona em qualquer contexto (HTTP inseguro incluso).
