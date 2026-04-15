"use client";

/**
 * Modal de compra de créditos — flow da usuária LOGADA.
 *
 * Contexto: na /conta/leituras (e outros lugares da área logada) o botão
 * "Comprar mais créditos" abre ESTE modal em vez de navegar pra /creditos.
 * O motivo é que a pessoa logada já conhece o produto — não precisa do
 * storytelling completo da landing de créditos, só precisa escolher o
 * pacote rápido e finalizar.
 *
 * Fluxo atual (MVP): mostra os 4 pacotes como mini-cartas, ao clicar a
 * usuária é levada pra /creditos?pacote={id} que pula o deck de tarot e
 * cai direto na seção de pagamento com o pacote já selecionado.
 *
 * Futuro (backend): quando o checkout inline existir, esse modal pode
 * passar a ter método de pagamento (pix/card) + CTA de pagar tudo
 * dentro do modal, sem navegação nenhuma.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { initiatePurchase } from "@/lib/payment-client";

interface Pacote {
  id: string;
  nome: string;
  creditos: number;
  preco: number;
  paraQuem: string;
  tagline: string;
  popular?: boolean;
}

const PACOTES: readonly Pacote[] = [
  {
    id: "avulsa",
    nome: "Avulsa",
    creditos: 1,
    preco: 14.9,
    paraQuem: "Pra você. Sozinha.",
    tagline: "Uma mão. Uma voz. Uma verdade.",
  },
  {
    id: "dupla",
    nome: "Dupla",
    creditos: 2,
    preco: 24.9,
    paraQuem: "Pra você e pra quem te importa.",
    tagline: "Duas mãos, lado a lado.",
  },
  {
    id: "roda",
    nome: "Roda",
    creditos: 5,
    preco: 49.9,
    popular: true,
    paraQuem: "Pra fechar o círculo.",
    tagline: "Cinco mãos. Cinco histórias.",
  },
  {
    id: "tsara",
    nome: "Tsara",
    creditos: 10,
    preco: 79.9,
    paraQuem: "Pra quando é festa.",
    tagline: "Dez mãos. A casa inteira.",
  },
];

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPorLeitura(v: number, c: number): string {
  return formatBRL(v / c);
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BuyCreditsModal({ open, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOpen, setLastOpen] = useState(false);

  // Reset state on open (render-time rising-edge, no useEffect setState)
  if (open && !lastOpen) {
    setSelected(null);
    setPurchasing(false);
    setError(null);
    setLastOpen(true);
  } else if (!open && lastOpen) {
    setLastOpen(false);
  }

  // Esc fecha + trava scroll do body
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !purchasing) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, purchasing]);

  const handleBuy = useCallback(async () => {
    if (!selected) return;
    setPurchasing(true);
    setError(null);
    try {
      const result = await initiatePurchase(selected);
      window.location.href = result.checkout_url;
    } catch {
      setError("Algo saiu do caminho. Tenta de novo.");
      setPurchasing(false);
    }
  }, [selected]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-credits-title"
          onClick={onClose}
        >
          {/* Backdrop blur */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: "rgba(4,2,8,0.82)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          />

          {/* Card do modal */}
          <motion.article
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="card-noise relative overflow-hidden w-full max-w-md max-h-[90dvh] overflow-y-auto bg-deep border border-gold/35 px-6 pt-9 pb-7"
            style={{
              boxShadow:
                "0 40px 80px -20px rgba(0,0,0,0.95), 0 0 80px -8px rgba(201,162,74,0.22), 0 0 1px rgba(201,162,74,0.5)",
            }}
          >
            {/* Radial glow interno */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(201,162,74,0.12), transparent 70%)",
              }}
            />

            {/* 4 corner accents */}
            {(
              [
                ["top", "left"],
                ["top", "right"],
                ["bottom", "left"],
                ["bottom", "right"],
              ] as const
            ).map(([v, h]) => (
              <span
                key={`${v}-${h}`}
                aria-hidden
                className="absolute"
                style={{
                  [v]: 4,
                  [h]: 4,
                  width: 14,
                  height: 14,
                  borderStyle: "solid",
                  borderColor: "rgba(201,162,74,0.6)",
                  borderWidth: `${v === "top" ? "2px" : "0"} ${h === "right" ? "2px" : "0"} ${v === "bottom" ? "2px" : "0"} ${h === "left" ? "2px" : "0"}`,
                }}
              />
            ))}

            {/* Close X */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-bone-dim hover:text-gold transition-colors focus:outline-none"
            >
              <span className="font-cinzel text-[22px] leading-none" aria-hidden>
                ×
              </span>
            </button>

            <div className="relative flex flex-col">
              {/* Deco topo */}
              <div className="flex items-center gap-2 mb-4 justify-center">
                <span className="h-px w-8 bg-gold-dim/50" />
                <span
                  className="w-1.5 h-1.5 rotate-45 bg-gold"
                  style={{ boxShadow: "0 0 8px rgba(201,162,74,0.7)" }}
                />
                <span className="h-px w-8 bg-gold-dim/50" />
              </div>

              {/* Eyebrow + título */}
              <span
                className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold mb-2 text-center"
                style={{ fontWeight: 500 }}
              >
                Escolha um pacote
              </span>
              <h3
                id="buy-credits-title"
                className="font-cinzel text-[22px] sm:text-[24px] text-bone leading-[1.2] mb-6 text-center"
              >
                Mais mãos, mais verdades.
              </h3>

              {/* Lista de pacotes — selecionar */}
              <div className="flex flex-col gap-2.5">
                {PACOTES.map((p) => {
                  const isSelected = selected === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={purchasing}
                      onClick={() => setSelected(p.id)}
                      className="group relative text-left transition-all focus:outline-none p-4 pl-[18px]"
                      style={{
                        background: isSelected ? "rgba(201,162,74,0.08)" : "rgba(17,12,26,0.7)",
                        border: isSelected
                          ? "1px solid rgba(201,162,74,0.5)"
                          : "1px solid rgba(201,162,74,0.12)",
                      }}
                    >
                      {/* Badge popular */}
                      {p.popular && (
                        <span
                          className="absolute -top-2.5 right-3 font-jetbrains text-[7px] tracking-[1.2px] uppercase px-2 py-0.5 text-gold bg-deep border border-gold/45"
                          style={{ fontWeight: 500 }}
                        >
                          popular
                        </span>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <h4 className="font-cinzel text-[16px] sm:text-[18px] font-medium tracking-[0.04em] text-gold leading-none">
                              {p.nome}
                            </h4>
                            <span className="font-raleway text-[11px] text-bone-dim">
                              {p.creditos} {p.creditos === 1 ? "leitura" : "leituras"}
                            </span>
                          </div>
                          <p className="font-raleway text-[13px] text-bone-dim leading-[1.4] mt-1">
                            {p.paraQuem}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end">
                          <span className="font-cinzel text-[18px] sm:text-[20px] text-gold leading-none">
                            {formatBRL(p.preco)}
                          </span>
                          <span className="font-raleway text-[11px] text-bone-dim mt-1">
                            {formatPorLeitura(p.preco, p.creditos)} cada
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <p className="font-raleway text-[13px] text-rose text-center mt-3">{error}</p>
              )}

              {/* CTA */}
              <div className="mt-5">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!selected || purchasing}
                  onClick={() => void handleBuy()}
                  className="w-full !text-[13px]"
                >
                  {purchasing ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="block w-3.5 h-3.5 rounded-full border-2 border-bone/20 border-t-bone animate-spin" />
                      Redirecionando...
                    </span>
                  ) : selected ? (
                    `Comprar · ${formatBRL(PACOTES.find((p) => p.id === selected)?.preco ?? 0)}`
                  ) : (
                    "Escolha um pacote"
                  )}
                </Button>
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
