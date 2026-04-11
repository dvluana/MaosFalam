# MaosFalam: Mapa Completo de Telas e Estados

## Convenções usadas neste documento

- **[TELA]** = tela/página completa
- **[ESTADO]** = variação visual da mesma tela
- **[MODAL]** = overlay sobre a tela atual
- **[TOAST]** = notificação temporária (voz da cigana)
- **Tier FREE** = visível sem pagar
- **Tier PREMIUM** = requer crédito

---

# FLUXO 1: VISITANTE NOVA (via Instagram)

## [TELA] Landing (/)

Cortinas de veludo, lâmpada Edison, vídeo, CTA principal.

**Estados:**

- **default**: cortinas abrindo, logo reveal, CTA "Me mostre sua mão"
- **after_scroll**: vídeo com efeito diorama, presságios emergentes, typewriter
- **menu_open**: menu lateral com links (Manifesto, Leitura, Login)

---

## [TELA] Manifesto (/manifesto)

Página longa. História da quiromancia, as 4 linhas, CTA.

---

## [TELA] Toque (/ler/toque)

"Encoste sua mão na minha." Celular vibra. Linhas pulsam.

**Estados:**

- **waiting**: mão da cigana na tela, texto pulsando, esperando toque
- **touched**: vibração haptic, linhas acendem, transição pra nome (1.5s)

---

## [TELA] Nome (/ler/nome)

"Pra quem é essa leitura?" Campo de nome antes da câmera.

**Estados:**

- **default**: campo de nome, botão "Continuar" (vai pra câmera)

---

## [TELA] Câmera (/ler/camera)

Câmera com outline SVG de mão.

**Estados:**

- **loading_mediapipe**: tela escura, "Preciso ver melhor..." (enquanto modelo carrega, ~2-3s)
- **camera_active_no_hand**: câmera aberta, outline dourado dim, texto "Posicione sua mão"
- **camera_hand_detected**: outline muda pra dourado brilhante, validando posição
- **camera_adjusting**: feedback textual "Abra mais os dedos" / "Centralize" / "Mais perto"
- **camera_stable**: outline pulsando, "Segure..." (landmarks estáveis por 1.5s)
- **camera_capturing**: flash sutil em gold, vibração, foto capturada
- **camera_permission_denied**: texto "Preciso dos seus olhos emprestados." + explicação + botão "Permitir nas configurações" + link pra settings do OS
- **camera_permission_denied_permanent**: mesmo texto + instrução de como habilitar manualmente nas configurações do celular (iOS: Ajustes > Safari > Câmera / Android: Configurações > Apps)
- **camera_fallback_upload**: se MediaPipe falha ou device muito antigo, mostra botão "Enviar foto da palma" com input file (upload manual)
- **camera_error_generic**: "Algo saiu errado. Tente de novo." + botão retry

---

## [TELA] Scan (/ler/scan)

Loading ritual. 10 segundos transformados em experiência.

**Estados:**

- **scanning**: linhas sendo traçadas sobre a foto real, frases rotativas da cigana em Cormorant italic ("Vejo uma linha forte aqui...", "Seu coração fala mais alto que você...", "Tem algo que você esconde..."), progress bar sutil
- **scan_slow**: se API demora > 15s, frase adicional "Suas linhas são complexas. Preciso de mais tempo."
- **scan_failed_low_confidence**: confidence < 0.3, transição pra tela de erro
- **scan_failed_api_error**: erro de rede/API, transição pra tela de erro

---

## [TELA] Erro de Leitura (/ler/erro)

Quando a IA não consegue ler a mão.

**Estados:**

- **low_confidence**: "Suas linhas estão tímidas hoje. Tente de novo com mais luz." + botão "Tentar de novo" (volta pra câmera) + dicas visuais (ícones: luz, mão aberta, fundo limpo)
- **api_error**: "Eu preciso de um momento. Volte em breve." + botão retry + opção de salvar email pra notificação quando voltar
- **too_many_attempts**: após 3 tentativas falhas, "Suas mãos estão resistindo. Tente amanhã." + CTA pra explorar o Manifesto enquanto isso

---

## [TELA] Revelação (/ler/revelacao)

Frase de impacto sozinha na tela escura.

**Estados:**

- **reveal_in**: tela escura, frase aparece letra por letra (typewriter lento, ~3s), silêncio
- **reveal_complete**: frase completa, pausa de 2s, botão sutil "Continuar" aparece com fade-in
- **reveal_transition**: fade-out pra resultado

---

## [TELA] Resultado Free (/ler/resultado/[id])

Linha do Coração completa + 3 linhas blurred.

**Estados:**

- **loaded**: toast da cigana "Eu terminei de ler. Senta que é longo.", seção Elemento visível, Coração completo (intro + body + impact), 3 cards blurred (Cabeça, Vida, Destino) com ícone e frase parcial visível
- **scrolling**: conforme scrolla, frase da cigana muda no blur "Tem mais. Muito mais."
- **share_prompt**: após ler Coração, prompt sutil "Compartilhar nos stories?" com preview do share card
- **upsell_section**: abaixo dos cards blurred, seção de upgrade com pacotes de créditos

---

## [TELA] Resultado Premium (/ler/resultado/[id]/completo)

Leitura completa desbloqueada. Todas as seções expandidas.

**Estados:**

- **loaded**: todas as seções visíveis (Elemento, Coração, Cabeça, Vida, Destino, Montes, Sinais Raros, Cruzamentos, Compatibilidade)
- **share_options**: botões compartilhar (stories, WhatsApp, copiar link)

---

## [TELA] Share Card Preview (/ler/resultado/[id]/share)

Preview do card antes de compartilhar.

**Estados:**

- **preview**: card renderizado (frase + elemento + logo), botões "Baixar imagem" + "Copiar link" + "Compartilhar" (Web Share API)
- **shared**: confirmação "Sua leitura está no mundo." + CTA voltar pro resultado

---

# FLUXO 2: UPGRADE (compra de créditos)

## [TELA] Pacotes de Créditos (/creditos)

Acessível do resultado free ou da área logada.

**Estados:**

- **default**: 4 cards de pacote (Avulsa R$14,90 / Dupla R$24,90 / Roda R$49,90 com badge "mais popular" / Tsara R$79,90), toggle PIX/Cartão
- **pix_selected**: QR Code PIX gerado pela AbacatePay, timer de expiração (15min), botão "Copiar código PIX", instrução "Abra o app do banco e escaneie"
- **card_selected**: form de cartão (número, validade, CVV, nome), botão "Pagar"
- **processing_payment**: loading com frase da cigana "O preço do que você vai descobrir é barato pelo que vale."
- **payment_success**: confirmação, créditos adicionados, redirect pra resultado completo (se veio do upsell) ou área logada
- **payment_failed_pix_expired**: "O código PIX expirou. Gere um novo." + botão retry
- **payment_failed_card_declined**: "O cartão não passou. Tente outro ou use PIX." + opções
- **payment_failed_generic**: "Algo deu errado no pagamento. Tente novamente." + retry + opção PIX
- **requires_login**: se não logada, modal de login/registro aparece ANTES do pagamento (precisa de conta pra salvar créditos)

---

# FLUXO 3: AUTENTICAÇÃO

## [TELA] Login (/login)

**Estados:**

- **default**: botão "Entrar com Google" (OAuth) + formulário email/senha + link "Criar conta" + link "Esqueci a senha"
- **google_oauth_loading**: redirect pro Google, loading
- **google_oauth_success**: redirect pra área logada
- **google_oauth_error**: "Não consegui conectar com o Google. Tente de novo." + fallback email
- **email_login_error**: "Email ou senha incorretos." (inline, sem modal)
- **email_login_success**: redirect pra área logada

---

## [TELA] Registro (/registro)

**Estados:**

- **default**: botão "Criar com Google" + formulário (nome, email, senha) + link "Já tenho conta"
- **registration_success**: toast "Bem-vinda, {{name}}. Suas mãos estavam esperando." + redirect
- **registration_error_email_exists**: "Esse email já tem conta. Fazer login?" + link
- **registration_error_validation**: erros inline (senha curta, email inválido)

---

## [TELA] Esqueci a Senha (/esqueci-senha)

**Estados:**

- **default**: campo de email + botão "Enviar link"
- **sent**: "Mandei um link pro seu email. Se não chegar, olha no spam."
- **error**: "Não encontrei esse email. Quer criar uma conta?"

---

## [TELA] Redefinir Senha (/redefinir-senha/[token])

**Estados:**

- **default**: campos nova senha + confirmar + botão
- **success**: "Senha atualizada. Fazendo login..." + redirect
- **token_expired**: "Esse link expirou. Solicite um novo." + link
- **token_invalid**: "Link inválido." + link pra esqueci-senha

---

# FLUXO 4: ÁREA LOGADA

## [TELA] Minhas Leituras (/conta/leituras)

Dashboard principal da usuária logada.

**Estados:**

- **has_readings**: lista de cards de leitura (nome, elemento, data, tier, status), ordenados por data
- **empty**: "Suas mãos ainda não falaram. Faça sua primeira leitura." + CTA grande
- **loading**: skeleton loading dos cards

**Cada card de leitura tem estados:**

- **active_free**: badge "Free", Coração visível, upgrade disponível
- **active_premium**: badge "Completa", todas as linhas, opção de ver e compartilhar
- **expiring_soon**: badge "Expira em X dias" (amarelo/warning), link público prestes a expirar
- **expired**: badge "Expirado" (dim), texto "O link público expirou. A leitura ainda é sua." Botão "Gerar novo link" (consome ação, não crédito) ou "Compartilhar sem link" (download da imagem)
- **reading_for_other**: badge com nome da pessoa (ex: "Leitura de Marina"), ícone diferente

---

## [TELA] Ver Leitura Salva (/conta/leituras/[id])

Mesma tela de resultado, mas acessada da área logada.

**Estados:**

- **free_saved**: mesma do resultado free, com opção de upgrade
- **premium_saved**: resultado completo, todas as seções expandidas
- **share_options**: botões compartilhar (stories, WhatsApp, copiar link)

---

## [TELA] Perfil (/conta/perfil)

**Estados:**

- **default**: nome, email, foto (se Google), botão editar, botão "Sair", link "Excluir conta"
- **editing**: campos editáveis (nome, email), botão salvar
- **delete_confirmation**: modal "Tem certeza? Suas leituras serão perdidas." + campo de confirmação (digitar "EXCLUIR") + botão

---

## [TELA] Nova Leitura (logada) (/ler/nome)

Mesma tela de nome do fluxo anônimo, mas com contexto de conta logada.

**Estados:**

- **choose_target**: "Pra quem é essa leitura?" + campo nome + toggle "Pra mim" (preenche com nome da conta)
- **no_credits**: se saldo = 0, "Você precisa de créditos pra uma leitura completa. A free ainda é sua." + botões: "Leitura free" / "Comprar créditos"
- **has_credits**: "1 crédito será usado. Você tem X." + botão "Continuar" (vai pra câmera)
- **confirm_credit**: modal "Usar 1 crédito pra leitura de {{nome}}?" + Confirmar/Cancelar

---

# FLUXO 5: LINK COMPARTILHADO

## [TELA] Leitura Compartilhada (/compartilhar/[token])

**Estados:**

- **valid_free**: nome, elemento, frase de impacto, Coração visível (60%), Cabeça/Vida/Destino blurred (40%), CTA "Descubra o que suas mãos dizem" (leva pra landing/leitura)
- **valid_premium**: nome, elemento, frase de impacto, resumo das 4 linhas (não completo, preview), CTA
- **expired**: "Essa leitura expirou. Mas a sua pode começar agora." + CTA pra landing
- **not_found**: "Essa leitura não existe." + CTA pra landing

---

# FLUXO 6: LEITURA PRA OUTRA PESSOA

## Fluxo completo:

1. /ler/nome > escolhe nome > confirma crédito
2. /ler/camera > fotografa mão da outra pessoa
3. /ler/scan > processamento normal
4. /ler/revelacao > frase de impacto
5. /ler/resultado/[id] > resultado completo (premium, crédito já consumido)
6. Opção de enviar link via WhatsApp

## [MODAL] Enviar via WhatsApp

- Preview do link + mensagem sugerida: "{{nome}}, li sua mão. Olha o que saiu: [link]"
- Botão "Abrir WhatsApp" (deep link: wa.me/?text=...)
- Botão "Copiar link"

---

# FLUXO 7: ESTADOS GLOBAIS

## [TOAST] Notificações (em qualquer tela)

Todas na voz da cigana.

- **reading_ready**: "Eu terminei de ler. Você quer saber?"
- **payment_confirmed**: "Suas linhas completas estão esperando."
- **credits_low**: "Sobrou 1 crédito. Usa com sabedoria."
- **credits_expired**: "Seus créditos expiraram. O tempo não espera."
- **share_success**: "Sua leitura está no mundo. Agora é com ela."
- **error_generic**: "Algo saiu do caminho. Tente de novo."
- **welcome_back**: "Voltou. Suas mãos não mudaram. Ou mudaram?"

---

## [TELA] 404 (/404)

- Tela escura, frase: "Esse caminho não existe. Mas o seu, sim."
- CTA "Voltar pro início"

---

## [TELA] Offline / Sem conexão

- Detectado via navigator.onLine
- Tela escura, frase: "Até a cigana precisa de sinal. Tente quando a conexão voltar."
- Sem botão (não tem o que fazer)

---

## [TELA] Manutenção

- Tela escura, frase: "Estou afiando as linhas. Volte em breve."
- Timer estimado (se disponível)

---

# FLUXO 8: TELAS EXTRAS

## [TELA] Landing de Venda (/lp-venda)

Página de venda longa com blocos de conversão.

**Estados:**

- **default**: hero, como funciona, entrega, credibilidade, depoimentos, FAQ, CTA final, sticky CTA

---

## [TELA] Tarot (/tarot)

Experiência de tarot interativa.

**Estados:**

- **selection**: escolha de cartas
- **reveal**: revelação das cartas selecionadas
- **share**: share card do resultado

---

# FLUXO 9: OG / META / SEO

## Open Graph por rota

| Rota                  | OG Title                     | OG Description                                                              | OG Image                                               |
| --------------------- | ---------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| /                     | MaosFalam: Me mostre sua mão | Leitura de mão que parece ter sido feita por alguém que te conhece há anos. | Landing hero image                                     |
| /compartilhar/[token] | Leitura de {{nome}}          | "{{frase_impacto}}"                                                         | Share card dinâmico (gerado por /api/share/[token]/og) |
| /manifesto            | A história das suas mãos     | 5 mil anos de quiromancia. Agora na palma da sua mão.                       | Manifesto hero                                         |
| /creditos             | MaosFalam: Leitura completa  | 4 linhas. 6 montes. Tudo sobre você.                                        | Genérico branded                                       |
| /lp-venda             | MaosFalam: Leitura de mão    | A cigana agora mora no seu celular.                                         | LP hero                                                |

---

# RESUMO: CONTAGEM DE TELAS E ESTADOS

| Categoria                                                    | Telas        | Estados totais |
| ------------------------------------------------------------ | ------------ | -------------- |
| Landing + Manifesto                                          | 2            | 4              |
| Funil de leitura (toque > nome > câmera > scan > revelação)  | 5            | 20             |
| Erro de leitura                                              | 1            | 3              |
| Resultado (free + premium + share preview)                   | 4            | 9              |
| Upgrade/Pagamento                                            | 1            | 9              |
| Autenticação (login + registro + senha)                      | 4            | 13             |
| Área logada (leituras + perfil + nova)                       | 3            | 11             |
| Link compartilhado                                           | 1            | 4              |
| Extras (lp-venda + tarot)                                    | 2            | 4              |
| Estados globais (404, offline, manutenção, toasts)           | 3            | 10             |
| **TOTAL**                                                    | **26 telas** | **87 estados** |
