/**
 * Memória curta do checkout pra preservar a intenção de compra quando a
 * usuária precisa passar por login/cadastro no meio do fluxo.
 *
 * Fluxo:
 *   1. Usuária escolhe pacote + clica em "Pagar" na /creditos
 *   2. Se não estiver logada, abre modal requires_login
 *   3. Antes de qualquer navegação de auth, chama `saveCheckoutIntent()`
 *      pra guardar o pacoteId + method escolhidos
 *   4. Usuária faz login/cadastro (no modal via Google, ou /login, ou /registro)
 *   5. Após login bem-sucedido, o /login chama `consumeCheckoutIntent()`:
 *      - Se houver intent salvo, redireciona pra /creditos com o pacoteId
 *        na URL (pacoteId é aplicado no mount da /creditos)
 *      - Caso contrário, redireciona pra /conta/leituras
 *   6. /creditos no mount lê o ?pacote= da URL e seta selectedPacote,
 *      já começando a usuária direto no resumo de pagamento.
 *
 * Usa sessionStorage pra não persistir entre sessões (compras são
 * intenções efêmeras).
 */

const KEY = "maosfalam_checkout_intent";

export interface CheckoutIntent {
  pacoteId: string;
  method: "pix" | "card";
  savedAt: number;
}

export function saveCheckoutIntent(pacoteId: string, method: "pix" | "card"): void {
  if (typeof window === "undefined") return;
  const intent: CheckoutIntent = {
    pacoteId,
    method,
    savedAt: Date.now(),
  };
  window.sessionStorage.setItem(KEY, JSON.stringify(intent));
}

export function readCheckoutIntent(): CheckoutIntent | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CheckoutIntent;
    // Expira em 30min
    if (Date.now() - parsed.savedAt > 30 * 60 * 1000) {
      window.sessionStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function consumeCheckoutIntent(): CheckoutIntent | null {
  const intent = readCheckoutIntent();
  if (intent && typeof window !== "undefined") {
    window.sessionStorage.removeItem(KEY);
  }
  return intent;
}
