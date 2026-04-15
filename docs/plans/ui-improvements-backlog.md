# UI Improvements Backlog

> Itens reportados pela Luana em 2026-04-11. Priorizar no próximo milestone ou sessão.

## 1. Formulário /ler/nome — visual upgrade

- Inputs apagados, difíceis de ler
- Transformar em modal estilo CreditGate (card com corner ornaments, backdrop blur)
- Adicionar "Ou já tenho conta / Entrar" pra visitante (link pro login Clerk)
- Mais contraste nos inputs, placeholder visível

## 2. Loading state na câmera

- Delay entre clicar "tirar foto agora" e câmera aparecer (MediaPipe ~7.5MB loading)
- Adicionar loading visual com frase da cigana ("Preciso ver melhor...")
- Feedback que algo está acontecendo, não tela preta

## 3. Vídeo da home — bordas pretas

- Gradiente que misturava vídeo com fundo sumiu
- Bordas pretas do vídeo visíveis — precisa do gradiente de volta
- Verificar componente de vídeo e CSS

## 4. Botão "mostre sua mão" fixed no mobile

- Precisa estar sempre visível sem scroll
- Position fixed na bottom do viewport
- Só no mobile (desktop pode ser normal)

## 5. PWA glitch branco

- Flash branco ao abrir o app antes das cortinas
- Solução: meta theme-color #08050E + background-color no body + splash screen

## 6. Cortinas + clareamento progressivo

- Quando cortinas abrem, fundo fica preto e clareia depois
- O correto: conforme cortina abre, ambiente já vai clareando junto
- É um efeito de iluminação gradual, não transição binária

## 7. Clerk dark mode

- Tela de login do Clerk está em light mode
- Impossível ler texto branco em fundo branco
- Configurar appearance no ClerkProvider com tema dark
- Ou customizar com CSS variables do Clerk

## 8. Login Google direto no modal

- Em vez de redirecionar pra tela Clerk separada
- Clerk SignIn component pode ser embedded inline no modal
- Ou usar clerk.authenticateWithRedirect() direto no botão Google

## Referência visual

- Modal de pagamento (CreditGate) é o benchmark visual
- DS: docs/DS.md
- Brand: docs/brand-voice.md
