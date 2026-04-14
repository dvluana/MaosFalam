"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { Button, Card, Eyebrow, GoogleButton, PageLoading } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { saveCheckoutIntent } from "@/lib/checkout-intent";
import { formatCPF, isValidCPF } from "@/lib/cpf";
import { initiatePurchase } from "@/lib/payment-client";
import { getUserProfile } from "@/lib/user-client";

type PageState = "default" | "processing_payment" | "payment_failed_generic" | "requires_login";

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

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatPorLeitura(v: number, c: number): string {
  return formatBRL(v / c);
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

  // Deck state
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

  const goTo = (idx: number) => {
    const total = PACOTES.length;
    const next = ((idx % total) + total) % total;
    setDirection(next > deckIdx ? 1 : -1);
    setDeckIdx(next);
  };

  const goPrev = () => goTo(deckIdx - 1);
  const goNext = () => goTo(deckIdx + 1);

  // CPF state
  const [cpf, setCpf] = useState<string>("");
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [hasCpf, setHasCpf] = useState<boolean | null>(null);

  // Purchase state
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const [loginLoading] = useState<boolean>(false);

  // Reading ID from upsell flow
  const readingId = params?.get("reading") ?? undefined;

  const pacote = useMemo(() => PACOTES[deckIdx] ?? null, [deckIdx]);

  // On mount with logged-in user: check if CPF exists on profile
  useEffect(() => {
    if (!user) {
      setHasCpf(null);
      return;
    }
    void getUserProfile()
      .then((profile) => {
        setHasCpf(profile.cpf !== null);
      })
      .catch(() => {
        setHasCpf(false);
      });
  }, [user]);

  const handleEscolher = useCallback(async () => {
    if (!pacote) return;

    // Not logged in: save intent and show login modal
    if (!user) {
      saveCheckoutIntent(pacote.id, "pix");
      setPageState("requires_login");
      return;
    }

    // CPF validation for first-time buyers
    if (hasCpf === false) {
      const rawCpf = cpf.replace(/\D/g, "");
      if (!isValidCPF(rawCpf)) {
        setCpfError("CPF inválido.");
        return;
      }
    }

    // Initiate purchase
    setPageState("processing_payment");
    setPurchasing(true);
    setPurchaseError(null);

    try {
      const cpfToSend = hasCpf === false ? cpf.replace(/\D/g, "") : undefined;
      const result = await initiatePurchase(pacote.id, cpfToSend, readingId);
      window.location.href = result.checkout_url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      const is429 = message.startsWith("429");
      setPurchaseError(
        is429 ? "Devagar. Tenta de novo daqui a pouco." : "Algo saiu do caminho. Tente de novo.",
      );
      setPageState("payment_failed_generic");
    } finally {
      setPurchasing(false);
    }
  }, [pacote, user, hasCpf, cpf, readingId]);

  function handleGoogleLogin(): void {
    router.push("/login?return=/creditos");
  }

  function handleRetry(): void {
    setPageState("default");
    setPurchaseError(null);
  }

  return (
    <main className="min-h-screen velvet-bg text-bone font-raleway">
      <div className="mx-auto max-w-2xl px-5 pt-28 pb-16">
        {/* Eyebrow */}
        <Eyebrow label="A minha tabela" className="justify-center mb-6" />

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
                &#8249;
              </span>
            </button>

            {/* Carta central + peeks laterais */}
            <div className="relative mx-auto" style={{ width: "min(100%, 440px)" }}>
              {/* Peek da carta anterior */}
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
              {/* Peek da carta seguinte */}
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
                      <motion.div
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
                        className="block w-full text-left"
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
                          {/* Radial glow gold */}
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0"
                            style={{
                              background:
                                "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(201,162,74,0.12), transparent 70%)",
                            }}
                          />

                          {/* Corner accents */}
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
                            {/* Header: numero + nome */}
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

                            {/* Footer: creditos + preco */}
                            <div className="flex items-end justify-between gap-4 mb-6">
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

                            {/* CPF field — only for logged-in first-time buyers */}
                            {user && hasCpf === false && (
                              <div className="flex flex-col gap-2 mb-5">
                                <label className="font-cormorant italic text-[14px] text-bone-dim tracking-[0.02em]">
                                  Seu CPF
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={cpf}
                                    onChange={(e) => {
                                      setCpf(formatCPF(e.target.value));
                                      if (cpfError) setCpfError(null);
                                    }}
                                    onBlur={() => {
                                      const raw = cpf.replace(/\D/g, "");
                                      if (raw.length > 0 && !isValidCPF(raw)) {
                                        setCpfError("CPF inválido.");
                                      }
                                    }}
                                    placeholder="000.000.000-00"
                                    className="w-full bg-transparent border-b text-bone font-raleway text-[15px] py-3 outline-none placeholder:font-cormorant placeholder:italic placeholder:text-violet-dim transition-colors"
                                    style={{
                                      borderBottomColor: cpfError
                                        ? "rgba(196,100,122,0.6)"
                                        : "rgba(123,107,165,0.1)",
                                    }}
                                  />
                                  <span
                                    className="absolute bottom-0 left-0 h-px transition-all duration-400"
                                    style={{
                                      background: "linear-gradient(90deg, #C4647A, #7B6BA5)",
                                      width: "0%",
                                    }}
                                  />
                                </div>
                                {cpfError && (
                                  <span className="font-jetbrains text-[11px] text-rose mt-1">
                                    {cpfError}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* CTA: Escolher */}
                            <Button
                              variant="primary"
                              size="lg"
                              disabled={purchasing}
                              onClick={() => void handleEscolher()}
                              className="w-full"
                            >
                              {purchasing
                                ? "Redirecionando..."
                                : `Escolher · ${formatBRL(p.preco)}`}
                            </Button>

                            <p className="font-cormorant italic text-[12px] text-bone-dim text-center mt-3">
                              O preço do que você vai descobrir é barato pelo que vale.
                            </p>
                          </div>
                        </article>
                      </motion.div>
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
                &#8250;
              </span>
            </button>
          </div>

          {/* Indicador de posicao (dots tarot) */}
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

        {/* Dynamic states */}
        {pageState === "processing_payment" && (
          <Card accentColor="violet">
            <div className="py-6 text-center">
              <p className="font-cormorant italic text-xl text-bone leading-relaxed mb-4">
                O preço do que você vai descobrir é barato pelo que vale.
              </p>
              <p className="font-jetbrains text-[10px] text-violet uppercase tracking-[1.5px]">
                Redirecionando...
              </p>
            </div>
          </Card>
        )}

        {pageState === "payment_failed_generic" && (
          <Card accentColor="rose">
            <p className="font-cormorant italic text-lg text-bone mb-4">
              {purchaseError ?? "Algo saiu do caminho. Tente de novo."}
            </p>
            <Button variant="primary" size="sm" onClick={handleRetry}>
              Tentar de novo
            </Button>
          </Card>
        )}

        {/* Login modal */}
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
            {/* Backdrop */}
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
              {/* Radial glow */}
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
                onClick={() => !loginLoading && setPageState("default")}
                aria-label="Fechar"
                disabled={loginLoading}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-bone-dim hover:text-gold transition-colors focus:outline-none disabled:opacity-30"
              >
                <span className="font-cinzel text-[22px] leading-none" aria-hidden>
                  &#215;
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

                {/* Titulo */}
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

                {/* Botao Google */}
                <GoogleButton onClick={handleGoogleLogin} loading={loginLoading} />

                {/* Hint rodape */}
                <p className="font-cormorant italic text-[13px] text-bone-dim mt-6 max-w-[280px]">
                  Um clique. Sem senha. Sem complicação.
                </p>

                {/* Divisor + "ja tenho conta" */}
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

                {/* Deco rodape */}
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
