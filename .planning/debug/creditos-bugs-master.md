# Creditos Page — Bug Master List

Status: investigating
Date: 2026-04-14

## Blocker

### BUG-A: POST /api/credits/purchase returns 500 on staging

- **Evidence**: 5 payments criados no banco com `abacatepay_checkout_id = null`
- **Step tracking added**: novo deploy mostra step exato do crash
- **Hypothesis**: crash no `resolve-product` ou `create-checkout` (AbacatePay API call)
- **Status**: aguardando teste com step tracking

## Frontend Bugs

### BUG-B: Acentuacao faltando em /creditos

- Header: "Uma leitura e diferente" → "Uma leitura é diferente"
- Cards: "Pra voce. Sozinha." → "Pra você. Sozinha." (e todos os outros)
- Todos os textos PACOTES[] e copy da pagina

### BUG-C: Card pula de posicao quando botao carrega

- Clicar "Escolher" seta `purchasing=true` que muda texto do botao
- Framer Motion AnimatePresence re-renderiza e card pula
- Fix: garantir que estado de loading nao cause re-layout do card

### BUG-D: CPF pedido toda vez

- Logica: `getUserProfile()` checa se `cpf !== null`
- Se gravar cpf na primeira compra, proximas nao pedem
- Verificar se o `create-customer` salva cpf no perfil corretamente
- CPF so e necessario pro AbacatePay? Ou pra nota fiscal?

## Design Questions

### Q1: Clerk + AbacatePay CPF flow

- Google OAuth nao coleta CPF
- AbacatePay v2 customer creation so precisa de email
- CPF e coletado no /creditos no primeiro pagamento
- Gravar em user_profiles.cpf e enviar pro AbacatePay como taxId
- Flow: primeiro pagamento pede CPF → grava → proximos skip

### Q2: Users Clerk no Neon

- Neon armazena: clerk_user_id, cpf, abacatepay_customer_id
- Neon NAO armazena: name, email, foto (vem do Clerk)
- Intencional: Clerk e source of truth, Neon so tem dados de pagamento
- Isso e correto pra LGPD: menos dados pessoais no banco

## Cleanup Needed

### Payments orfaos

- 5 payments pending com checkout_id null no banco (tentativas falhadas)
- Limpar apos fix do BUG-A
