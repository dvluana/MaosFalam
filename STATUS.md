# STATUS

Ultima atualizacao: 2026-04-08 (Sprint 1: Landing migrada pra React + integracao com fluxo de leitura, build verde 30 rotas)

## Estado atual

Sprint: 1 (Landing + Manifesto) — quase fechado, manifesto pendente
Branch: main

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
