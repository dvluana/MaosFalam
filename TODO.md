# TODO

Claude: leia este arquivo no inicio de cada sessao. Quando completar uma tarefa, mova pra DONE com a data. Quando identificar subtarefas, adicione aqui.

## Sprint 3b DONE — gaps de fluxo e navegação

- [2026-04-08] Upload handler em `/ler/camera` (dead-end fix)
- [2026-04-08] Credit guard no `/ler/revelacao` (logada + credits > 0 → /completo)
- [2026-04-08] Payment context: `UpsellSection` + `/creditos` redirect de volta pra reading
- [2026-04-08] `/ler/nome` pre-fill pra logada
- [2026-04-08] Menu auth-aware no PageHeader (GUEST_ITEMS / LOGGED_ITEMS)
- [2026-04-08] CTA "Ler outra mão" no `/completo` footer
- [2026-04-08] CTA `/compartilhar/[token]` → `/ler/nome` (3 ocorrências)
- [2026-04-08] `/ler/nova` deletada, fluxo logado unificado via `/ler/nome` → `/ler/toque`
- [2026-04-08] `BuyCreditsModal` em `/conta/leituras` (comprar inline sem sair da área logada)
- [2026-04-08] `/conta/creditos` deletada, saldo agora vive no `CreditsBanner` dentro de `/conta/leituras`
- [2026-04-08] `/conta/perfil` simplificado (só nome + senha, sem excluir conta)
- [2026-04-08] Deck de tarot na `/conta/leituras` + toggle Cartas/Lista (default Lista)
- [2026-04-08] Padronização `max-w-xl px-5` em todas páginas `/conta/*` e `conta/layout`

## Frontend pendente (Sprint 3c: polimento + edge cases)

### Alta prioridade (quebra ou atrapalha o fluxo)

- [x] 2026-04-10 — `/ler/camera` upload com UploadPreview (preview, validacao formato/tamanho, confirmacao)
- [x] 2026-04-10 — `/ler/resultado/[id]` guard pra id inexistente (tela InvalidReading com CTA)
- [x] 2026-04-10 — `/conta/leituras/[id]` guard pra id inválido (já tinha notFound())
- [x] 2026-04-10 — `/ler/camera` guard de `maosfalam_name_fresh` (redirect pra /ler/nome)
- [x] 2026-04-10 — `HeroCTA` corrigido pra `/ler/nome`
- [x] 2026-04-10 — `Menu.tsx` DEFAULT_ITEMS corrigido pra `/ler/nome`
- [x] 2026-04-10 — `user.json` mock enriquecido: r-001 e r-002 com tagline, body_extras, cigana_quotes, technical, intimacy

### Média prioridade (UX/visual incompleto)

- [x] 2026-04-10 — Share card canvas real (PNG via Canvas API + Web Share API com fallback)
- [ ] `/ler/erro` estado `api_error`: campo "notificar quando voltar" não salva em lugar nenhum
- [ ] `/redefinir-senha/[token]` success não faz auto-login (joga pra `/login`)
- [x] 2026-04-10 — Logout com confirmacao inline ("Tem certeza?" + Sim/Cancelar)
- [x] 2026-04-10 — Feedback visual PIX copiado (checkmark + "Copiado" por 2s)
- [ ] Sub-nav do `/conta/layout` com só 2 items fica visualmente fraco — virar breadcrumb ou sumir
- [ ] `OfflineDetector` com design cru, revisar pra casar com resto do DS
- [ ] `/not-found` só texto, podia ter linguagem visual do resultado
- [ ] Loading fallbacks dos `<Suspense>` são só "Um momento..." em Cormorant — trocar por skeleton visual
- [x] 2026-04-10 — `/manifesto` migrado pra React (server component + 3 client components). Proxy marcado pra remover.

### Baixa prioridade (edge cases, limpeza, testes)

- [ ] `/ler/scan` estados `scan_failed_low_confidence` / `scan_failed_api_error` só via StateSwitcher — sem condição real
- [ ] Permission checks reais da câmera (`camera_permission_denied`, `camera_permission_denied_permanent`) — implementar `navigator.mediaDevices.getUserMedia` real
- [ ] Error boundaries — zero implementados. Qualquer componente que quebra explode a página
- [ ] Toast global — só existe inline em cada página, falta provider central
- [ ] `BlurredDeck` revisar se faz sentido no /completo também (hoje só renderiza no free)
- [ ] Console.logs e comentários de debug espalhados — varredura final
- [x] 2026-04-10 — `/src/app/preview/*` isolado com `src/app/preview/layout.tsx` e bloqueado em production via `notFound()`
- [ ] `cursor: none` no wrapper da landing pra esconder cursor nativo do CrystalCursor sem vazar pras outras rotas

### Acessibilidade + responsivo

- [x] 2026-04-10 — Focus states visíveis (focus-visible:ring) em Button (all variants), BlurredDeck, TarotCard (CSS module)
- [x] 2026-04-10 — Aria labels: ShareButton, BlurredDeck, ProgressBar (role=progressbar + aria-valuenow/min/max), TarotCard (já tinha)
- [x] 2026-04-10 — Respeitar `prefers-reduced-motion` (globals.css + TarotCard.module.css)
- [ ] Auditoria de a11y restante (contraste, breakpoints ≥1024px)
- [ ] Revisar breakpoints ≥1024px (só testei em 375-768px)

### Testes

- [ ] Cobertura Vitest pra componentes críticos (hoje só tem Button.test)
- [ ] Playwright configurado mas zero spec — E2E dos fluxos críticos:
  - Visitor: landing → /ler/nome → toque → camera → scan → revelação → resultado free → upsell → creditos
  - Logada: login → /conta/leituras → fazer nova leitura → revelação → /completo
  - Share: abrir /compartilhar/[token] nos 4 estados

### Performance

- [ ] Análise de bundle (next build mostra tamanhos, mas não pesei componentes)
- [ ] Profiling de animações em mobile low-end (fire atmosphere + glyphs + rings rotativos rodam simultaneamente)
- [ ] Considerar lazy load de componentes pesados (ElementGlyph + ElementAtmosphere só precisam no resultado)

## AGORA (Sprint 4: Backend + integrações reais)

- [ ] Migrar manifesto.html pra src/app/manifesto/page.tsx (ainda servido estatico via proxy)
- [ ] Remover rewrite de /manifesto do src/proxy.ts apos migracao
- [ ] Deletar public/manifesto.html apos migracao
- [ ] Integrar MediaPipe real na tela /ler/camera (hoje simula com setTimeout encadeado)
- [ ] Implementar upload manual funcional no fallback da camera
- [ ] Backend captura + API de visão multimodal (retornar JSON de atributos da mão)
- [ ] Motor de leitura: consumir blocks.md como banco de conteúdo + cruzar com atributos + montar report dinâmico
- [ ] Google OAuth real no modal de login (hoje mock com setTimeout 1.4s)
- [ ] AbacatePay real no /creditos (hoje os 9 estados são mocks)
- [ ] Geração real da share image (canvas/OG dinâmica em /api/share/[token]/og)
- [ ] Definir comportamento do Menu pra usuario logado (mostrar "Minhas leituras" / "Sair"?)
- [ ] Verificar redirect pos-login

## BACKLOG

- [x] 2026-04-10 — previews mantidos como playground dev-only e removidos da superficie de producao
- [ ] Adicionar `cursor: none` no wrapper da landing pra esconder cursor nativo do CrystalCursor
- [ ] Polish + Launch
- [ ] Revisar copy final de todas as telas com o banco real de blocks
- [ ] Testes E2E dos fluxos críticos (toque → camera → scan → resultado; checkout)
- [ ] Auditoria de acessibilidade

## DONE

- [x] 2026-04-10 — FASE 4: Adapt reading components to v2 ReportJSON interface. reading.ts re-exports from report.ts. ReadingSection, ReadingOverview, ElementHero, HandSummary, BlurredCard, BlurredDeck, CompatibilityGrid, ElementSection rewritten for v2 props. New components: TransitionLine, VenusSection. Old build-reading.ts deleted (replaced by selectBlocks). user.json mock regenerated via selectBlocks. All pages (completo, free, share, revelacao, conta/leituras) adapted. proxy.ts removed (Next 16 conflict). Build + type-check green.
- [x] 2026-04-10 — Creditos nao expiram mais — remover expires_at dos mocks e telas (front part only: removido UI de expiracao de creditos do CreditsBanner e variantes expiring_soon/expired dos reading cards)
- [x] 2026-04-10 — Links publicos nao expiram — remover share_expires_at (front part only: removido logica de expiracao de share links dos reading cards, adicionado comment no /compartilhar/[token] que "expired" state e so pra dev preview)
- [x] 2026-04-08 — Feature Taro gratuita: /tarot page com 4 estados (intro → picking → revealing → cta), 22 Arcanos Maiores em tarot-cards.json na voz da cigana (upright/reversed/past/present/future por carta), componentes TarotCard (flip 3D 5:7 + frente com imagem + costas dourada com losango), TarotDeck (stack + fan arco 90°), TarotReading (reveals sequenciais 400/1400/2400ms), TarotShareCard (card compartilhavel 360px). 22 imagens movidas de assets/{subfolder}/\*\_2x.webp pra public/tarot/{slug}.webp flat, subpastas deletadas. 50% chance de carta invertida. Item "Taro" adicionado ao Menu entre "Mostre sua mao" e "Entrar" (agora 6 items). Build verde, /tarot como rota estatica prerenderizada.
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

## Sprint 3 DONE — refinamento + bíblia da mão

- [2026-04-08] /ler/nome: gate do nome com flags sessionStorage + bug StrictMode double-run fix com useRef guard
- [2026-04-08] /ler/toque reescrito: HandTouch removido, esfera branca pressure-hold (180px radial gradient, anel SVG de progresso, vibração haptic, 2.4s charge, scale 1→1.35→1.6→fade)
- [2026-04-08] /ler/camera: HandOverlay removido, moldura 3:4 vazia com corner accents animados + crosshair + scan line
- [2026-04-08] /ler/revelacao: carta de tarot com flip 3D (rotateY -180→0 perspective 1200px), moldura dupla, numeral romano, shine sweep, borda pulsante, partículas de luz, typewriter após flip, botão fora do card
- [2026-04-08] /ler/scan + /ler/nome: linguagem visual unificada (eyebrow + linhas laterais + Cormorant italic grande)
- [2026-04-08] ElementHero: fala fluída cigana com nome do elemento como clímax, sem aspas, aberturas por elemento ("Suas mãos queimam, {n}. Eu sei antes de olhar que seu elemento é → FOGO")
- [2026-04-08] ElementGlyph com efeitos por elemento (brasas fire, ondas water, poeira earth, vento air via SVG animate)
- [2026-04-08] ElementAtmosphere animada atrás do h1 com mask radial pra fade nas bordas; fire suavizado (6 brasas, sem fogueira)
- [2026-04-08] ReadingOverview "O que eu vi na sua mão" — capitular na primeira letra, parágrafos divididos, aberturas por elemento
- [2026-04-08] ReadingSection estendido: LineGlyph no header (batimento heart, espiral head, árvore life, seta fate) + tagline + fluxo body/body_extras/cigana_quotes intercalados + TechnicalStrip rodapé
- [2026-04-08] Componentes novos: LineGlyph, MountGlyph, RareSignGlyph, CompatibilityGlyph, CrossingGlyph, SectionDivider, TechnicalStrip, MeasurementBar (reusável ticks+fill+agulha), CompatibilityGrid, HandSummary, ReadingOverview, ElementAtmosphere, BlurredDeck, ResultStateSwitcher
- [2026-04-08] /completo reescrito: HandSummary (retrato com 3 barras de medição) + SectionDivider numerado entre linhas + seção intimacy + CompatibilityGrid + Montes com MountGlyph + CrossingGlyph + RareSignGlyph
- [2026-04-08] BlurredDeck: as 3 linhas seladas viram baralho empilhado com hover fan + click expand (Framer Motion spring)
- [2026-04-08] TechnicalStrip virou painel "MEDIÇÃO DA PALMA" com grid 2-col + MeasurementBar + parser toSentenceCase pra converter CAPS do mock ("LONGA, TERMINA NO MONTE DE JÚPITER" → "Longa, termina no Monte de Júpiter")
- [2026-04-08] /creditos com storytelling humanizado (Avulsa/Dupla/Roda/Tsara) + virou deck de tarot navegável (setas, swipe, dots, peeks laterais)
- [2026-04-08] Modal requires_login redesenhado: backdrop-blur fullscreen + card estilo tarot + botão Google único com SVG oficial + loading state; formulário email/senha removido
- [2026-04-08] Mocks water/earth/air expandidos com paridade ao fire (~247 linhas cada): stats, 4 sections com tagline/body_extras/cigana_quotes/technical, 6 mounts detalhados, compatibility, intimacy
- [2026-04-08] Types estendidos: ReadingSection com tagline/body_extras/cigana_quotes/technical opcionais; ReadingReport com stats/compatibility/intimacy; MountDetail com strength/word/planet_symbol/cigana_quote
- [2026-04-08] Noise sutil nos cards via classe .card-noise (2 camadas SVG feTurbulence: manchas multiply + grão ember screen) em ::before/::after z-index -1 + isolation isolate
- [2026-04-08] Sweep de fontes: JetBrains labels 7-8px → 9.5-10px com tracking 1.5-1.8px + cor gold brilhante
- [2026-04-08] Impact phrases e cigana quotes: text-bone com text-shadow colorido (era text-violet/text-rose com baixo contraste)
- [2026-04-08] Input: placeholder em Raleway regular + label em JetBrains gold (era Cormorant italic ilegível)
- [2026-04-08] velvet-bg aplicada em auth/conta/creditos (body segue bg-black)
- [2026-04-08] PageHeader global reusando logo da landing com grid max-w-xl próprio
- [2026-04-08] useAuth com useEffect hydration + evento custom maosfalam:auth pra sync cross-componente (era lazy init que não rehidratava)
- [2026-04-08] Commit 93562e1 "feat: scaffold completo do webapp MaosFalam" pushed pra origin/main (147 arquivos)
