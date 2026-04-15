"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import TarotCard from "@/components/tarot/TarotCard";
import TarotShareCard from "@/components/tarot/TarotShareCard";
import BrandIcon from "@/components/ui/BrandIcon";
import cardsData from "@/mocks/tarot-cards.json";
import type { DrawnCard, SpreadPosition, TarotCardData } from "@/types/tarot";

import styles from "./page.module.css";

type Stage = "picking" | "loading" | "revealing";

const CARDS: TarotCardData[] = cardsData as TarotCardData[];
const POSITIONS: SpreadPosition[] = ["past", "present", "future"];

const POSITION_CONFIG: Record<
  SpreadPosition,
  { label: string; numeral: string; columnClass: string }
> = {
  past: { label: "Passado", numeral: "I", columnClass: "columnPast" },
  present: { label: "Presente", numeral: "II", columnClass: "columnPresent" },
  future: { label: "Futuro", numeral: "III", columnClass: "columnFuture" },
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const PICK_GUIDES = [
  "Puxa a primeira. A que o teu olho parou.",
  "Agora a segunda. Deixa o dedo ir sozinho.",
  "A última. A que sobrou não sobrou, te esperou.",
  "Pronto. Eu vou revelar.",
];

const LOADING_PHRASES = [
  "Embaralhando o que ficou pra trás",
  "Olhando as três que você escolheu",
  "Lendo o que elas têm pra dizer",
  "Pronto. Olha.",
];

function HandMark({ className }: { className?: string }) {
  return <BrandIcon className={className} />;
}

function LoadingOverlay() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => Math.min(i + 1, LOADING_PHRASES.length - 1));
    }, 700);
    return () => window.clearInterval(id);
  }, []);
  return (
    <motion.div
      className={styles.loadingOverlay}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.loadingCenter}>
        <span className={styles.loadingRing} />
        <span className={styles.loadingRing} />
        <span className={styles.loadingRing} />
        <HandMark className={styles.loadingSymbol} />
      </div>
      <p key={idx} className={styles.loadingText}>
        {LOADING_PHRASES[idx]}
      </p>
    </motion.div>
  );
}

export default function TarotPage() {
  const [stage, setStage] = useState<Stage>("picking");
  const [deck] = useState<TarotCardData[]>(() => shuffle(CARDS));
  const [picks, setPicks] = useState<DrawnCard[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const columnsRef = useRef<HTMLElement | null>(null);

  const chosenIds = useMemo(() => picks.map((p) => p.card.id), [picks]);
  const pickByPosition = useMemo(() => {
    const map: Partial<Record<SpreadPosition, DrawnCard>> = {};
    picks.forEach((p) => {
      map[p.position] = p;
    });
    return map;
  }, [picks]);

  const fanPositions = useMemo(() => {
    const total = deck.length;
    const spread = 80;
    const step = spread / Math.max(total - 1, 1);
    return deck.map((_, i) => ({
      angle: -spread / 2 + i * step,
      z: i,
    }));
  }, [deck]);

  const handlePick = useCallback(
    (card: TarotCardData) => {
      if (picks.length >= 3) return;
      if (picks.some((p) => p.card.id === card.id)) return;

      const position = POSITIONS[picks.length];
      setPicks((prev) => [...prev, { card, position }]);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }
      // No auto-trigger — user controls reveal via button
    },
    [picks],
  );

  const handleReveal = useCallback(() => {
    if (picks.length < 3) return;
    setStage("loading");
    window.setTimeout(() => {
      setStage("revealing");
      // Scroll to result after cards animate in
      window.setTimeout(() => {
        columnsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 600);
    }, 2800);
  }, [picks.length]);

  const handleReset = useCallback(() => {
    setPicks([]);
    setStage("picking");
    setSessionKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const revealing = stage === "revealing";
  const ready = picks.length === 3;

  const headerCopy =
    stage === "picking"
      ? { title: "Tarô Online", subtitle: "Escolhe três cartas. Eu leio pra você." }
      : stage === "loading"
        ? { title: "Espera", subtitle: "Eu tô olhando." }
        : { title: "O que eu vi", subtitle: "Olha com calma. Cada uma fala por si." };

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        {/* ═══ HEADER ═══ */}
        <header className={styles.header}>
          <div className={styles.headerOrnament} aria-hidden="true">
            <span className={styles.ornLineLong} />
            <span className={styles.ornSideDot} />
            <span className={styles.ornLineShort} />
            <div className={styles.ornCenter}>
              <span className={styles.ornAuraOuter} />
              <span className={styles.ornAuraInner} />
              <span className={styles.ornDiamond} />
              <span className={styles.mysticParticle} />
              <span className={styles.mysticParticle} />
              <span className={styles.mysticParticle} />
              <span className={styles.mysticParticle} />
              <span className={styles.mysticParticle} />
              <span className={styles.mysticParticle} />
              <span className={styles.mysticParticle} />
              <span className={styles.mysticParticle} />
            </div>
            <span className={styles.ornLineShort} />
            <span className={styles.ornSideDot} />
            <span className={styles.ornLineLong} />
          </div>
          <h1 className={styles.title}>{headerCopy.title}</h1>
          <p className={styles.subtitle}>{headerCopy.subtitle}</p>

          {stage === "picking" && picks.length === 0 && (
            <div className={styles.steps} aria-label="Como funciona">
              <div className={styles.step}>
                <div className={styles.stepNum}>01</div>
                <div className={styles.stepLabel}>Você escolhe</div>
              </div>
              <div className={styles.stepArrow} aria-hidden="true">
                →
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>02</div>
                <div className={styles.stepLabel}>Eu viro</div>
              </div>
              <div className={styles.stepArrow} aria-hidden="true">
                →
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>03</div>
                <div className={styles.stepLabel}>Você lê</div>
              </div>
            </div>
          )}
        </header>

        {/* ═══ DECK — only during picking ═══ */}
        {stage === "picking" && (
          <section className={styles.deckSection} key={`deck-${sessionKey}`}>
            {/* Guide text */}
            <AnimatePresence mode="wait">
              <motion.p
                key={picks.length}
                className={styles.pickGuide}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35 }}
              >
                {PICK_GUIDES[picks.length]}
              </motion.p>
            </AnimatePresence>

            {/* Progress dots */}
            <div className={styles.guideDots} aria-label={`${picks.length} escolhidas`}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={picks.length > i ? styles.guideDotFilled : styles.guideDot}
                />
              ))}
            </div>

            {/* Deck fan */}
            <div className={styles.deckWrap}>
              <span className={styles.deckParticle} />
              <span className={styles.deckParticle} />
              <span className={styles.deckParticle} />
              <span className={styles.deckParticle} />
              <span className={styles.deckParticle} />
              <span className={styles.deckParticle} />
              <span className={styles.deckParticle} />
              <span className={styles.deckParticle} />
              <span className={styles.deckParticle} />
              <span className={styles.deckParticle} />
              <div className={styles.deck}>
                {deck.map((card, i) => {
                  const isSelected = chosenIds.includes(card.id);
                  const { angle, z } = fanPositions[i];
                  return (
                    <div
                      key={card.id}
                      className={`${styles.deckCard} ${isSelected ? styles.deckCardSelected : ""}`}
                      style={{
                        transform: `rotate(${angle}deg)`,
                        zIndex: isSelected ? 200 : z,
                      }}
                      onClick={() => {
                        if (!isSelected && picks.length < 3) handlePick(card);
                      }}
                      role="button"
                      tabIndex={isSelected || picks.length >= 3 ? -1 : 0}
                      aria-label={
                        isSelected ? "Carta selecionada" : `Escolher carta ${i + 1} de 22`
                      }
                      aria-disabled={isSelected}
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === " ") &&
                          !isSelected &&
                          picks.length < 3
                        ) {
                          e.preventDefault();
                          handlePick(card);
                        }
                      }}
                    >
                      <div
                        className={`${styles.deckCardInner} ${isSelected ? styles.deckCardInnerSelected : ""}`}
                      >
                        <TarotCard card={card} hideFront highlighted={isSelected} />
                        {isSelected && (
                          <span className={styles.pickBadge} aria-hidden>
                            {picks.findIndex((p) => p.card.id === card.id) + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reveal button area */}
            <AnimatePresence>
              {picks.length > 0 && (
                <motion.div
                  className={styles.revealArea}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <button
                    type="button"
                    onClick={handleReveal}
                    disabled={!ready}
                    className={`${styles.revealBtn} ${ready ? styles.revealBtnReady : styles.revealBtnWaiting}`}
                    aria-label={
                      ready
                        ? "Revelar as cartas"
                        : `Selecione mais ${3 - picks.length} carta${3 - picks.length !== 1 ? "s" : ""}`
                    }
                  >
                    <span className={styles.revealBtnText}>Revelar</span>
                    {ready && (
                      <motion.span
                        className={styles.revealBtnArrow}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        aria-hidden
                      >
                        →
                      </motion.span>
                    )}
                  </button>
                  {!ready && (
                    <p className={styles.revealHint}>
                      {3 - picks.length === 1
                        ? "falta 1 carta"
                        : `faltam ${3 - picks.length} cartas`}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {picks.length > 0 && (
              <button type="button" onClick={handleReset} className={styles.resetLink}>
                Embaralhar de novo
              </button>
            )}
          </section>
        )}

        {/* ═══ COLUMNS — only during revealing ═══ */}
        {revealing && (
          <section ref={columnsRef} className={`${styles.columns} ${styles.stacked}`}>
            {POSITIONS.map((pos, posIdx) => {
              const config = POSITION_CONFIG[pos];
              const picked = pickByPosition[pos];
              const colClass = styles[config.columnClass] ?? "";
              const flipDelay = posIdx * 0.42 + 0.7;
              return (
                <div key={pos} className={`${styles.column} ${colClass}`}>
                  <motion.div
                    className={styles.colHeader}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: posIdx * 0.42 + 0.15, duration: 0.5 }}
                  >
                    <div className={styles.colNumeral}>{config.numeral}</div>
                    <div className={styles.colLabel}>{config.label}</div>
                  </motion.div>

                  {picked && (
                    <motion.div
                      className={`${styles.slotCard} ${styles.revealingCard}`}
                      initial={{ y: -60, opacity: 0, scale: 0.82, rotateZ: -4 }}
                      animate={{ y: 0, opacity: 1, scale: 1, rotateZ: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 160,
                        damping: 20,
                        delay: posIdx * 0.42,
                      }}
                      style={{ "--flip-delay": `${flipDelay}s` } as React.CSSProperties}
                    >
                      <TarotCard card={picked.card} faceUp={true} highlighted={true} />
                    </motion.div>
                  )}

                  {picked && (
                    <motion.div
                      className={styles.interpretation}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: flipDelay + 1.1,
                        duration: 0.7,
                        ease: "easeOut",
                      }}
                    >
                      <div className={styles.cardTitle}>
                        <span className={styles.cardTitleNumeral}>{picked.card.numeral}</span> ·{" "}
                        {picked.card.name}
                      </div>
                      <div className={styles.keywords}>
                        {picked.card.keywords.map((k) => (
                          <span key={k} className={styles.keyword}>
                            {k}
                          </span>
                        ))}
                      </div>
                      <p className={styles.interpretationBody}>{picked.card.reading[pos]}</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* ═══ REVEALING: fechamento + convite ═══ */}
        {revealing && (
          <motion.section
            className={styles.closing}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5.2, duration: 0.9 }}
          >
            <div className={styles.closingSeal}>
              <span className={styles.closingSealLine} />
              <span className={styles.closingSealMark}>· fim da tiragem ·</span>
              <span className={styles.closingSealLine} />
            </div>

            <div className={styles.closingLines}>
              <p>
                As cartas mostraram o que tá <em className={styles.emAccent}>em volta</em> de você.
              </p>
              <p>Nenhuma delas tocou a sua mão.</p>
              <p>
                E é ali dentro que mora <em className={styles.emBright}>quem você é</em>.
              </p>
            </div>

            <article className={styles.invite}>
              <div className={styles.inviteCorner + " " + styles.inviteCornerTl} />
              <div className={styles.inviteCorner + " " + styles.inviteCornerTr} />
              <div className={styles.inviteCorner + " " + styles.inviteCornerBl} />
              <div className={styles.inviteCorner + " " + styles.inviteCornerBr} />

              <HandMark className={styles.inviteIcon} />
              <div className={styles.inviteEyebrow}>A outra leitura</div>
              <h2 className={styles.inviteTitle}>Me mostra sua mão</h2>
              <p className={styles.inviteBody}>
                Suas linhas guardam o que nenhum baralho alcança. Uma foto, um minuto, e eu te conto
                quem você é por dentro.
              </p>
              <Link href="/ler/nome" className={styles.inviteCta}>
                <span>Começar leitura da mão</span>
                <span aria-hidden className={styles.inviteArrow}>
                  →
                </span>
              </Link>
              <div className={styles.inviteMeta}>· leitura personalizada · cerca de 1 minuto ·</div>
            </article>

            <div className={styles.secondaryActions}>
              <button type="button" className={styles.btnGhost} onClick={() => setShareOpen(true)}>
                Compartilhar tiragem
              </button>
              <button type="button" className={styles.btnGhost} onClick={handleReset}>
                Tirar três cartas de novo
              </button>
            </div>
          </motion.section>
        )}
      </div>

      {/* ═══ LOADING OVERLAY ═══ */}
      <AnimatePresence>{stage === "loading" && <LoadingOverlay />}</AnimatePresence>

      {/* Share modal */}
      {shareOpen && (
        <div
          className={styles.shareBackdrop}
          onClick={() => setShareOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={styles.shareClose}
            onClick={() => setShareOpen(false)}
            aria-label="Fechar"
          >
            ✕
          </button>
          <div className={styles.shareInner} onClick={(e) => e.stopPropagation()}>
            <TarotShareCard spread={picks} />
            <p className={styles.sharePicked}>Captura de tela pra compartilhar</p>
          </div>
        </div>
      )}
    </main>
  );
}
