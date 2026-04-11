# MÃOSFALAM — Arquitetura

> **STATUS: v1.1 implementado.** Pagamentos (AbacatePay) e email (Resend) adiados para v2.

---

## 1. Stack

| Camada           | Ferramenta                                                   |
| ---------------- | ------------------------------------------------------------ |
| Frontend         | Next.js 16 + TypeScript strict + Tailwind v4 + Framer Motion |
| Auth             | Clerk v7 (Google OAuth + email/senha) — `src/proxy.ts`      |
| Banco            | Neon (Postgres serverless) + Prisma 7 (config em `prisma.config.ts`) |
| IA visão         | GPT-4o (OpenAI API)                                          |
| Pagamento        | AbacatePay (PIX + cartão) — stub em v1.1, implementar em v2 |
| Email            | Resend — não implementado em v1.1, adiado para v2            |
| Motor de leitura | Blocos em TypeScript estático (~168 blocos, ~461 textos)     |
| Detecção client  | MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`)        |
| Logging          | Pino                                                         |
| Testes           | Vitest + Playwright                                          |
| CI/CD            | GitHub Actions                                               |
| Deploy           | Vercel — staging.maosfalam.com (branch develop) + maosfalam.com (branch main) |
| Neon branches    | `main` (prod) + `develop` (dev)                              |

---

## 2. Estrutura de Pastas

```
src/
  app/                              # rotas (App Router)
    api/                            # API routes
      lead/register/
      reading/capture/
      reading/[id]/
      reading/new/
      credits/purchase/
      user/readings/
      user/credits/
      user/profile/
      user/account/
      webhook/abacatepay/

  components/                       # UI reutilizável
    ui/                             # primitives
    shared/                         # blocos compartilhados
    landing/                        # home
    lp-venda/                       # LP comercial
    reading/                        # resultado, glyphs, cards
    camera/                         # câmera e overlay
    account/                        # área logada
    tarot/                          # tarot

  server/                           # backend
    lib/
      select-blocks.ts              # motor de leitura
      openai.ts                     # wrapper GPT-4o
      abacatepay.ts                 # wrapper pagamento (stub)
      resend.ts                     # wrapper email (stub)
      rate-limit.ts                 # rate limiting in-memory
      auth.ts                       # helpers Clerk server-side
      prisma.ts                     # Prisma client singleton
      logger.ts                     # Pino logger

  lib/                              # adapters front (mock → API)
    reading-client.ts
    payment-client.ts
    user-client.ts
    checkout-intent.ts
    reading-context.ts              # helpers sessionStorage ReadingContext
    mediapipe.ts                    # wrapper inicialização Hand Landmarker

  data/                             # dados estáticos
    blocks/
      index.ts
      element.ts
      heart.ts
      head.ts
      life.ts
      fate.ts
      mounts.ts
      rare-signs.ts
      crossings.ts
      compatibility.ts
      transitions.ts
      impact-phrases.ts
    credit-packs.ts
    gender-map.ts

  hooks/
  mocks/
  types/
  generated/                        # Prisma client gerado (não editar)
  proxy.ts                          # auth middleware (Clerk clerkMiddleware)

/prisma
  schema.prisma
  prisma.config.ts                  # configuração do Prisma 7 (datasource, adapter)
```

---

## 3. Funil

```
Landing → /ler/nome (coleta lead + contexto) → /ler/camera → /ler/scan → /ler/revelacao → /ler/resultado/[id]
```

### /ler/nome — Fluxo único com is_self flag

O contexto de leitura é coletado via `ReadingContext` (sessionStorage):

```typescript
// src/types/reading-context.ts
interface ReadingContext {
  target_name: string;
  target_gender: "female" | "male";
  dominant_hand: "right" | "left";
  is_self: boolean;
  session_id: string;
  credit_used?: boolean;
}
```

**Visitante (não logada):**
- Coleta: nome alvo + gênero (ela/ele) + mão dominante (destra/canhota) + opt-in email LGPD
- Cigana: "Me diz seu nome. Eu preciso dele pra ler."
- Registra lead via POST /api/lead/register (fire-and-forget, falha não bloqueia)
- Não existe rota separada para "ler outra pessoa" — `is_self = true` pra visitante

**Logada:**
- Mostra toggle "Pra mim" / "Pra outra pessoa"
- "Pra mim" → preenche nome/gênero da conta Clerk automaticamente, `is_self = true`
- "Pra outra pessoa" → campo de nome livre, `is_self = false`
- Coleta mão dominante em ambos os casos

**CreditGate (logada, segunda leitura ou mais):**
- Se saldo > 0: modal de confirmação "Usar 1 crédito pra leitura de {{nome}}?"
- Débito ocorre no server via POST /api/reading/new antes de ir para câmera
- Se saldo = 0: redirect /creditos antes da câmera

### Paywall (após resultado free)

5 teasers com frases visíveis da cigana (não nomes de linhas):

1. _"Sua cabeça decide rápido. Seu coração demora pra aceitar. E no meio desse atraso..."_
2. _"Tem uma marca aqui que apareceu faz uns anos. Você sabe do que eu tô falando."_
3. _"Quando a porta fecha, você é outra pessoa. E quase ninguém sabe."_
4. _"Tem algo chegando. E não, não é o que você tá esperando."_
5. _"Tem uma marca na sua mão que quase ninguém tem. Eu vi."_

### Fluxo de pagamento

```
"Desbloquear tudo" → Login Clerk → AbacatePay checkout → Webhook → Créditos + Desbloqueio
```

---

## 4. Estrutura do Relatório

```
FREE:
  Prólogo — Elemento + Tipo de Mão
  Cap 01 — Como você ama (Coração)

PAYWALL

PAGO:
  Cap 02 — O que não te deixa dormir (Cabeça)
  Cap 03 — O que você já sobreviveu (Vida)
  Cap 04 — Quando a porta fecha (Vênus + Cinturão)
  Cap 05 — Como o mundo te vê (Montes restantes)
  Cap 06 — Pra onde você tá indo (Destino)
  Cap 07 — Onde tudo se encontra (Cruzamentos)
  Cap 08 — Com quem suas mãos conversam (Compatibilidade)
  Cap 09 — O que quase ninguém tem (Sinais Raros)
  Epílogo
```

O relatório COMPLETO (free + premium) é salvo no Neon como JSONB. O frontend decide o que mostrar/borrar com base no `tier`. Pagamento só muda a flag, não remonta.

---

## 5. Schema do Banco

Source of truth: `prisma/schema.prisma`. Os modelos abaixo refletem o schema atual.

### leads

```sql
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  gender          VARCHAR(10) DEFAULT 'female',
  session_id      VARCHAR(64) NOT NULL,
  clerk_user_id   VARCHAR(100),
  email_opt_in    BOOLEAN DEFAULT false,
  source          VARCHAR(50) DEFAULT 'organic',
  converted       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- indexes: email, session_id
```

### user_profiles

Clerk = source of truth pra name, email, foto. Neon = só dados de pagamento.

```sql
CREATE TABLE user_profiles (
  clerk_user_id           VARCHAR(100) PRIMARY KEY,
  lead_id                 UUID UNIQUE REFERENCES leads(id),
  cpf                     VARCHAR(14),
  phone                   VARCHAR(20),
  abacatepay_customer_id  VARCHAR(100),
  created_at              TIMESTAMPTZ DEFAULT NOW()
);
```

### readings

```sql
CREATE TABLE readings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID REFERENCES leads(id),
  clerk_user_id   VARCHAR(100),
  session_id      VARCHAR(64),
  target_name     VARCHAR(100) NOT NULL,
  target_gender   VARCHAR(10) DEFAULT 'female',
  is_self         BOOLEAN DEFAULT true,
  attributes      JSONB NOT NULL,
  report          JSONB NOT NULL,
  tier            VARCHAR(10) DEFAULT 'free',
  confidence      DECIMAL(3,2),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- indexes: clerk_user_id, lead_id
-- URL de compartilhamento usa reading UUID direto (sem coluna de token separada)
```

### credit_packs

```sql
CREATE TABLE credit_packs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id   VARCHAR(100) NOT NULL,
  payment_id      UUID UNIQUE REFERENCES payments(id),
  pack_type       VARCHAR(20) NOT NULL,
  total           INTEGER NOT NULL,
  remaining       INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- créditos não expiram (sem coluna de data de expiração)
```

Saldo: `SUM(remaining) WHERE remaining > 0`
Débito: FIFO (pack mais antigo com saldo primeiro).

### payments

```sql
CREATE TABLE payments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id           VARCHAR(100) NOT NULL,
  reading_id              UUID UNIQUE REFERENCES readings(id),
  abacatepay_billing_id   VARCHAR(100),
  pack_type               VARCHAR(20) NOT NULL,
  amount_cents            INTEGER NOT NULL,
  method                  VARCHAR(10),
  status                  VARCHAR(20) DEFAULT 'pending',
  paid_at                 TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);
-- index: abacatepay_billing_id
```

### Relações

```mermaid
erDiagram
    leads ||--o{ readings : "gera"
    leads ||--o| user_profiles : "vira"
    user_profiles ||--o{ credit_packs : "compra"
    user_profiles ||--o{ payments : "paga"
    payments ||--o| credit_packs : "gera pack"

    leads { uuid id PK; varchar name; varchar email; varchar gender }
    user_profiles { varchar clerk_user_id PK; varchar cpf; varchar abacatepay_customer_id }
    readings { uuid id PK; varchar target_name; jsonb report; varchar tier; boolean is_self }
    credit_packs { uuid id PK; int remaining }
    payments { uuid id PK; varchar abacatepay_billing_id; varchar status }
```

---

## 6. Motor de Leitura

Blocos vivem em `/src/data/blocks/`. ~168 blocos base, ~461 textos com variações (content + alt + alt2).

```typescript
// /src/server/lib/select-blocks.ts
export function selectBlocks(
  attributes: HandAttributes,
  name: string,
  gender: "female" | "male",
): ReportJSON {
  // 1. Seleciona blocos por variação de cada eixo
  // 2. Filtra cruzamentos condicionais
  // 3. Randomiza variação textual (content vs alt vs alt2)
  // 4. Substitui {{name}}
  // 5. Substitui marcadores de gênero via GENDER_MAP
  // 6. Retorna report JSON completo
}
```

Performance: <1ms. Zero I/O.

---

## 7. MediaPipe + Câmera

### O que é

MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`) é uma lib do Google que roda no browser (client-side, zero server). Detecta a mão em tempo real via câmera e retorna 21 pontos (landmarks) com coordenadas x, y, z. Roda a ~30fps em celular médio.

Wrapper de inicialização: `src/lib/mediapipe.ts` — carrega o modelo WASM e expõe o Hand Landmarker.

Importante: MediaPipe NÃO lê linhas da palma. Ele detecta articulações dos dedos e posição da mão. Quem lê as linhas é o GPT-4o depois, a partir da foto.

### Mão dominante

A mão dominante (`dominant_hand: "right" | "left"`) é perguntada em `/ler/nome` antes da câmera abrir, como parte do `ReadingContext`. A câmera mostra instrução específica ("mostre sua mão direita") e o MediaPipe valida que a mão correta está no frame via handedness.

### Fluxo da câmera

```
getUserMedia (câmera frontal ou traseira)
  → CameraViewport (video element dentro do componente — não escondido)
  → Hand Landmarker processa cada frame via requestAnimationFrame
  → Valida condições em tempo real (landmarks)
  → Quando tudo OK por 1.5s contínuo (medido por timestamp, não frame count) → auto-captura
  → captureFrame() extrai foto do canvas como base64 JPEG
  → Câmera frontal (espelhada): captureFrame() des-espelha a imagem antes de enviar
  → Enviada pro server (POST /api/reading/capture)
```

### 21 landmarks do MediaPipe

```
 0  WRIST (pulso)
 1  THUMB_CMC        5  INDEX_MCP       9  MIDDLE_MCP     13  RING_MCP      17  PINKY_MCP
 2  THUMB_MCP        6  INDEX_PIP      10  MIDDLE_PIP     14  RING_PIP      18  PINKY_PIP
 3  THUMB_IP         7  INDEX_DIP      11  MIDDLE_DIP     15  RING_DIP      19  PINKY_DIP
 4  THUMB_TIP        8  INDEX_TIP      12  MIDDLE_TIP     16  RING_TIP      20  PINKY_TIP
```

MCP = base do dedo. TIP = ponta. Os landmarks na BASE de cada dedo (MCP: 5, 9, 13, 17) correspondem aproximadamente às posições dos montes na quiromancia.

### O que o MediaPipe valida (antes de capturar)

| Validação     | Como detecta                                            | Feedback da cigana                                |
| ------------- | ------------------------------------------------------- | ------------------------------------------------- |
| Mão presente  | Pelo menos 1 hand detected                              | "Preciso ver sua mão. Posiciona no centro."       |
| Mão correta   | handedness label bate com dominant_hand do ReadingContext | "Essa é a outra mão. Mostre a [destra/canhota]." |
| Palma aberta  | Distância entre THUMB_TIP e PINKY_TIP > threshold       | "Abre mais os dedos. Preciso ver as linhas."      |
| Mão estável   | Variação dos landmarks < threshold por 1.5s (timestamp) | "Segura... quase..."                              |
| Centralizada  | WRIST e MIDDLE_MCP dentro da zona central do frame      | "Centraliza a mão no quadro."                     |
| Iluminação ok | Brightness média do frame > threshold (canvas analysis) | "Preciso de mais luz. Suas linhas estão tímidas." |

### O que o MediaPipe NÃO faz

- Não detecta linhas (Coração, Cabeça, Vida, Destino)
- Não detecta montes (elevações da palma)
- Não detecta sinais raros (Estrela, Cruz Mística)
- Não mede comprimento ou curvatura de nada

Tudo isso é feito pelo GPT-4o a partir da foto estática. O MediaPipe é só o porteiro: garante que a foto vai ser boa o suficiente pra IA analisar.

### Câmera frontal e espelhamento

Câmera frontal exibe o video espelhado (comportamento padrão do browser). O handedness do MediaPipe para câmera frontal mapeia diretamente para a mão real do usuário (já corrigido pela lib). `captureFrame()` des-espelha o canvas antes de gerar o JPEG pra garantir que a imagem enviada ao GPT-4o está na orientação anatômica correta.

### Dados que o MediaPipe extrai e que são ÚTEIS pro relatório

Com os landmarks, dá pra calcular no client ANTES de mandar pro server:

```typescript
// Tipo de mão (elemento) via proporções
const palmWidth = distance(landmarks[5], landmarks[17]); // INDEX_MCP → PINKY_MCP
const palmHeight = distance(landmarks[0], landmarks[9]); // WRIST → MIDDLE_MCP
const fingerLength = distance(landmarks[9], landmarks[12]); // MIDDLE_MCP → MIDDLE_TIP
const ratio = palmHeight / palmWidth;
const fingerRatio = fingerLength / palmHeight;

// ratio > 1.1 = palma longa, < 0.95 = palma quadrada
// fingerRatio > 1.0 = dedos longos, < 0.85 = dedos curtos
// Combinação determina elemento:
//   Quadrada + curtos = Terra
//   Quadrada + longos = Ar
//   Longa + curtos = Fogo
//   Longa + longos = Água
```

### Confidence do GPT-4o (depois de enviar)

O prompt do GPT-4o pede um campo `confidence` no JSON de retorno:

- >= 0.7: leitura completa
- 0.3–0.7: leitura parcial (sinais raros podem faltar)
- < 0.3: rejeita. "Suas linhas estão tímidas hoje. Tente com mais luz."

### Foto

Processada e descartada. Nunca armazenada.

---

## 8. AbacatePay

> **Nota:** Implementação adiada para milestone v2. Em v1.1, `/api/credits/purchase` e `/api/webhook/abacatepay` existem como stubs que retornam 501.

### Endpoints usados (plano v2)

| Ação           | Endpoint                 |
| -------------- | ------------------------ |
| Criar customer | POST /v1/customer/create |
| Criar cobrança | POST /v1/billing/create  |
| Webhook        | billing.paid             |

### Cobrança (plano v2)

```typescript
{
  frequency: 'ONE_TIME',
  methods: ['PIX', 'CARD'],
  products: [{
    externalId: `pack_${packType}_${Date.now()}`,
    name: `MãosFalam · ${pack.label}`,
    quantity: 1,
    price: pack.price_cents,
  }],
  returnUrl: `${BASE_URL}/creditos`,
  completionUrl: readingId
    ? `${BASE_URL}/ler/resultado/${readingId}?paid=1`
    : `${BASE_URL}/conta/creditos?purchased=1`,
  customerId: user.abacatepay_customer_id,
}
```

### Webhook (plano v2)

1. Valida assinatura
2. Busca payment por billing_id (idempotente)
3. Transaction: marca pago → cria credit_pack → debita 1 FIFO → muda tier
4. Envia email via Resend

---

## 9. Auth (Clerk)

- Clerk v7 — `auth()` é async, importar de `@clerk/nextjs/server`
- Auth middleware: `src/proxy.ts` (não `middleware.ts`)
- Google OAuth + email/senha
- 50K users free
- Conta criada no primeiro pagamento ou ao salvar leitura
- Lead vinculada ao clerk_user_id quando cria conta

---

## 10. Email

> **Nota:** Resend não implementado em v1.1. Adiado para milestone futura após domínio verificado (`maosfalam.com.br`).

### Quem manda o quê (plano v2)

| Tipo                      | Quem manda | Exemplos                                          |
| ------------------------- | ---------- | ------------------------------------------------- |
| Auth (senha, verificação) | **Clerk**  | Reset de senha, verificar email, magic link       |
| Transacional (produto)    | **Resend** | Pagamento confirmado, boas-vindas, leitura pronta |
| Marketing (opt-in)        | **Resend** | Reengajamento, promoções                          |

Reset de senha, verificação de email, e qualquer fluxo de autenticação é 100% do Clerk. Você não implementa nada, não cria template, não manda email. O Clerk gerencia sozinho com os componentes dele.

### Emails transacionais (Resend, automáticos — plano v2)

| Trigger                  | Assunto                                  | Conteúdo                                                              | Quando                              |
| ------------------------ | ---------------------------------------- | --------------------------------------------------------------------- | ----------------------------------- |
| Lead criada              | "Suas mãos já falaram, {{name}}"         | Link pra ver o resultado free. Tom cigana.                            | Logo após a leitura free            |
| Pagamento confirmado     | "Sua leitura completa tá pronta"         | Link direto pro relatório premium desbloqueado.                       | Webhook billing.paid                |
| Conta criada             | "Bem-vinda, {{name}}"                    | Boas-vindas na voz da cigana. O que ela pode fazer com a conta.       | Após primeiro login Clerk           |
| Leitura pra outra pessoa | "A leitura de {{target_name}} tá pronta" | Link pro relatório + botão "Enviar pra {{target_name}}" via WhatsApp. | Após processar leitura pra terceiro |

### Emails de marketing (Resend, só opt-in — plano v2)

Só pra leads com `email_opt_in = true`.

| Tipo                  | Assunto (exemplo)                                     | Segmentação                              |
| --------------------- | ----------------------------------------------------- | ---------------------------------------- |
| Reengajamento         | "Faz tempo que suas mãos não falam."                  | Leads que não voltaram em 14+ dias       |
| Promoção por elemento | "Fogo precisa de respostas. Pacote Roda com 33% off." | Por elemento da leitura                  |
| Leitura pra parceiro  | "Já leu a mão de quem dorme do seu lado?"             | Leads que fizeram só 1 leitura (própria) |

### Regras dos emails

- Tom cigana em TODOS os emails. Sem linguagem corporativa. Sem "Prezado(a)".
- Zero travessões (—). Zero menção a tecnologia/IA/algoritmo.
- Sempre em segunda pessoa.
- Remetente: `cigana@maosfalam.com.br` (quando tiver domínio) ou `noreply@maosfalam.com.br`
- Unsubscribe obrigatório nos emails de marketing (Resend gerencia).

---

## 11. API Routes

| Método | Rota                    | Auth       |
| ------ | ----------------------- | ---------- |
| POST   | /api/lead/register      | Não        |
| POST   | /api/reading/capture    | Não        |
| GET    | /api/reading/[id]       | Não        |
| POST   | /api/reading/new        | Sim        |
| POST   | /api/credits/purchase   | Sim (stub) |
| GET    | /api/user/credits       | Sim        |
| GET    | /api/user/readings      | Sim        |
| GET    | /api/user/profile       | Sim        |
| PUT    | /api/user/profile       | Sim        |
| DELETE | /api/user/account       | Sim        |
| POST   | /api/webhook/abacatepay | Assinatura (stub) |

---

## 12. Pacotes de Créditos

```typescript
export const CREDIT_PACKS = {
  avulsa: { credits: 1, price_cents: 1490, label: "Avulsa" },
  dupla: { credits: 2, price_cents: 2490, label: "Dupla", discount: "16% off" },
  roda: { credits: 5, price_cents: 4990, label: "Roda", discount: "33% off", popular: true },
  tsara: { credits: 10, price_cents: 7990, label: "Tsara", discount: "46% off" },
} as const;
```

Créditos não expiram.

---

## 13. Env Vars

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
OPENAI_API_KEY=sk-...
ABACATEPAY_API_KEY=...
ABACATEPAY_WEBHOOK_SECRET=...
RESEND_API_KEY=re_...
DATABASE_URL=postgresql://...@...neon.tech/maosfalam
NEXT_PUBLIC_BASE_URL=http://localhost:3000
LOG_LEVEL=debug
```

---

## 14. Segurança

### Rate limiting

| Rota                         | Limite          | Por quê                                                                                       |
| ---------------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| POST /api/reading/capture    | 5/hora por IP   | Cada chamada custa R$0,07 (GPT-4o). Sem limite, alguém faz script e gasta seu crédito OpenAI. |
| POST /api/lead/register      | 10/hora por IP  | Evita flood de leads falsas.                                                                  |
| POST /api/credits/purchase   | 5/hora por user | Evita criação de cobranças em loop.                                                           |
| POST /api/webhook/abacatepay | Sem limite      | Vem do AbacatePay, não de usuário. Validação por assinatura.                                  |

Rate limiting implementado como Map in-memory (`src/server/lib/rate-limit.ts`). Migrar para Upstash quando escalar (v2+).

### Validação de inputs

Zod em TODA API route. Nenhum input do client chega na lógica de negócio sem passar por schema Zod. Se o payload não bater, retorna 400 antes de qualquer processamento.

```typescript
// Exemplo: /api/lead/register (Zod v4)
const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  gender: z.enum(["female", "male"]),
  session_id: z.string().min(10).max(64),
  email_opt_in: z.boolean(),
});
```

### Proteção de créditos

- Débito de crédito acontece no SERVER, nunca no client. O client manda "quero fazer leitura", o server verifica saldo, debita, e processa. O client nunca sabe quantos créditos tem no banco direto.
- Débito é atômico (transaction SQL). Não tem como debitar parcial ou duplicado.
- Tier da reading muda só via webhook (servidor AbacatePay → nosso server). O client não consegue mudar tier de free pra premium. Não existe endpoint que aceite `tier: 'premium'` do client.

### Links públicos

- URL de compartilhamento usa o reading ID (UUID, já aleatório): `/compartilhar/[reading_id]`
- Não expira. Link velho que converte é receita grátis.
- Não expõe dados sensíveis. Mostra só versão vitrine (Prólogo + Coração + blur). Sem CPF, email, nem dados de pagamento.
- `is_active = false` desativa o link se a pessoa pedir remoção.

- Validar assinatura do webhook em TODA request. Se a assinatura não bater, retorna 401 e loga como `warn`.
- Handler é idempotente: se o mesmo billing_id chegar duas vezes, a segunda é ignorada (verifica `status === 'paid'` antes de processar).
- Nunca confiar no body do webhook pra valores monetários. Buscar o billing no AbacatePay via API pra confirmar valor e status antes de creditar.

### Headers HTTP

```typescript
// next.config.ts headers
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(self), microphone=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}
```

Vercel já serve tudo via HTTPS. O header HSTS garante que browsers não aceitem HTTP.

### CORS

Só aceita requests do próprio domínio. API routes do Next.js no App Router já são same-origin por default. Se precisar abrir pra outro domínio (nunca no MVP), configura explicitamente.

### Dados pessoais

- CPF: salvo só na tabela `user_profiles`. Nunca logado. Nunca retornado em API pública.
- Email: salvo em `leads`. Nunca exposto em share links.
- Foto da palma: processada e descartada. Nunca armazenada.
- Logs (Pino): NUNCA logam nome, email, CPF, ou qualquer dado pessoal. Só IDs e ações.

### API keys no servidor

- `OPENAI_API_KEY`, `ABACATEPAY_API_KEY`, `CLERK_SECRET_KEY`, `RESEND_API_KEY`, `DATABASE_URL`: só em env vars do servidor. Nunca no client. Nunca prefixadas com `NEXT_PUBLIC_`.
- Só `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` e `NEXT_PUBLIC_BASE_URL` vão pro client (são públicas por design).

---

## 15. Git

- `develop`: trabalho livre
- `main`: protegida, checks obrigatórios
- `feature/*`: só quando a mudança for maior ou arriscada

---

## 16. Setup Local

```bash
git clone [repo] && cd MaosFalam
npm install
cp .env.example .env.local    # preencher com suas keys (DATABASE_URL aponta pra Neon develop)
npx prisma generate           # gera types do banco em src/generated/prisma/
npm run dev                   # http://localhost:3000
```

**Neon branches:**
- `main`: produção (vinculada à branch git main)
- `develop`: desenvolvimento (vinculada à branch git develop, usar como padrão em .env.local)

**Vercel:**
- `staging.maosfalam.com` → branch develop
- `maosfalam.com` → branch main
