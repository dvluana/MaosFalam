"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import TarotCard from "@/components/tarot/TarotCard";
import TarotShareCard from "@/components/tarot/TarotShareCard";
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
  return (
    <svg
      viewBox="0 0 613 366"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M288.841 46.146C293.104 63.164 294.411 81.573 303.299 97.107C325.889 136.609 370.568 149.719 409.266 166.602C448.926 183.898 485.101 198.622 526.441 211.064C554.06 219.031 584.428 226.543 613 229.958C589.772 232.047 567.585 233.251 545.348 241.341C490.896 261.154 455.302 309.301 405.034 336.378C376.118 352.549 342.428 363.614 309.407 365.631C228.034 370.594 156.821 324.788 100.808 270.409C69.826 240.329 46.14 231.59 3.873 233.998C39.206 222.563 76.544 210.374 110.893 196.244C131.719 187.677 153.615 176.583 174.614 167.361C201.576 155.521 232.546 143.208 255.681 125.206C282.259 104.522 285.384 77.21 288.841 46.146ZM186.868 189.901C162.296 196.041 135.412 203.801 112.617 215.05C140.258 268.656 185.396 302.01 242.39 320.92C289.186 336.445 335.486 330.379 379.135 307.728C408.246 292.444 433.675 271.037 453.652 244.989C462.06 233.667 468.287 224.416 475.31 211.92C446.699 201.199 427.791 195.122 397.098 190.419C385.734 217.643 373.703 233.21 347.931 248.771C328.926 260.244 307.287 266.407 298.388 288.461C292.152 302.791 292.83 314.962 290.316 329.469C283.284 284.931 282.968 270.655 241.441 252.165C219 242.174 195.323 215.339 188.641 192.39C188.055 190.675 188.244 191.161 186.868 189.901ZM291.189 119.862C285.757 140.802 285.287 167.666 264.068 179.993C250.004 188.164 231.156 191.659 215.317 194.703C237.911 198.153 260.984 201.515 276.27 220.408C286.936 233.594 287.25 259.37 292.278 265.801C295.962 244.728 297.927 223.026 317.462 210.068C331.665 200.65 351.476 197.325 368.006 194.537C345.642 190.728 320.292 187.484 306.06 167.68C295.167 152.512 296.944 134.946 291.189 119.862Z"
        fill="currentColor"
      />
      <path
        d="M174.092 27.061C216.082 5.198 264.16-3.393 311.107 1.2C385.635 7.242 445.195 45.298 492.124 101.452C517.484 131.787 543.237 164.456 573.822 189.931C585.854 199.957 597.257 203.796 612.029 208.232C589.528 208.793 569.548 204.094 548.51 196.162C525.939 187.769 504.902 175.732 486.241 160.537C441.876 124.183 412.773 75.612 354.471 53.625C284.215 27.133 207.402 44.015 154.972 97.537C131.109 121.896 112.03 148.118 86.776 170.051C60.877 192.542 30.905 204.67 0 218.127C13.719 208.345 26.438 181.177 37.791 169.08C82.573 121.359 113.787 58.461 174.092 27.061Z"
        fill="currentColor"
      />
    </svg>
  );
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
