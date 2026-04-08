# MaosFalam: Arquitetura Tecnica

## Pipeline de Dados

1. Usuaria abre camera (getUserMedia + MediaPipe valida posicao)
2. Foto capturada e enviada ao backend via API Route
3. Backend faz upload no R2 e chama API de visao multimodal
4. API retorna JSON de atributos da mao
5. Motor de leitura cruza atributos com banco de blocos e monta relatorio
6. Relatorio salvo no Neon e renderizado no frontend

## Storage

- **Neon DB**: dados relacionais (users, readings, blocks, payments). Sem blobs.
- **Cloudflare R2**: fotos das maos. S3 compativel. Free: 10GB + 10M req/mes.
- **Neon armazena referencia** (photo_key), nao a foto.
- Anonimas: foto deletada do R2 em 24h. Com conta: mantida.

## Database Schema (Prisma)

### users
id (UUID PK), name, email (UNIQUE), phone?, auth_provider (email|google|apple),
auth_provider_id?, is_premium (default false), premium_until?, created_at, updated_at

### readings
id (UUID PK), user_id? (FK), session_id, photo_key, photo_hand (left|right|both),
attributes (JSONB), report (JSONB), tier (free|premium), share_token (UNIQUE),
share_expires_at, is_active (default true), created_at

### reading_blocks
id (UUID PK), axis, variation, tier (free|premium), block_type (intro|body|impact|cross),
content (TEXT), content_alt?, content_alt2?, sort_order, is_active (default true)

### compatibility_matrix
id (UUID PK), element_a, element_b, label, content

### payments
id (UUID PK), user_id? (FK), reading_id (FK), abacatepay_billing_id,
amount_brl (INTEGER centavos), payment_method (pix|card), status (pending|paid|failed|refunded),
credits_purchased (INTEGER), created_at

### credit_balances
id (UUID PK), user_id (FK UNIQUE), balance (INTEGER default 0),
expires_at (TIMESTAMP 90 dias), updated_at

## API Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/reading/capture | Foto > R2 > visao IA > atributos | No |
| POST | /api/reading/generate | Atributos > blocos > report | No |
| GET | /api/reading/[token] | Busca por share_token | No |
| POST | /api/reading/[id]/unlock | Consome credito, desbloqueia premium | Yes |
| POST | /api/auth/register | Email ou OAuth | No |
| POST | /api/auth/login | Login > JWT | No |
| GET | /api/user/readings | Lista leituras | Yes |
| GET | /api/user/credits | Saldo de creditos | Yes |
| POST | /api/payment/create | Gera billing AbacatePay (PIX ou cartao) | Optional |
| POST | /api/webhook/abacatepay | Webhook confirma pagamento | AbacatePay sig |
| GET | /api/share/[token]/og | Gera OG image dinamica | No |

## DDD Bounded Contexts

```
/src/server/domains/
  /reading     - captura, analise, montagem
  /content     - blocos, motor de quebra-cabeca
  /identity    - auth, usuarios, sessoes
  /payment     - AbacatePay, creditos, desbloqueio
  /sharing     - links publicos, share cards, OG
/src/server/shared/
  /logger      - Pino structured logging
  /errors      - DomainError base class
  /middleware   - auth, rate limit, validation
  /config      - env vars tipadas
```

## Error Handling

```typescript
// DomainError
throw new DomainError('LOW_CONFIDENCE', 'Suas linhas estao timidas hoje.', 422)
throw new DomainError('INVALID_PHOTO', 'Nao consegui ver sua mao.', 400)
throw new DomainError('NO_CREDITS', 'Voce precisa de creditos.', 402)
throw new DomainError('TOKEN_EXPIRED', 'Essa leitura expirou.', 410)
```

Logging levels: DEV=debug, STAGING=info, PROD=warn.
NUNCA logar dados pessoais (email, nome, foto).

## CI/CD (GitHub Actions)

```yaml
# Em todo push pra develop e PRs pra main:
- npm ci
- npm run lint          # ESLint (no-console)
- npm run type-check    # tsc --noEmit  
- npm run test          # Vitest
- npm run test:e2e      # Playwright (so PRs pra main)
```

Vercel auto-deploy em push pra main. Branch protection: CI passing required.

## Monetizacao

| Pacote | Creditos | Preco | Taxa PIX | Taxa Cartao | Margem PIX | Margem Cartao |
|--------|----------|-------|----------|-------------|------------|---------------|
| Avulsa | 1 | R$14,90 | R$0,80 | R$1,12 | 93,8% | 91,6% |
| Dupla | 2 | R$24,90 | R$0,80 | R$1,47 | 95,7% | 93,1% |
| Roda | 5 | R$49,90 | R$0,80 | R$2,35 | 97,1% | 94,0% |
| Tsara | 10 | R$79,90 | R$0,80 | R$3,40 | 97,4% | 94,1% |

Custo IA por leitura: ~R$0,13. Creditos expiram em 90 dias.
