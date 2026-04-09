# STATUS

Ultima atualizacao: 2026-04-08 (Feature Taro: /tarot gratuito com 22 Arcanos Maiores, 4 estados, componentes isolados. Build verde 31 rotas. Segundo funil de entrada pronto.)

## Feature Taro (segundo funil, 100% client-side)

- `/src/app/tarot/page.tsx` com 4 estados sequenciais: intro (deck empilhado + botao Embaralhar), picking (leque de 22 em arco 90° + guia de escolha por posicao + 3 dots de progresso), revealing (3 cartas com flip sequencial 400/1400/2400ms + keywords + interpretacao especifica da posicao + frase final), CTA pos-leitura (3 botoes: "Me mostre sua mao" → `/ler/toque`, "Compartilhar", "Tirar de novo")
- 22 cartas dos Arcanos Maiores em `/src/mocks/tarot-cards.json` com estrutura completa: id, numeral, name, slug, image, keywords (3), reading.upright, reading.reversed, reading.past, reading.present, reading.future. Todos os textos na voz da cigana (2a pessoa, sem hedging, sem cliche esoterico, nomenclatura real de tarot).
- 22 imagens movidas de `/assets/{subfolder}/*_2x.webp` pra `/public/tarot/{slug}.webp` flat. Subpastas removidas. Slug de cada carta bate com o numeral (louco, mago, sacerdotisa, imperatriz, imperador, hierofante, amantes, carro, forca, eremita, rodafortuna, justica, enforcado, morte, temperanca, diabo, torre, estrela, lua, sol, julgamento, mundo).
- Componentes: `TarotCard` (aspect 5:7, frente com Image fill + cantos dourados + numeral topo + faixa inferior com nome; costas com losango central geometrico + corner ornaments + pattern xadrez dourado + label MãosFalam; flip 3D rotateY preserve-3d 0.9s cubic-bezier; prop faceUp/reversed/dimmed/highlighted/hideFront), `TarotDeck` (modo stack com 6 cartas sobrepostas com rotate sutil; modo fan com arco de 90° e transform-origin embaixo), `TarotReading` (grid 3 col desktop / 1 col mobile com reveals cascateados + finalPhrase condicional baseada em all upright/reversed/mix), `TarotShareCard` (card compartilhavel 360px com 3 mini cards + frase + footer MãosFalam).
- Randomizacao: Fisher-Yates shuffle no deck a cada intro, posicao sorteada pela ordem de escolha (1a = past, 2a = present, 3a = future), 50% de chance de cada carta sair invertida (rotate 180° na imagem + label "· Invertida ·" em rose + usa reading.reversed). Zero backend, Math.random no client.
- Vibracao haptic de 8ms no pick pra confirmar toque no mobile.
- Menu da landing expandido: agora tem 6 items com "Taro" entre "Mostre sua mao" e "Entrar" pra dar visibilidade pro funil gratuito.

Ultima atualizacao anterior: 2026-04-08 (Sprint 3b: gaps de fluxo e navegação resolvidos. Build verde.)

## Sprint 3b — gaps de fluxo resolvidos

Análise dos fluxos identificou 18 problemas. Os 8 críticos/importantes corrigidos:

1. Upload de foto (`/ler/camera` fallback) deixou de ser dead-end — `onChange` do file input flasha captura + pusha pra `/ler/scan`
2. Credit guard no `/ler/revelacao`: logada só vai pra `/completo` se tiver créditos (checa `mockUser.credits > 0`), senão cai no free. TODO backend: debitar crédito real via POST /api/readings
3. Payment context preservado: `UpsellSection` salva reading id em `sessionStorage.maosfalam_pending_reading`; após `payment_success`, `/creditos` redireciona de volta pra `/ler/resultado/{id}/completo`
4. `/ler/nome` pre-fill pra logada (useAuth() popula nome/email)
5. Menu auth-aware no `PageHeader`: items mudam conforme estado de auth. Visitante vê Início/Mostre sua mão/Entrar/Criar conta/Manifesto. Logada vê Início/Minhas leituras/Nova leitura/Perfil/Manifesto
6. CTA "Ler outra mão" no footer do `/completo`: limpa flag `name_fresh` e manda pra `/ler/nome`
7. CTA do `/compartilhar/[token]` troca `/` por `/ler/nome`
8. `GUEST_ITEMS` do PageHeader aponta "Mostre sua mão" pra `/ler/nome` (passa pelo gate de nome)

Gaps menores pendentes (não bloqueantes): manifesto ainda HTML, permission checks reais, debitação real de créditos, auto-login pós reset senha, confirmação de logout, enrichment do user.json mock.


## Estado atual

Sprint: 3 (refinamento + bíblia da mão) — fechado
Branch: main (sincronizada com origin)

## Sprint 3 — resumo

### Hero do resultado + bíblia da mão
- ElementHero reescrito: fala fluída cigana com nome do elemento como clímax ("Suas mãos queimam, Luana. Eu sei antes de olhar que seu elemento é → FOGO"), sem aspas no impact, sem "Luana." prefixado
- ElementGlyph com efeitos por elemento (brasas fire, ondas water, poeira earth, vento air)
- ElementAtmosphere animada atrás do h1, com mask radial pra fade nas bordas (fogo suavizado depois de iterações)
- ReadingOverview "O que eu vi na sua mão" — capitular + parágrafos
- ReadingSection estendido: LineGlyph (batimento/espiral/árvore/seta) no header + tagline + body intercalado com body_extras + cigana_quotes em blocos com borda lateral + TechnicalStrip no rodapé
- /completo como bíblia: HandSummary (retrato + métricas em barras de medição) + SectionDivider numerado entre linhas + seção intimacy "Na cama" + CompatibilityGrid com CompatibilityGlyph por par (Faísca/Vapor/Fundação/etc) + Montes com MountGlyph + barra de força + quote + CrossingGlyph nos cruzamentos + RareSignGlyph nos sinais raros

### 4 mocks com paridade completa
- fire/Marina: Mercúrio dominante, 18% rarity, Coração reto longo
- water/Camila: Lua dominante, 22% rarity, Coração curvado
- earth/Beatriz: Saturno dominante, 31% rarity, Coração medido reto
- air/Helena: Mercúrio dominante, 14% rarity (mais raro), 3 sinais raros, Destino triplo
- Cada um ~247 linhas: stats + 4 sections com tagline/body_extras/cigana_quotes/technical + 6 mounts detalhados + crosses + rare_signs + compatibility + intimacy

### Componentes novos
LineGlyph, MountGlyph, RareSignGlyph, CompatibilityGlyph, CrossingGlyph, SectionDivider, TechnicalStrip (painel de medição com parse CAPS→sentence case), MeasurementBar (ticks + fill + agulha rotada), CompatibilityGrid, HandSummary, ReadingOverview, ElementAtmosphere, BlurredDeck (baralho empilhado com hover fan + click expand), ResultStateSwitcher (dev-only: trocar elemento + tier no canto)

### Funil de leitura reescrito
- /ler/toque: sumiu a HandTouch. Virou **esfera branca pressure-hold** (180px radial gradient, anel SVG de progresso, 2.4s press-and-hold, vibração haptic, scale 1→1.35→1.6→fade out)
- /ler/camera: sumiu HandOverlay. Moldura 3:4 vazia com corner accents animados + crosshair + scan line em loop
- /ler/revelacao: virou **carta de tarot com flip 3D** (rotateY -180→0 com perspective 1200px + preserve-3d). Aspect 5:7, moldura dupla ornamental, numeral romano "I · A Verdade", shine sweep diagonal após flip, borda pulsante após digitação, partículas de luz subindo. Typewriter só inicia depois do flip. Botão Continuar fora do card.
- /ler/nome: gate do nome com flag maosfalam_name_fresh. Bug de StrictMode double-run corrigido com useRef guard
- Funil inteiro com linguagem visual unificada: eyebrow JetBrains gold + linhas laterais + radial atmosphere sutil

### Créditos
- Storytelling humanizado por pacote: Avulsa (pra você sozinha), Dupla (pra você e quem te importa), Roda (pra fechar o círculo), Tsara (pra quando é festa)
- Pacotes viraram **deck de tarot navegável**: 1 carta por vez, setas laterais, swipe Framer Motion drag, dots retangulares, peeks laterais. Click → scrollIntoView('#pagamento')
- Modal requires_login redesenhado: backdrop fullscreen com backdrop-blur, card estilo tarot, botão único Google (SVG oficial 4 cores) com loading, formulário email/senha removido (vai pro checkout)

### Polimento UI
- Noise sutil nos cards: classe `.card-noise` com 2 camadas SVG feTurbulence (manchas multiply + grão ember screen) via ::before/::after em z-index -1 com isolation isolate
- Sweep de fontes: JetBrains labels 7-8px → 9.5-10px com tracking reduzido (1.5-1.8px) + cor gold brilhante (era gold-dim)
- Impact phrases e cigana quotes mudadas de text-violet/text-rose (baixo contraste) pra text-bone com text-shadow colorido (carrega identidade via halo)
- Input placeholder em Raleway regular (era Cormorant italic ilegível) + label JetBrains gold
- Cards com gap-8 pra respiração (era gap-[2px])
- Headers com linguagem visual consistente (eyebrow + linhas + losango ornamental)
- Tipografia unificada: Cinzel nomes/headings, Cormorant italic cigana voice, Raleway body/UI, JetBrains mono labels/data

### Git
- Commit 93562e1 "feat: scaffold completo do webapp MaosFalam" pushed pra origin/main
- 147 arquivos (scaffold inteiro do Next.js + componentes + docs + mocks)
- Working tree limpo, branch sincronizada

## Feito

- [x] Setup Next.js 16 + TypeScript strict + Tailwind v4
- [x] Fontes configuradas (Cinzel, Cormorant, Raleway, JetBrains, Cinzel Decorative via next/font)
- [x] Cores da marca via @theme em globals.css (Tailwind v4, sem tailwind.config.ts)
- [x] Mocks criados (reading-fire.json, reading-water.json)
- [x] Hook useMock()
- [x] Tipos TypeScript (Reading, User, Report, HandElement)
- [x] Landing inteira migrada de HTML estatico pra componentes React (13 componentes em /src/components/landing/)
- [x] HomeLanding maestro compondo a landing inteira
- [x] /src/app/page.tsx ativo renderizando HomeLanding
- [x] Proxy reduzido a /manifesto apenas (rewrite legado)
- [x] public/home.html deletado
- [x] Integracao home <-> fluxo de leitura: HeroCTA "Mostre sua mao" leva pra /ler/toque
- [x] Menu expandido com Login + Criar conta + Manifesto + Mostre sua mao

## Em andamento

Nenhum.

## Bloqueios

Nenhum.

## Decisoes tecnicas

- [2026-04-08] DS primitivos criados como funcoes + default export em /src/components/ui/. Corner ornaments via classe utilitaria global .corner-ornaments (pseudo-elements ::before/::after) aplicada aos componentes branded. Grain via classe .grain-texture com SVG feTurbulence inline data-uri.
- [2026-04-08] Telas do funil usam mock reading-fire via useMock. Camera simula MediaPipe via setTimeout encadeado (MVP visual), integração real fica pra Sprint 4. StateSwitcher dev-only (hidden em production) habilita navegacao manual entre estados via ?state=.
- [2026-04-08] Suspense boundaries adicionadas em paginas que usam useSearchParams (Next 16 requirement). Synchronization de state forçado via ?state= feita inline no render (padrão React 19 "adjust state during render") ao invés de useEffect, pra satisfazer regra react-hooks/set-state-in-effect.
- [2026-04-08] Parchment (bg-parchment) usado exclusivamente em reading/share cards; UI geral usa bg-deep/bg-black conforme DS.
- [2026-04-08] Share image download é mock (navigator.share + clipboard fallback). Geração real da imagem OG fica pra Sprint 7.
- [2026-04-08] /compartilhar/[token] resolve mock inline por token (abc123=free, premium=premium, expired=expired, outro=not_found). generateMetadata gera OG title/description dinamicos a partir do report. Server component puro, sem useMock.
- [2026-04-08] OfflineDetector usa navigator.onLine + listeners online/offline, renderiza overlay fixo fullscreen. Montado no root layout apos o grain SVG.
- [2026-04-08] Landing migrada com fidelidade visual: cada componente original (Curtains canvas, EdisonLamp + stage-dark, VideoHero+mandala, Constellation, Grain, Smoke, SceneVignette, CrystalCursor, Nav, Menu, LunarClock, HeroTitle typewriter, LogoReveal) virou Client Component React com CSS Module proprio. Tokens @theme do Tailwind v4 usados em vez de variaveis hardcoded do CSS legado.
- [2026-04-08] HomeLanding compoe os 13 componentes na ordem certa de empilhamento. Cada componente tem sua propria timeline interna que casa com o reveal original (defaults batem com os setTimeouts antigos: lamp 800/1800/2400/5000ms, curtains 2200/7200/8500ms, logo 3200/4600/5200/6100ms, nav+clock visiveis a t=6200ms).
- [2026-04-08] Menu agora suporta numero arbitrario de items via CSS variable --menu-item-delay setada inline (substituiu :nth-child hardcoded). Items default: Inicio, Mostre sua mao (->/ler/toque), Entrar (->/login), Criar conta (->/registro), Manifesto.
- [2026-04-08] HeroCTA substitui o "Em Breve" do legado. Porta exatamente o .cta-btn (gradiente roxo + animacao btnCrystal 7s + ornamentos dourados) com label "Mostre sua mao" e Link pra /ler/toque. Aparece com fade-in apos 9s pra nao competir com o typewriter.
- [2026-04-08] Pasta /src/app/preview/ criada como playground de componentes isolados (lunar-clock, menu, nav, hero-title, video-hero, crystal-cursor, atmosphere, canvas-fx, curtains, edison-lamp). Dev-only — pode ser deletada ou gitignorada antes do deploy.
- [2026-04-08] Proxy do Next 16 (src/proxy.ts) agora so faz rewrite de /manifesto -> /manifesto.html. A / virou rota nativa via page.tsx. AudioToggle removido a pedido (sem audio na landing).
