# AbacatePay API v2 — Referencia para Integracao

> Base URL: `https://api.abacatepay.com/v2`
> Auth: Bearer token em todas as requests (`Authorization: Bearer <api-key>`)
> Valores monetarios: sempre em **centavos** (R$14,90 = 1490)
> Docs oficiais: https://docs.abacatepay.com

---

## 1. Customers

### POST /customers/create

```json
// Request
{
  "email": "string",       // OBRIGATORIO
  "name": "string",        // opcional
  "cellphone": "string",   // opcional
  "taxId": "string",       // opcional (CPF/CNPJ)
  "zipCode": "string",     // opcional
  "metadata": {}            // opcional
}

// Response 200
{
  "data": { "id": "cus_xxx", "email": "...", "name": "...", "taxId": "...", ... },
  "error": null,
  "success": true
}
```

### GET /customers/list

Query params: `after`, `before`, `limit` (1-100, default 100), `id`, `email`, `taxId`

### GET /customers/get

Query param: `id` (obrigatorio)

### POST /customers/delete

Query param: `id` (obrigatorio). Irreversivel.

---

## 2. Products

Na v2, produtos sao entidades separadas. Cria uma vez, referencia no checkout por `id`.

### POST /products/create

```json
// Request
{
  "externalId": "string",  // OBRIGATORIO, unico no seu sistema
  "name": "string",        // OBRIGATORIO
  "price": 1490,           // OBRIGATORIO, em centavos (minimo 1)
  "currency": "BRL",       // OBRIGATORIO
  "description": "string", // opcional
  "imageUrl": "string",    // opcional (URI)
  "cycle": null            // null = pagamento unico (default)
                            // WEEKLY | MONTHLY | SEMIANNUALLY | ANNUALLY = assinatura
}

// Response 200
{
  "data": { "id": "prod_xxx", "externalId": "...", "name": "...", "price": 1490, ... },
  "error": null,
  "success": true
}
```

### GET /products/list

Query params: `after`, `before`, `limit`, `id`, `externalId`, `status` (ACTIVE | INACTIVE)

### GET /products/get

Query params: `id` ou `externalId`

### POST /products/delete

Query param: `id`. Irreversivel.

---

## 3. Checkouts (Cobrar com Checkout)

Fluxo: cria checkout > redireciona usuario pra `url` retornada > AbacatePay cuida do pagamento > webhook notifica.

### POST /checkouts/create

```json
// Request
{
  "items": [                    // OBRIGATORIO, minItems 1
    {
      "id": "prod_xxx",        // ID publico do produto (criado em /products/create)
      "quantity": 1             // minimo 1
    }
  ],
  "methods": ["PIX", "CARD"],  // opcional, default ["PIX", "CARD"]
  "returnUrl": "string",       // URI, redirect no botao "Voltar"
  "completionUrl": "string",   // URI, redirect apos pagamento
  "customerId": "cus_xxx",     // opcional, pre-preenche dados do cliente
  "coupons": ["CODE1"],        // opcional, max 50
  "externalId": "string",      // opcional, referencia no seu sistema
  "metadata": {}                // opcional
}

// Response 200
{
  "data": {
    "id": "chk_xxx",
    "url": "https://pay.abacatepay.com/...",  // REDIRECIONAR USUARIO PRA CA
    "amount": 1490,
    "status": "PENDING",
    "items": [...],
    "customerId": "cus_xxx",
    "externalId": "...",
    "createdAt": "..."
  },
  "error": null,
  "success": true
}
```

**Status possiveis:** PENDING | EXPIRED | CANCELLED | PAID | REFUNDED

### GET /checkouts/list

Query params: `after`, `before`, `limit`, `id`, `externalId`, `status`, `email`, `taxId`

### GET /checkouts/get

Query param: `id` (obrigatorio)

---

## 4. Payment Links

Links reutilizaveis (multiplos pagamentos no mesmo link).

### POST /payment-links/create

Mesmo schema do checkout, mas:

- `frequency` = `MULTIPLE_PAYMENTS` (fixo)
- NAO suporta `customerId`

### GET /payment-links/list | GET /payment-links/get

Mesmos params do checkout.

---

## 5. Transparent Checkout (PIX QRCode direto)

Pra quem quer gerar QR Code PIX sem redirecionar pro checkout do AbacatePay.

### POST /transparents/create

```json
// Request
{
  "method": "PIX",              // OBRIGATORIO (unica opcao por enquanto)
  "data": {                     // OBRIGATORIO
    "amount": 1490,             // em centavos
    "expiresIn": 900,           // opcional, segundos (ex: 15min = 900)
    "description": "string",    // opcional, max 140 chars
    "customer": {               // opcional, mas se presente TODOS os campos sao obrigatorios
      "name": "string",
      "cellphone": "string",
      "email": "string",
      "taxId": "string"
    },
    "metadata": {}
  }
}

// Response 200
{
  "data": {
    "id": "trn_xxx",
    "qrCode": "base64...",      // imagem do QR Code
    "copyCola": "00020126...",  // codigo copia-e-cola PIX
    "amount": 1490,
    "status": "PENDING",
    "expiresAt": "2024-...",
    "createdAt": "..."
  },
  "error": null,
  "success": true
}
```

### GET /transparents/check

Query param: `id`

Status possiveis: PENDING | EXPIRED | CANCELLED | PAID | UNDER_DISPUTE | REFUNDED | REDEEMED | APPROVED | FAILED

### POST /transparents/simulate-payment

Query param: `id`. So funciona em dev mode.

### GET /transparents/list

Query params: `after`, `before`, `limit`, `id`, `status`

---

## 6. Subscriptions

### POST /subscriptions/create

```json
{
  "items": [
    // OBRIGATORIO, maxItems 1
    {
      "id": "prod_xxx", // produto com cycle definido
      "quantity": 1
    }
  ],
  "methods": ["CARD"], // assinatura tipicamente so CARD
  "returnUrl": "string",
  "completionUrl": "string",
  "customerId": "cus_xxx",
  "coupons": [],
  "externalId": "string",
  "metadata": {}
}
```

### GET /subscriptions/list

Query params: `after`, `before`, `limit`, `id`, `externalId`, `status`, `email`, `taxId`

### POST /subscriptions/cancel

```json
{ "id": "sub_xxx" } // Irreversivel
```

---

## 7. Coupons

### POST /coupons/create

Schema do cupom (campos inferidos do OpenAPI).

### GET /coupons/list

Query params: `after`, `before`, `limit`, `id`, `status` (ACTIVE | INACTIVE | EXPIRED)

### GET /coupons/get | POST /coupons/delete

Query param: `id`

### POST /coupons/toggle

Query param: `id`. Alterna entre ACTIVE/INACTIVE.

---

## 8. Payouts (Saques)

### POST /payouts/create

```json
{
  "amount": 350, // em centavos, minimo 350
  "externalId": "string", // OBRIGATORIO, unico
  "description": "string" // opcional
}
```

### GET /payouts/get

Query param: `externalId`

### GET /payouts/list

Query params: `after`, `before`, `limit`, `id`, `externalId`, `status`

Status: PENDING | EXPIRED | CANCELLED | COMPLETE | REFUNDED

---

## 9. PIX Send

### POST /pix/send

```json
{
  "amount": 100, // em centavos, minimo 1
  "externalId": "string",
  "description": "string",
  "pix": {
    "key": "string", // chave PIX
    "type": "CPF" // CPF | CNPJ | PHONE | EMAIL | RANDOM | BR_CODE
  }
}
```

### GET /pix/get

Query params: `id` ou `externalId` (pelo menos um)

### GET /pix/list

Query params: `after`, `before`, `limit`, `id`, `externalId`, `status`

---

## 10. Store

### GET /store/get

```json
// Response
{
  "data": {
    "id": "store_xxx",
    "name": "MaosFalam",
    "balance": {
      "available": 15000, // em centavos
      "pending": 3000,
      "blocked": 0
    }
  }
}
```

### GET /public-mrr/merchant-info

Retorna: `id`, `name`, `website`, `createdAt`

### GET /public-mrr/mrr

Retorna: `mrr` (centavos), `totalActiveSubscriptions`

### GET /public-mrr/revenue

Query params: `startDate`, `endDate` (YYYY-MM-DD, obrigatorios)
Retorna: `totalRevenue`, `totalTransactions`, `transactionsPerDay`

---

## 11. Webhooks

### Configuracao

Criar no dashboard do AbacatePay: nome, URL (HTTPS), secret.

### Payload padrao (v2)

```json
{
  "id": "log_abc123",
  "event": "checkout.completed",
  "apiVersion": 2,
  "devMode": false,
  "data": {
    /* dados do evento */
  }
}
```

### Eventos disponiveis

| Evento                   | Trigger                   |
| ------------------------ | ------------------------- |
| `checkout.completed`     | Pagamento confirmado      |
| `checkout.refunded`      | Reembolso processado      |
| `checkout.disputed`      | Chargeback/disputa aberta |
| `transparent.completed`  | PIX QRCode pago           |
| `transparent.refunded`   | PIX QRCode reembolsado    |
| `transparent.disputed`   | PIX QRCode disputado      |
| `subscription.completed` | Assinatura ativada        |
| `subscription.renewed`   | Cobranca recorrente ok    |
| `subscription.cancelled` | Assinatura cancelada      |
| `transfer.completed`     | Transferencia ok          |
| `transfer.failed`        | Transferencia falhou      |
| `payout.completed`       | Saque ok                  |
| `payout.failed`          | Saque falhou              |

### Seguranca (2 camadas)

**Camada 1: Secret na URL**

```
https://seusite.com/webhook/abacatepay?webhookSecret=SEU_SECRET
```

```ts
if (req.query.webhookSecret !== process.env.WEBHOOK_SECRET) {
  return res.status(401).json({ error: "Unauthorized" });
}
```

**Camada 2: HMAC-SHA256 com chave publica fixa**

Header: `X-Webhook-Signature`

```ts
import crypto from "node:crypto";

// Chave publica fixa do AbacatePay (nao muda)
const ABACATEPAY_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

export function verifyAbacateSignature(rawBody: string, signatureFromHeader: string) {
  const bodyBuffer = Buffer.from(rawBody, "utf8");
  const expectedSig = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(bodyBuffer)
    .digest("base64");

  const A = Buffer.from(expectedSig);
  const B = Buffer.from(signatureFromHeader);

  return A.length === B.length && crypto.timingSafeEqual(A, B);
}
```

### Payload de checkout.completed

```json
{
  "id": "log_xxx",
  "event": "checkout.completed",
  "apiVersion": 2,
  "devMode": false,
  "data": {
    "id": "chk_xxx",
    "externalId": "...",
    "amount": 1490,
    "paidAmount": 1490,
    "platformFee": 50,
    "status": "PAID",
    "items": [...],
    "customerId": "cus_xxx",
    "receiptUrl": "...",
    "createdAt": "...",
    "customer": {
      "id": "cus_xxx",
      "name": "...",
      "email": "...",
      "taxId": "123.***.***-**"    // MASCARADO
    },
    "payerInformation": {
      "method": "PIX",             // ou "CARD"
      // PIX: payer name, taxId
      // CARD: last4, brand
    }
  }
}
```

**CPF/CNPJ vem mascarado no webhook.** Cartao mostra so ultimos 4 digitos + bandeira.
**Customer pode ser `null`** se checkout foi feito sem customer associado.

### Boas praticas

- Sempre HTTPS
- Validar as 2 camadas de seguranca
- Processar cada evento exatamente uma vez (idempotencia)
- Retornar HTTP 200 so apos processar com sucesso
- **NAO usar Zod pra validacao estrita do payload** — AbacatePay pode adicionar campos novos

---

## 12. Paginacao (padrao em todos os list)

```json
{
  "data": [...],
  "pagination": {
    "hasNextPage": true,
    "hasPreviousPage": false,
    "nextCursor": "cursor_xxx",
    "previousCursor": null
  },
  "success": true,
  "error": null
}
```

Usar `after` e `before` como query params pra navegar.

---

## 13. Mapeamento MaosFalam → AbacatePay v2

### Setup (uma vez)

Criar 4 produtos no AbacatePay:

| Pack   | externalId  | name             | price | cycle |
| ------ | ----------- | ---------------- | ----- | ----- |
| Avulsa | `mf_avulsa` | MaosFalam Avulsa | 1490  | null  |
| Dupla  | `mf_dupla`  | MaosFalam Dupla  | 2490  | null  |
| Roda   | `mf_roda`   | MaosFalam Roda   | 4990  | null  |
| Tsara  | `mf_tsara`  | MaosFalam Tsara  | 7990  | null  |

### Fluxo de compra

```
1. POST /customers/create (se nao tem abacatepay_customer_id)
   { email }  // so email obrigatorio na v2

2. POST /checkouts/create
   {
     items: [{ id: "prod_xxx", quantity: 1 }],
     methods: ["PIX", "CARD"],
     returnUrl: BASE_URL + "/creditos",
     completionUrl: BASE_URL + "/conta/leituras",
     customerId: "cus_xxx",
     externalId: `payment_${payment.id}`,
     metadata: { pack_type, reading_id }
   }

3. Redirecionar usuario pra response.data.url

4. Webhook checkout.completed chega
   → Validar assinatura
   → Buscar payment por externalId
   → Transaction: mark paid → create credit_pack → debit 1 FIFO → upgrade tier
```

### Diferencas do codigo atual

| Aspecto           | Codigo atual (v1)                             | Necessario (v2)                                              |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------ |
| Criar cobranca    | `POST /v1/billing/create` com products inline | `POST /v2/checkouts/create` com items referenciando produtos |
| Customer          | name+cellphone+email+taxId obrigatorios       | so email obrigatorio                                         |
| Webhook event     | `billing.paid`                                | `checkout.completed`                                         |
| Webhook signature | HMAC com WEBHOOK_SECRET do .env               | HMAC com chave publica fixa                                  |
| Metodos           | `["PIX"]` hardcoded                           | `["PIX", "CARD"]` default                                    |
