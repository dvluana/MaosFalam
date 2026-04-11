"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";

import { Button, Card, GoogleButton, Input, PageLoading, Toast } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { saveCheckoutIntent, readCheckoutIntent } from "@/lib/checkout-intent";

type PageState =
  | "default"
  | "pix_selected"
  | "card_selected"
  | "processing_payment"
  | "payment_success"
  | "payment_failed_pix_expired"
  | "payment_failed_card_declined"
  | "payment_failed_generic"
  | "requires_login";

type PaymentMethod = "pix" | "card";

interface Pacote {
  id: string;
  nome: string;
  creditos: number;
  preco: number;
  paraQuem: string;
  tagline: string;
  story: string;
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
    story:
      "A primeira vez que eu te leio. Você me estende a palma, eu devolvo o que vi. Simples assim. Não precisa mostrar pra ninguém. Fica entre nós.",
  },
  {
    id: "dupla",
    nome: "Dupla",
    creditos: 2,
    preco: 24.9,
    paraQuem: "Pra você e pra quem te importa.",
    tagline: "Duas mãos, lado a lado.",
    story:
      "A sua e a dele. Ou a sua e a da sua melhor amiga. Ou a sua e a da sua mãe. Uma leitura pra você entender quem você é, outra pra entender quem caminha do seu lado.",
  },
  {
    id: "roda",
    nome: "Roda",
    creditos: 5,
    preco: 49.9,
    popular: true,
    paraQuem: "Pra fechar o círculo.",
    tagline: "Cinco mãos. Cinco histórias.",
    story:
      "A roda é onde as ciganas se sentam no chão e cada uma mostra a palma. Você lê a sua e escolhe mais quatro. A família, as amigas da infância, o grupo que te conhece de verdade. Todo mundo sai sabendo.",
  },
  {
    id: "tsara",
    nome: "Tsara",
    creditos: 10,
    preco: 79.9,
    paraQuem: "Pra quando é festa.",
    tagline: "Dez mãos. A casa inteira.",
    story:
      "Tsara é nome que as ciganas davam pro encontro grande, quando todo mundo falava de todo mundo e a noite não acabava. Dez leituras, pra você espalhar pela sua gente. Cada uma sai com algo pra carregar.",
  },
];

const PIX_CODE = "00020126580014br.gov.bcb.pix0136a629534e-7693-4846-b028-2c3e7a8e5204";

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatPorLeitura(v: number, c: number): string {
  return formatBRL(v / c);
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CreditosPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CreditosInner />
    </Suspense>
  );
}

function CreditosInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();

  const [pageState, setPageState] = useState<PageState>("default");

  // Deck: a carta atual é a "selecionada". Default inicia em Roda (index 2),
  // mas pode ser sobrescrita pelo ?pacote= ou pelo intent salvo no checkout.
  const initialIdx = (() => {
    const fromUrl = params?.get("pacote");
    if (fromUrl) {
      const idx = PACOTES.findIndex((p) => p.id === fromUrl);
      if (idx >= 0) return idx;
    }
    return 2;
  })();
  const [deckIdx, setDeckIdx] = useState<number>(initialIdx);
  const [direction, setDirection] = useState<1 | -1>(1);
  const selectedPacote = PACOTES[deckIdx]?.id ?? "roda";

  const goTo = (idx: number) => {
    const total = PACOTES.length;
    const next = ((idx % total) + total) % total;
    setDirection(next > deckIdx ? 1 : -1);
    setDeckIdx(next);
  };

  const goPrev = () => goTo(deckIdx - 1);
  const goNext = () => goTo(deckIdx + 1);

  const scrollToPagamento = () => {
    if (typeof window === "undefined") return;
    const el = document.getElementById("pagamento");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [timer, setTimer] = useState<number>(15 * 60);
  const [copied, setCopied] = useState<boolean>(false);

  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");

  const [loginLoading] = useState<boolean>(false);

  const pacote = useMemo(
    () => PACOTES.find((p) => p.id === selectedPacote) ?? null,
    [selectedPacote],
  );

  // Ao montar com user logado: se há intent salvo, restaura pacote/método
  // e rola direto pra seção de pagamento (o login deu certo, a pessoa volta
  // exatamente onde estava).
  useEffect(() => {
    if (!user) return;
    const intent = readCheckoutIntent();
    if (!intent) return;
    const idx = PACOTES.findIndex((p) => p.id === intent.pacoteId);
    const frame = window.requestAnimationFrame(() => {
      if (idx < 0) return;
      setDeckIdx(idx);
      setMethod(intent.method);
      // scroll suave pra seção de pagamento
      window.setTimeout(() => {
        const el = document.getElementById("pagamento");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [user]);

  // Timer PIX
  useEffect(() => {
    if (pageState !== "pix_selected") return;
    const id = window.setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          setPageState("payment_failed_pix_expired");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [pageState]);

  // Auto-redirect success
  useEffect(() => {
    if (pageState !== "payment_success") return;
    const id = window.setTimeout(() => {
      // Se havia uma leitura pendente (usuária clicou em "Desbloquear tudo"
      // num resultado free), volta exatamente pra essa leitura em modo
      // completo. Senão, cai na lista de leituras.
      const pending =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("maosfalam_pending_reading")
          : null;
      if (pending) {
        window.sessionStorage.removeItem("maosfalam_pending_reading");
        router.push(`/ler/resultado/${pending}/completo`);
      } else {
        router.push("/conta/leituras");
      }
    }, 1500);
    return () => window.clearTimeout(id);
  }, [pageState, router]);

  // Processing -> success
  useEffect(() => {
    if (pageState !== "processing_payment") return;
    const id = window.setTimeout(() => {
      setPageState("payment_success");
    }, 2000);
    return () => window.clearTimeout(id);
  }, [pageState]);

  function handlePagar(): void {
    if (!pacote) return;
    if (!user) {
      // Salva intenção pra preservar contexto se a usuária sair pra login
      saveCheckoutIntent(pacote.id, method);
      setPageState("requires_login");
      return;
    }
    if (method === "pix") {
      setTimer(15 * 60);
      setPageState("pix_selected");
    } else {
      setPageState("card_selected");
    }
  }

  function handleCopyPix(): void {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(PIX_CODE).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCardSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setPageState("processing_payment");
  }

  function handleGoogleLogin(): void {
    router.push("/login?return=/creditos");
  }

  function handleRetry(): void {
    setPageState("default");
    setTimer(15 * 60);
  }

  return (
    <main className="min-h-screen velvet-bg text-bone font-raleway">
      <div className="mx-auto max-w-2xl px-5 pt-28 pb-16">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 justify-center mb-6">
          <span
            className="h-px w-10"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.55))",
            }}
          />
          <span
            className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold whitespace-nowrap"
            style={{ fontWeight: 500 }}
          >
            A minha tabela
          </span>
          <span
            className="h-px w-10"
            style={{
              background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
            }}
          />
        </div>

        <header className="text-center mb-12">
          <h1 className="font-cinzel text-[28px] sm:text-[34px] text-bone leading-tight mb-4">
            Escolha o que faz sentido.
          </h1>
          <p className="font-cormorant italic text-[18px] sm:text-[22px] text-bone-dim leading-[1.4] max-w-md mx-auto">
            Uma leitura é diferente de cinco. E cinco é diferente de dez. Cada pacote é um jeito de
            fazer isso. Você escolhe quantas mãos vão passar por aqui.
          </p>
        </header>

        {/* Deck de tarot: 1 carta por vez com setas laterais */}
        <section className="relative mb-10" aria-label="Pacotes de créditos">
          {/* Container do deck */}
          <div className="relative flex items-center justify-center">
            {/* Seta esquerda */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Pacote anterior"
              className="absolute left-0 sm:left-[-12px] z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center focus:outline-none transition-all hover:scale-110"
              style={{
                background: "rgba(14,10,24,0.9)",
                border: "1px solid rgba(201,162,74,0.35)",
                borderRadius: "0 4px 0 4px",
                boxShadow: "0 10px 24px -8px rgba(0,0,0,0.8), 0 0 18px -6px rgba(201,162,74,0.25)",
              }}
            >
              <span className="font-cinzel text-[22px] text-gold leading-none" aria-hidden>
                ‹
              </span>
            </button>

            {/* Carta central + peeks laterais */}
            <div className="relative mx-auto" style={{ width: "min(100%, 440px)" }}>
              {/* Peek da carta anterior — escondida atrás à esquerda */}
              <div
                aria-hidden
                className="absolute inset-y-4 -left-3 w-8 pointer-events-none hidden sm:block"
                style={{
                  background: "#0e0a18",
                  border: "1px solid rgba(201,162,74,0.12)",
                  transform: "rotate(-3deg)",
                  opacity: 0.5,
                  zIndex: 1,
                }}
              />
              {/* Peek da carta seguinte — escondida atrás à direita */}
              <div
                aria-hidden
                className="absolute inset-y-4 -right-3 w-8 pointer-events-none hidden sm:block"
                style={{
                  background: "#0e0a18",
                  border: "1px solid rgba(201,162,74,0.12)",
                  transform: "rotate(3deg)",
                  opacity: 0.5,
                  zIndex: 1,
                }}
              />

              {/* Carta ativa */}
              <div
                className="relative"
                style={{
                  minHeight: 480,
                  zIndex: 10,
                }}
              >
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  {(() => {
                    const p = PACOTES[deckIdx]!;
                    const num = String(deckIdx + 1).padStart(2, "0");
                    return (
                      <motion.button
                        type="button"
                        key={p.id}
                        custom={direction}
                        initial={{
                          opacity: 0,
                          x: direction * 60,
                          rotate: direction * 4,
                        }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        exit={{
                          opacity: 0,
                          x: -direction * 60,
                          rotate: -direction * 4,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 180,
                          damping: 22,
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.3}
                        onDragEnd={(_, info) => {
                          if (info.offset.x < -60) goNext();
                          else if (info.offset.x > 60) goPrev();
                        }}
                        onClick={scrollToPagamento}
                        className="block w-full text-left focus:outline-none cursor-pointer"
                        aria-label={`Pacote ${p.nome}`}
                      >
                        <article
                          className="card-noise relative overflow-hidden px-6 py-8 sm:px-9 sm:py-10"
                          style={{
                            background: "#0e0a18",
                            border: "1px solid rgba(201,162,74,0.45)",
                            boxShadow:
                              "0 30px 60px -16px rgba(0,0,0,0.9), 0 0 56px -8px rgba(201,162,74,0.25), 0 0 1px rgba(201,162,74,0.3)",
                          }}
                        >
                          {/* Radial glow gold — carta ativa */}
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0"
                            style={{
                              background:
                                "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(201,162,74,0.12), transparent 70%)",
                            }}
                          />

                          {/* Corner accents — 4 cantos pra dar cara de carta */}
                          <span
                            aria-hidden
                            className="absolute w-[14px] h-[14px] top-2 left-2 border-t border-l"
                            style={{ borderColor: "rgba(201,162,74,0.7)" }}
                          />
                          <span
                            aria-hidden
                            className="absolute w-[14px] h-[14px] top-2 right-2 border-t border-r"
                            style={{ borderColor: "rgba(201,162,74,0.7)" }}
                          />
                          <span
                            aria-hidden
                            className="absolute w-[14px] h-[14px] bottom-2 left-2 border-b border-l"
                            style={{ borderColor: "rgba(201,162,74,0.7)" }}
                          />
                          <span
                            aria-hidden
                            className="absolute w-[14px] h-[14px] bottom-2 right-2 border-b border-r"
                            style={{ borderColor: "rgba(201,162,74,0.7)" }}
                          />

                          {/* Deco tarot: losango ornamental topo-centro */}
                          <div
                            aria-hidden
                            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2"
                          >
                            <span className="h-px w-6 bg-gold-dim/50" />
                            <span
                              className="w-1.5 h-1.5 rotate-45 bg-gold"
                              style={{ boxShadow: "0 0 6px rgba(201,162,74,0.6)" }}
                            />
                            <span className="h-px w-6 bg-gold-dim/50" />
                          </div>

                          {/* Badge popular */}
                          {p.popular && (
                            <div className="absolute top-4 right-4">
                              <span
                                className="font-jetbrains text-[8.5px] tracking-[1.5px] uppercase text-gold px-3 py-1.5"
                                style={{
                                  fontWeight: 500,
                                  background: "rgba(201,162,74,0.1)",
                                  border: "1px solid rgba(201,162,74,0.45)",
                                  borderRadius: "0 4px 0 4px",
                                }}
                              >
                                mais escolhida
                              </span>
                            </div>
                          )}

                          <div className="relative flex flex-col">
                            {/* Header: número + nome */}
                            <div className="flex items-baseline gap-3 mb-1">
                              <span
                                className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold-dim"
                                style={{ fontWeight: 500 }}
                              >
                                Pacote {num}
                              </span>
                              <span className="h-px flex-1 bg-gold-dim/20" />
                            </div>

                            <h2 className="font-cinzel text-[30px] sm:text-[36px] font-medium tracking-[0.04em] text-gold leading-[0.95] mb-3">
                              {p.nome}
                            </h2>

                            {/* Pra quem */}
                            <span
                              className="font-jetbrains text-[9.5px] tracking-[1.5px] uppercase text-bone-dim mb-5"
                              style={{ fontWeight: 500 }}
                            >
                              {p.paraQuem}
                            </span>

                            {/* Tagline impactante */}
                            <p
                              className="font-cormorant italic text-[20px] sm:text-[24px] text-bone leading-[1.3] mb-4"
                              style={{
                                textShadow:
                                  "0 0 18px rgba(201,162,74,0.25), 0 0 32px rgba(201,162,74,0.1)",
                              }}
                            >
                              {p.tagline}
                            </p>

                            {/* Story */}
                            <p className="font-raleway text-[14px] sm:text-[15px] font-light leading-[1.8] text-bone-dim mb-7">
                              {p.story}
                            </p>

                            {/* Divisor sutil */}
                            <div
                              className="h-px w-full mb-5"
                              style={{
                                background:
                                  "linear-gradient(90deg, transparent, rgba(201,162,74,0.2), transparent)",
                              }}
                            />

                            {/* Footer: créditos + preço */}
                            <div className="flex items-end justify-between gap-4">
                              <div className="flex flex-col">
                                <span
                                  className="font-jetbrains text-[9px] tracking-[1.5px] uppercase text-gold-dim mb-1"
                                  style={{ fontWeight: 500 }}
                                >
                                  {p.creditos} {p.creditos === 1 ? "leitura" : "leituras"}
                                </span>
                                <span className="font-cormorant italic text-[13px] text-bone-dim">
                                  {formatPorLeitura(p.preco, p.creditos)} cada
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span
                                  className="font-cinzel text-[28px] sm:text-[34px] text-gold leading-none"
                                  style={{
                                    textShadow:
                                      "0 0 24px rgba(201,162,74,0.5), 0 0 48px rgba(201,162,74,0.25)",
                                  }}
                                >
                                  {formatBRL(p.preco)}
                                </span>
                              </div>
                            </div>

                            {/* Hint de toque pra ir pro pagamento */}
                            <div
                              className="mt-5 pt-4 flex items-center justify-center"
                              style={{
                                borderTop: "1px solid rgba(201,162,74,0.2)",
                              }}
                            >
                              <span
                                className="font-jetbrains text-[9px] tracking-[1.5px] uppercase text-gold-dim flex items-center gap-2"
                                style={{ fontWeight: 500 }}
                              >
                                <span className="w-1 h-1 rotate-45 bg-gold-dim" />
                                Toque pra escolher esse
                                <span aria-hidden className="text-gold text-[12px]">
                                  ↓
                                </span>
                                <span className="w-1 h-1 rotate-45 bg-gold-dim" />
                              </span>
                            </div>
                          </div>
                        </article>
                      </motion.button>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </div>

            {/* Seta direita */}
            <button
              type="button"
              onClick={goNext}
              aria-label="Próximo pacote"
              className="absolute right-0 sm:right-[-12px] z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center focus:outline-none transition-all hover:scale-110"
              style={{
                background: "rgba(14,10,24,0.9)",
                border: "1px solid rgba(201,162,74,0.35)",
                borderRadius: "0 4px 0 4px",
                boxShadow: "0 10px 24px -8px rgba(0,0,0,0.8), 0 0 18px -6px rgba(201,162,74,0.25)",
              }}
            >
              <span className="font-cinzel text-[22px] text-gold leading-none" aria-hidden>
                ›
              </span>
            </button>
          </div>

          {/* Indicador de posição (dots tarot) */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span
              className="font-jetbrains text-[9px] tracking-[1.5px] uppercase text-gold-dim"
              style={{ fontWeight: 500 }}
            >
              Carta {String(deckIdx + 1).padStart(2, "0")} de{" "}
              {String(PACOTES.length).padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            {PACOTES.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir pro pacote ${p.nome}`}
                className="relative transition-all focus:outline-none"
                style={{
                  width: i === deckIdx ? 24 : 8,
                  height: 4,
                  background: i === deckIdx ? "#c9a24a" : "rgba(201,162,74,0.2)",
                  boxShadow: i === deckIdx ? "0 0 10px rgba(201,162,74,0.6)" : "none",
                }}
              />
            ))}
          </div>
        </section>

        {/* Seção de pagamento destacada */}
        <section id="pagamento" className="scroll-mt-28 mb-12">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 justify-center mb-6">
            <span
              className="h-px w-10"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.55))",
              }}
            />
            <span
              className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold whitespace-nowrap"
              style={{ fontWeight: 500 }}
            >
              Fechar a conta
            </span>
            <span
              className="h-px w-10"
              style={{
                background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
              }}
            />
          </div>

          <article
            className="card-noise relative overflow-hidden px-6 py-8 sm:px-9 sm:py-10"
            style={{
              background: "#0e0a18",
              border: "1px solid rgba(201,162,74,0.18)",
              boxShadow: "0 24px 48px -16px rgba(0,0,0,0.85), 0 0 40px -12px rgba(201,162,74,0.15)",
            }}
          >
            <span
              aria-hidden
              className="absolute w-[10px] h-[10px] top-2 left-2 border-t border-l"
              style={{ borderColor: "rgba(201,162,74,0.5)" }}
            />
            <span
              aria-hidden
              className="absolute w-[10px] h-[10px] bottom-2 right-2 border-b border-r"
              style={{ borderColor: "rgba(201,162,74,0.5)" }}
            />

            <div className="relative flex flex-col gap-6">
              {/* Resumo do pacote selecionado */}
              {pacote ? (
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-[rgba(201,162,74,0.14)]">
                  <div className="flex flex-col">
                    <span
                      className="font-jetbrains text-[9px] tracking-[1.5px] uppercase text-gold-dim mb-1"
                      style={{ fontWeight: 500 }}
                    >
                      Você escolheu
                    </span>
                    <span className="font-cinzel text-[22px] sm:text-[26px] text-gold leading-none">
                      {pacote.nome}
                    </span>
                    <span className="font-cormorant italic text-[14px] text-bone-dim mt-1">
                      {pacote.creditos} {pacote.creditos === 1 ? "leitura" : "leituras"} ·{" "}
                      {formatPorLeitura(pacote.preco, pacote.creditos)} cada
                    </span>
                  </div>
                  <span
                    className="font-cinzel text-[26px] sm:text-[30px] text-gold leading-none"
                    style={{
                      textShadow: "0 0 20px rgba(201,162,74,0.45), 0 0 40px rgba(201,162,74,0.2)",
                    }}
                  >
                    {formatBRL(pacote.preco)}
                  </span>
                </div>
              ) : (
                <p className="font-cormorant italic text-[18px] text-bone-dim text-center">
                  Escolhe um pacote lá em cima primeiro.
                </p>
              )}

              {/* Método de pagamento */}
              <div className="flex flex-col gap-3">
                <span
                  className="font-jetbrains text-[9.5px] tracking-[1.5px] uppercase text-gold-dim"
                  style={{ fontWeight: 500 }}
                >
                  Como você quer pagar
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod("pix")}
                    className="relative px-4 py-4 text-center transition-all focus:outline-none"
                    style={{
                      background: method === "pix" ? "rgba(201,162,74,0.08)" : "transparent",
                      border:
                        method === "pix"
                          ? "1px solid rgba(201,162,74,0.55)"
                          : "1px solid rgba(201,162,74,0.12)",
                    }}
                  >
                    <span
                      className="font-cinzel text-[14px] tracking-[0.06em]"
                      style={{
                        color: method === "pix" ? "#c9a24a" : "#9b9284",
                      }}
                    >
                      Pix
                    </span>
                    <span className="block font-cormorant italic text-[12px] text-bone-dim mt-1">
                      instantâneo
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("card")}
                    className="relative px-4 py-4 text-center transition-all focus:outline-none"
                    style={{
                      background: method === "card" ? "rgba(201,162,74,0.08)" : "transparent",
                      border:
                        method === "card"
                          ? "1px solid rgba(201,162,74,0.55)"
                          : "1px solid rgba(201,162,74,0.12)",
                    }}
                  >
                    <span
                      className="font-cinzel text-[14px] tracking-[0.06em]"
                      style={{
                        color: method === "card" ? "#c9a24a" : "#9b9284",
                      }}
                    >
                      Cartão
                    </span>
                    <span className="block font-cormorant italic text-[12px] text-bone-dim mt-1">
                      crédito ou débito
                    </span>
                  </button>
                </div>
              </div>

              {/* CTA pagar */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!pacote}
                  onClick={handlePagar}
                  className="w-full"
                >
                  Pagar {pacote ? formatBRL(pacote.preco) : ""}
                </Button>
                <p className="font-cormorant italic text-[13px] text-bone-dim text-center">
                  O preço do que você vai descobrir é barato pelo que vale.
                </p>
              </div>
            </div>
          </article>
        </section>

        {/* Estados dinâmicos */}
        {pageState === "pix_selected" && pacote && (
          <Card accentColor="gold">
            <h3 className="font-cinzel text-sm text-gold uppercase tracking-[0.04em] mb-4">
              Pix gerado
            </h3>
            <p className="font-cormorant italic text-base text-bone-dim mb-5">
              Abra o app do banco e escaneie. Você tem {formatTimer(timer)}.
            </p>
            <div
              aria-label="QR Code Pix"
              className="mx-auto mb-5 w-48 h-48 branded-radius"
              style={{
                background: "repeating-conic-gradient(#08050e 0 25%, #e8dfd0 0 50%)",
                backgroundSize: "16px 16px",
              }}
            />
            <p className="font-jetbrains text-[10px] text-violet uppercase tracking-[1.5px] mb-2">
              Código Pix
            </p>
            <p className="font-jetbrains text-[11px] text-bone-dim break-all mb-4 p-3 border border-[rgba(201,162,74,0.08)] branded-radius">
              {PIX_CODE}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button variant="secondary" size="sm" onClick={handleCopyPix}>
                {copied ? "\u2713 Copiado" : "Copiar código Pix"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPageState("processing_payment")}>
                Já paguei
              </Button>
            </div>
          </Card>
        )}

        {pageState === "card_selected" && pacote && (
          <Card accentColor="violet">
            <h3 className="font-cinzel text-sm text-gold uppercase tracking-[0.04em] mb-5">
              Dados do cartão
            </h3>
            <form onSubmit={handleCardSubmit} className="space-y-5">
              <Input
                label="Número do cartão"
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Validade"
                  placeholder="MM/AA"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  required
                />
                <Input
                  label="CVV"
                  placeholder="000"
                  inputMode="numeric"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Nome no cartão"
                placeholder="como está impresso"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
              <div className="pt-2">
                <Button variant="primary" size="lg" type="submit">
                  Pagar {formatBRL(pacote.preco)}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {pageState === "processing_payment" && (
          <Card accentColor="violet">
            <div className="py-6 text-center">
              <p className="font-cormorant italic text-xl text-bone leading-relaxed mb-4">
                O preço do que você vai descobrir é barato pelo que vale.
              </p>
              <p className="font-jetbrains text-[10px] text-violet uppercase tracking-[1.5px]">
                Processando
              </p>
            </div>
          </Card>
        )}

        {pageState === "payment_success" && (
          <Toast
            variant="rose"
            icon="♀"
            message="Suas linhas completas estão esperando."
            detail="pagamento confirmado"
          />
        )}

        {pageState === "payment_failed_pix_expired" && (
          <Card accentColor="rose">
            <p className="font-cormorant italic text-lg text-bone mb-4">
              O código Pix expirou. Gere um novo.
            </p>
            <Button variant="primary" size="sm" onClick={handleRetry}>
              Gerar novo
            </Button>
          </Card>
        )}

        {pageState === "payment_failed_card_declined" && (
          <Card accentColor="rose">
            <p className="font-cormorant italic text-lg text-bone mb-4">
              O cartão não passou. Tente outro ou use Pix.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button variant="primary" size="sm" onClick={() => setPageState("card_selected")}>
                Outro cartão
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMethod("pix");
                  setTimer(15 * 60);
                  setPageState("pix_selected");
                }}
              >
                Usar Pix
              </Button>
            </div>
          </Card>
        )}

        {pageState === "payment_failed_generic" && (
          <Card accentColor="rose">
            <p className="font-cormorant italic text-lg text-bone mb-4">
              Algo deu errado no pagamento. Tente novamente.
            </p>
            <Button variant="primary" size="sm" onClick={handleRetry}>
              Tentar de novo
            </Button>
          </Card>
        )}

        {pageState === "requires_login" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            onClick={() => !loginLoading && setPageState("default")}
          >
            {/* Backdrop escuro com blur */}
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
              className="card-noise relative overflow-hidden w-full max-w-md"
              style={{
                background: "#0e0a18",
                border: "1px solid rgba(201,162,74,0.35)",
                padding: "40px 28px 32px",
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

              {/* Close X no topo-direita */}
              <button
                type="button"
                onClick={() => !loginLoading && setPageState("default")}
                aria-label="Fechar"
                disabled={loginLoading}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-bone-dim hover:text-gold transition-colors focus:outline-none disabled:opacity-30"
              >
                <span className="font-cinzel text-[22px] leading-none" aria-hidden>
                  ×
                </span>
              </button>

              <div className="relative flex flex-col items-center text-center">
                {/* Deco topo */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="h-px w-8 bg-gold-dim/50" />
                  <span
                    className="w-1.5 h-1.5 rotate-45 bg-gold"
                    style={{
                      boxShadow: "0 0 8px rgba(201,162,74,0.7)",
                    }}
                  />
                  <span className="h-px w-8 bg-gold-dim/50" />
                </div>

                {/* Eyebrow */}
                <span
                  className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold mb-3"
                  style={{ fontWeight: 500 }}
                >
                  Antes de guardar
                </span>

                {/* Título */}
                <h3
                  id="login-title"
                  className="font-cinzel text-[22px] sm:text-[26px] text-bone leading-[1.15] mb-3 max-w-[280px]"
                >
                  Eu preciso saber quem você é.
                </h3>

                {/* Cigana voice */}
                <p className="font-cormorant italic text-[17px] sm:text-[19px] text-bone-dim leading-[1.35] mb-8 max-w-[300px]">
                  Pra eu guardar seus créditos e te chamar pelo nome quando você voltar.
                </p>

                {/* Botão Google (componente unificado) */}
                <GoogleButton onClick={handleGoogleLogin} loading={loginLoading} />

                {/* Hint rodapé */}
                <p className="font-cormorant italic text-[13px] text-bone-dim mt-6 max-w-[280px]">
                  Um clique. Sem senha. Sem complicação.
                </p>

                {/* Divisor + "já tenho conta" */}
                <div className="flex items-center gap-3 mt-6 w-full">
                  <span
                    className="h-px flex-1"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.3))",
                    }}
                  />
                  <span className="font-cormorant italic text-[12px] text-bone-dim">ou</span>
                  <span
                    className="h-px flex-1"
                    style={{
                      background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.3))",
                    }}
                  />
                </div>

                <Link
                  href="/login?return=/creditos"
                  className="mt-4 font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold hover:text-gold-light transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Já tenho conta · Entrar
                </Link>

                {/* Deco rodapé */}
                <div className="flex items-center gap-2 mt-6">
                  <span className="h-px w-12 bg-gold-dim/30" />
                  <span className="w-1 h-1 rotate-45 bg-gold-dim" />
                  <span className="h-px w-12 bg-gold-dim/30" />
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </div>
    </main>
  );
}
