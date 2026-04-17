# E2E Report: Fluxo Deslogado (staging.maosfalam.com)

Data: 2026-04-14
Branch: develop (staging)
Viewport: 390x844 (iPhone 14 Pro)

---

## Resumo Executivo

**3 bugs criticos, 2 bugs graves, 4 bugs medios, 1 bug sistemico (acentos).**

O bug sistemico de acentos afeta TODAS as paginas — os caracteres acentuados do codigo-fonte
sao removidos durante o build da Vercel (confirmado: o JS chunk compilado ja chega sem acentos).
Alem disso, ha problemas de logica no fluxo de upgrade e genero inconsistente em leituras.

---

## BUG SISTEMICO: Acentos removidos no build

**Severidade: CRITICA**
**Afeta: TODAS as paginas**

Os arquivos-fonte em `src/` contem acentos corretos (UTF-8 confirmado), mas o JS bundle
compilado pela Vercel remove todos os caracteres acentuados. Exemplo:

- Fonte (local): `"Pra você. Sozinha."`, `"Uma mão. Uma voz."`
- Bundle (staging): `"Pra voce. Sozinha."`, `"Uma mao. Uma voz."`

**Prova:** O chunk `03w9rcx-reaef.js` no staging contem as strings sem acento.
Nao e CSS (`text-transform` e `none` nos elementos afetados). Nao e client-side.
O problema esta no pipeline de build (swc/webpack/Vercel).

### Paginas afetadas com exemplos

**`/creditos` (todos os 4 pacotes):**

- Header: "Uma leitura e diferente" -> "é diferente"
- Header: "Voce escolhe quantas maos vao" -> "Você", "mãos", "vão"
- Avulsa: "Pra voce. Sozinha." -> "você"
- Avulsa: "Uma mao." -> "mão"
- Avulsa: "Nao precisa mostrar pra ninguem. Fica entre nos." -> "Não", "ninguém", "nós"
- Dupla: "mae" -> "mãe", "voce" -> "você"
- Roda: "circulo" -> "círculo", "chao" -> "chão", "familia" -> "família", "infancia" -> "infância"
- Tsara: "maos" -> "mãos", "nao" -> "não"
- Footer de todos: "O preco do que voce vai descobrir e barato" -> "preço", "você", "é"
- Botao: "Proximo pacote" -> "Próximo"

**`/creditos` (modal de login para deslogado):**

- "Eu preciso saber quem voce e." -> "você é"
- "seus creditos" -> "créditos"
- "quando voce voltar" -> "você"
- "Sem complicacao" -> "complicação"
- "Ja tenho conta" -> "Já"

**`/login`:**

- "Eu sei quem voce e." -> "você é"
- "Suas maos estao esperando." -> "mãos estão"
- "voce@exemplo.com" -> "você@exemplo.com"
- "Nao tenho conta" -> "Não"

**`/registro`:**

- "Voce chegou. Eu ja estava te esperando." -> "Você", "já"
- "voce@exemplo.com" -> "você@exemplo.com"
- "Minimo 8 caracteres" -> "Mínimo"
- "Ja tenho conta" -> "Já"

**`/ler/nome` (deslogado):**

- "voce@exemplo.com" -> "você@exemplo.com"
- "Ja tenho conta. Entrar." -> "Já"

**`/ler/nome` (logado):**

- "Pra quem e essa leitura?" -> "é" (snapshot mostra sem acento, mas fonte tem acento)

**`/ler/camera`:**

- "Ja tem um retrato da palma." -> "Já"

**`/ler/resultado/[id]/share`:**

- "MaosFalam" -> "MãosFalam" (brand name no share card)

---

## Bugs Criticos

### BUG-01: "Desbloquear tudo" retorna 403 para usuario logado (em vez de redirecionar a /creditos)

**Severidade: CRITICA**
**Rota:** `/ler/resultado/[id]` (quando logado)
**Screenshot:** `08-desbloquear-click.png`

Quando um usuario LOGADO clica "Desbloquear tudo" num resultado free, o frontend
faz `POST /api/reading/{id}/upgrade` que retorna 403. O usuario ve a mensagem
"Algo saiu do caminho. Tente de novo." em vez de ser redirecionado para `/creditos`.

O endpoint `/api/reading/{id}/upgrade` provavelmente nao existe ou esta mal configurado.
O comportamento correto: redirecionar para `/creditos` (ou abrir modal de compra).

Console error: `Failed to load resource: 403 @ /api/reading/{id}/upgrade`

### BUG-02: Clerk configurado como "PariTech" com Facebook OAuth

**Severidade: CRITICA (branding/seguranca)**
**Rota:** Redirect para Clerk hosted login (quando acessa `/conta/*` deslogado)
**Screenshot:** `13-conta-leituras-redirect-clerk.png`

O Clerk hosted login mostra:

- "Sign in to PariTech" (deveria ser "MãosFalam")
- Botao Facebook OAuth (nao deveria existir, so Google conforme arquitetura)
- Interface generica do Clerk sem branding

Corrigir no Clerk Dashboard: nome do app + remover Facebook provider.

### BUG-03: /ler/nome permite "Pra mim" sem nome para usuario logado sem nome no Clerk

**Severidade: CRITICA**
**Rota:** `/ler/nome` (logado)
**Screenshot:** `02-ler-nome.png`

Quando logado, clicar "Pra mim" e depois "Continuar" navega para `/ler/toque`
sem validar que o nome da conta Clerk existe ou e valido. Se o nome do Clerk
estiver vazio, a leitura tera nome vazio.

---

## Bugs Graves

### BUG-04: Nome do sessionStorage contamina leitura de outra pessoa

**Severidade: GRAVE**
**Rota:** `/ler/resultado/[id]`
**Screenshot:** `07-resultado-free-kevin.png`

Se o usuario passou por `/ler/nome` antes de acessar um resultado, o
`sessionStorage` contem o nome digitado ("Maria") que e usado em vez do
`target_name` da leitura ("Kevin"). Resultado:

- Header: "Leitura de Maria" (deveria ser "Kevin")
- Elemento intro: "Suas maos queimam, Maria" (deveria ser "Kevin")
- Impact phrase: "Kevin. Fogo." (correto, vem do report)

O resultado deve SEMPRE usar o `target_name` salvo no report/reading.

### BUG-05: Genero incorreto na leitura (Kevin recebe feminino)

**Severidade: GRAVE**
**Rota:** `/ler/resultado/[id]`
**Screenshot:** `16-resultado-free-deslogado-real.png`

Texto da leitura: "Kevin. Fica quieta." — usa forma feminina "quieta" para
nome masculino. O `target_gender` nao esta sendo aplicado corretamente no
corpo da leitura ou no report salvo no banco.

---

## Bugs Medios

### BUG-06: Menu do header pula numeracao (04 -> 07) quando logado

**Severidade: MEDIO**
**Rota:** Todas as paginas (logado)
**Screenshot:** `02-ler-nome.png`

Menu lateral quando logado: 01 Inicio, 02 Minhas leituras, 03 Tarot, 04 Perfil, **07** Sair.
Faltam 05 e 06. Deveria ser sequencial ou sem numeros.

### BUG-07: Share card quase vazio

**Severidade: MEDIO**
**Rota:** `/ler/resultado/[id]/share`
**Screenshot:** `20-share-page.png`

O share card exibe apenas badge "Fogo", frase de impacto, e "MaosFalam" (sem acento).
Grande area escura vazia. Falta: glyph do elemento, decoracao visual, design.
Share card e o principal mecanismo de viralizacao — precisa ser visualmente forte.

### BUG-08: Footer do menu mostra "© 2025" em 2026

**Severidade: MEDIO**
**Rota:** Todas as paginas (menu lateral)

O copyright no menu lateral diz "© 2025 · MãosFalam". O ano correto e 2026.

### BUG-09: Botao "Sair" visivel no menu quando deslogado (com cookies Clerk residuais)

**Severidade: MEDIO**
**Rota:** Todas as paginas

Quando o browser tem cookies Clerk residuais (sessao anterior), o menu mostra
"Sair" mesmo quando a sessao pode ja ter expirado. Seria mais seguro verificar
a validade da sessao antes de mostrar itens de usuario logado.

---

## Fluxos Testados — Resultado

| #   | Teste                                           | Resultado                 | Screenshot                             |
| --- | ----------------------------------------------- | ------------------------- | -------------------------------------- |
| 1   | Landing (/) renderiza                           | PASS                      | `01-landing-page.png`                  |
| 2   | CTA "Mostre sua mao" linka para /ler/nome       | PASS                      | `01b-landing-full.png`                 |
| 3   | /ler/nome (deslogado) — form de lead            | PASS                      | `18-nome-deslogado-pramim.png`         |
| 4   | /ler/nome (logado) — "Pra mim" sem nome         | BUG-03                    | `02-ler-nome.png`                      |
| 5   | /ler/nome "Pra outra pessoa" — campo nome       | PASS                      | `04-nome-outra-pessoa.png`             |
| 6   | /ler/toque — ritual funciona                    | PASS                      | `05-toque-with-name.png`               |
| 7   | /ler/camera — metodo escolha                    | PASS                      | `06-camera-page.png`                   |
| 8   | /ler/resultado/[id] (free, deslogado)           | PASS (acentos BUG)        | `16-resultado-free-deslogado-real.png` |
| 9   | /ler/resultado/[id] — "Desbloquear" deslogado   | PASS (redireciona /login) | `17-desbloquear-redireciona-login.png` |
| 10  | /ler/resultado/[id] — "Desbloquear" logado      | BUG-01 (403)              | `08-desbloquear-click.png`             |
| 11  | /creditos (deslogado) — renderiza               | PASS (acentos BUG)        | `14-creditos-deslogado-real.png`       |
| 12  | /creditos — "Escolher" deslogado -> modal login | PASS                      | `15-creditos-escolher-deslogado.png`   |
| 13  | /creditos — "Escolher" logado -> AbacatePay     | PASS                      | `10-abacatepay-no-login.png`           |
| 14  | /conta/leituras (deslogado) -> redirect Clerk   | PASS (branding BUG-02)    | `13-conta-leituras-redirect-clerk.png` |
| 15  | /conta/perfil (deslogado) -> redirect Clerk     | PASS                      | —                                      |
| 16  | /login renderiza                                | PASS (acentos BUG)        | `17-desbloquear-redireciona-login.png` |
| 17  | /registro renderiza                             | PASS (acentos BUG)        | `19-registro-page.png`                 |
| 18  | /ler/resultado/[id]/share                       | PASS (visual BUG-07)      | `20-share-page.png`                    |
| 19  | 404 page                                        | PASS                      | `21-404-page.png`                      |
| 20  | Console errors                                  | PASS (0 em estado normal) | —                                      |

---

## Prioridade de Correcao

1. **BUG SISTEMICO (acentos)** — Afeta toda a experiencia. Investigar pipeline de build.
   Possivel causa: encoding do arquivo, swc config, ou algum plugin/loader que nao suporta UTF-8.
   Confirmar rodando `npm run build` local e checando o output.
2. **BUG-01 (403 no upgrade)** — Bloqueia monetizacao para usuarios logados.
3. **BUG-02 (Clerk PariTech)** — Branding errado na tela de login.
4. **BUG-04 (nome contaminado)** — Resultado mostra nome errado.
5. **BUG-05 (genero)** — Leitura feminina para nome masculino.
6. **BUG-03 (Pra mim sem nome)** — Edge case mas pode gerar leituras sem nome.
7. **BUG-07 (share card)** — Afeta viralizacao.
8. **BUG-06, BUG-08, BUG-09** — Cosmeticos.

---

## Metodologia

- Playwright MCP com viewport mobile 390x844
- Cookies Clerk limpos via `context.clearCookies()` + `localStorage.clear()` + `sessionStorage.clear()`
- Testado ambos estados: com cookies Clerk residuais e genuinamente deslogado
- JS chunks analisados via `fetch()` para confirmar bug de acentos no bundle compilado
- Neon develop branch consultada para dados de teste (reading IDs)
