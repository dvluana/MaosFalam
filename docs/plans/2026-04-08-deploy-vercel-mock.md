# Deploy Vercel — Protótipo Navegável Mockado

Data: 2026-04-08
Status: plano aprovado, pendente execução

## Objetivo

Subir MaosFalam na Vercel como protótipo 100% mockado. Qualquer click avança. Nada trava, nada pede dado real. Fluxo de leitura (tirar foto OU enviar foto → próxima etapa). Login aceita qualquer email/senha. Pagamento sempre aprova.

## Premissas confirmadas

- Mock sempre (ignora câmera real)
- Corrigir tarô (não remover)
- Vercel CLI já instalada (`/opt/homebrew/bin/vercel`, v50.13.2)
- Deploy como projeto novo via `vercel --prod`

## Escopo de mocks

1. **Câmera** (`/ler/camera`) — botões "Tirar foto" e "Enviar foto" vão direto pra `/ler/scan`. Zero `getUserMedia`. Auto-skip em 1s se falhar.
2. **Scan → Revelação → Resultado** — já usa `buildMockReading('fire')`. Validar end-to-end.
3. **Login/Registro** — qualquer credencial vira sucesso. Google idem. User mock no localStorage.
4. **Créditos/Pagamento** — "Comprar"/"Pagar"/PIX "Já paguei" → sucesso imediato, saldo sobe no mock.
5. **Desbloqueio premium** — "Desbloquear completo" → `/completo` sem cobrar crédito.
6. **Área logada** — `/conta/*` usa mocks existentes. Só garantir nav limpa.

## Problemas a atacar antes do build

- **A**: Erros TS em `src/components/tarot/TarotCard.tsx` (conflito de `Image` JSX). Trocar import pra `next/image`.
- **B**: Lint errors pré-existentes (10x `react-hooks/set-state-in-effect`). Setar `eslint.ignoreDuringBuilds: true` no `next.config`, manter `typescript.ignoreBuildErrors: false`.
- **C**: Auditar `process.env.*` e stubar o que faltar.

## Entregáveis

1. `src/lib/mock-mode.ts` — flag central + helpers (`mockLogin`, `mockPayment`, etc)
2. Patches nos flows: camera, login, creditos, resultado/unlock
3. Fix TS do tarô
4. `next.config` ajustado
5. Deploy via `vercel --prod`
6. URL final pra testar

## Próximos passos (nova sessão)

1. Ler este plano
2. Criar `src/lib/mock-mode.ts`
3. Aplicar patches (camera → login → pagamento → unlock)
4. Corrigir `TarotCard.tsx`
5. Ajustar `next.config`
6. `npm run build` local pra validar
7. `vercel --prod` (pode pedir login interativo)
8. Retornar URL

## Handoff prompt sugerido

> Continua o deploy mockado na Vercel. Plano em `docs/plans/2026-04-08-deploy-vercel-mock.md`. Executa tudo.
