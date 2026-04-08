# TODO

Claude: leia este arquivo no inicio de cada sessao. Quando completar uma tarefa, mova pra DONE com a data. Quando identificar subtarefas, adicione aqui.

## AGORA (Sprint 1 fechamento)

- [ ] Migrar manifesto.html pra src/app/manifesto/page.tsx (ainda servido estatico via proxy)
- [ ] Remover rewrite de /manifesto do src/proxy.ts apos migracao
- [ ] Deletar public/manifesto.html apos migracao
- [ ] Definir comportamento do Menu pra usuario logado (mostrar "Minhas leituras" / "Sair"?)
- [ ] Verificar redirect pos-login (outro chat — pra qual rota o useAuth manda?)

## PROXIMO (Sprint 2+)

## BACKLOG (Sprint 2+)

- [ ] Sprint 4: Backend captura + IA
- [ ] Sprint 5: Motor de leitura (blocos)
- [ ] Sprint 6: Pagamento + Auth
- [ ] Sprint 7: Polish + Launch
- [ ] Integrar MediaPipe real na tela /ler/camera
- [ ] Implementar upload manual funcional no fallback
- [ ] Geracao real da share image (canvas/OG)
- [ ] Decidir destino da pasta /src/app/preview/* (deletar ou gitignore antes do deploy)
- [ ] Adicionar `cursor: none` no wrapper da landing pra esconder cursor nativo do CrystalCursor (sem vazar pras outras paginas)

## DONE

- [x] 2026-04-08 — Sprint 0: Setup Next.js 16 + Tailwind v4 + tipos + mocks + useMock + ESLint no-console + Vitest config + build verde
- [x] 2026-04-08 — Sprint 1 (landing): 13 componentes React migrados (LunarClock, Menu, Nav, HeroTitle, VideoHero, CrystalCursor, SceneVignette, Smoke, Constellation, Grain, Curtains, EdisonLamp, LogoReveal) + HomeLanding maestro
- [x] 2026-04-08 — /src/app/page.tsx renderizando HomeLanding nativo, public/home.html deletado, proxy reduzido a /manifesto
- [x] 2026-04-08 — HeroCTA "Mostre sua mao" -> /ler/toque integrando home com funil
- [x] 2026-04-08 — Menu expandido com Login + Criar conta + Manifesto, suporta items arbitrarios via CSS variable
- [x] 2026-04-08 — AudioToggle removido (sem audio na landing)
- [x] 2026-04-08 — Pasta /src/app/preview/ com 10 playgrounds isolados de componentes da landing
- [x] 2026-04-08 — /creditos com 9 estados (default, pix, card, processing, success, 3 erros, requires_login) + StateSwitcher

- [2026-04-08] Primitivos UI /src/components/ui/ (Button, Card, Badge, Toast, Input, Separator, ProgressBar, StateSwitcher) com corner ornaments + grain
- [2026-04-08] CSS auxiliar em globals.css (branded-radius, corner-ornaments, grain-texture)
- [2026-04-08] Teste Vitest pra Button
- [2026-04-08] Sprint 2: Funil de leitura com mocks (/ler/toque, /ler/camera, /ler/scan, /ler/revelacao, /ler/erro)
- [2026-04-08] Sprint 3: Telas de resultado free (/ler/resultado/[id]), completo (/ler/resultado/[id]/completo), share preview (/ler/resultado/[id]/share)
- [2026-04-08] Componentes reading (HandTouch, ElementSection, ReadingSection, BlurredCard, UpsellSection, ShareButton) + camera (HandOverlay, CameraFeedback)
- [2026-04-08] Bloco 2: Share publico /compartilhar/[token] com estados valid_free/valid_premium/expired/not_found + generateMetadata OG dinamica
- [2026-04-08] Bloco 6: not-found global + OfflineDetector integrado no layout
- [2026-04-08] Bloco 3: Autenticacao mockada (useAuth via localStorage) + telas /login, /registro, /esqueci-senha, /redefinir-senha/[token] com todos os estados
- [2026-04-08] Bloco 4: Area logada mockada — /conta/layout, /conta/leituras, /conta/leituras/[id], /conta/creditos, /conta/perfil, /ler/nova + mocks/user.json + components/account/ReadingCard
