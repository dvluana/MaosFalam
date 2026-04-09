"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
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
  "Tá pronto. Eu vou virar.",
];

const LOADING_PHRASES = [
  "Embaralhando o que ficou pra trás",
  "Olhando as três que você escolheu",
  "Lendo o que elas têm pra dizer",
  "Pronto. Olha.",
];

/** Símbolo MãosFalam (mão abstrata), usado no bloco de convite. */
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

/** Loading místico — hand symbol pulsante com anéis expandindo. */
function LoadingOverlay() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => Math.min(i + 1, LOADING_PHRASES.length - 1));
    }, 700);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className={styles.loadingOverlay} role="status" aria-live="polite">
      <div className={styles.loadingCenter}>
        <span className={styles.loadingRing} />
        <span className={styles.loadingRing} />
        <span className={styles.loadingRing} />
        <HandMark className={styles.loadingSymbol} />
      </div>
      <p key={idx} className={styles.loadingText}>
        {LOADING_PHRASES[idx]}
      </p>
    </div>
  );
}

export default function TarotPage() {
  const [stage, setStage] = useState<Stage>("picking");
  const [deck] = useState<TarotCardData[]>(() => shuffle(CARDS));
  const [picks, setPicks] = useState<DrawnCard[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const slotsRef = useRef<HTMLElement | null>(null);

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
      const nextPicks: DrawnCard[] = [...picks, { card, position }];
      setPicks(nextPicks);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }

      if (nextPicks.length === 3) {
        // 1. Scroll pros slots enquanto a carta termina de voar
        window.setTimeout(() => {
          slotsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 600);
        // 2. Loading místico 800ms depois do scroll começar
        window.setTimeout(() => {
          setStage("loading");
        }, 1400);
        // 3. Revela depois do loading (2.8s de fases)
        window.setTimeout(() => {
          setStage("revealing");
        }, 1400 + 2800);
      }
    },
    [picks],
  );

  const handleReset = useCallback(() => {
    setPicks([]);
    setStage("picking");
    setSessionKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const headerCopy =
    stage === "picking"
      ? {
          title: "Tarô Online",
          subtitle: "Escolhe três cartas. Eu leio pra você.",
        }
      : stage === "loading"
      ? {
          title: "Espera",
          subtitle: "Eu tô olhando.",
        }
      : {
          title: "O que eu vi",
          subtitle: "Olha com calma. Cada uma fala por si.",
        };

  const revealing = stage === "revealing";
  const picksStarted = picks.length > 0;

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        {/* ═══ HEADER ═══ */}
        <header className={styles.header}>
          {/* Ornamento: losango lilás flanqueado por linhas + dots laterais */}
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

          {stage === "picking" && (
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

        <LayoutGroup id={`tarot-${sessionKey}`}>
          {/* ═══ DECK (primeiro, é o foco do picking) ═══ */}
          {stage === "picking" && (
            <section className={styles.deckSection}>
              <div
                className={styles.guideDots}
                aria-label={`${picks.length} escolhidas`}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={
                      picks.length > i
                        ? styles.guideDotFilled
                        : styles.guideDot
                    }
                  />
                ))}
              </div>
              <div className={styles.deckWrap}>
                {/* Partículas místicas flutuando ao redor do deck */}
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
                    if (chosenIds.includes(card.id)) return null;
                    const { angle, z } = fanPositions[i];
                    return (
                      <motion.div
                        key={card.id}
                        layoutId={`card-${card.id}-${sessionKey}`}
                        className={styles.deckCard}
                        style={{
                          transform: `rotate(${angle}deg)`,
                          zIndex: z,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 220,
                          damping: 26,
                        }}
                        onClick={() => handlePick(card)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Escolher carta ${i + 1} de 22`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handlePick(card);
                          }
                        }}
                      >
                        <div className={styles.deckCardInner}>
                          <TarotCard card={card} hideFront />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {stage === "picking" && (
            <div className={styles.separator}>
              <span className={styles.separatorDot} />
            </div>
          )}

          {/* ═══ COLUMNS (slots + interpretações) ═══ */}
          <section
            ref={slotsRef}
            className={`${styles.columns} ${revealing ? styles.stacked : ""}`}
          >
            {POSITIONS.map((pos) => {
              const config = POSITION_CONFIG[pos];
              const picked = pickByPosition[pos];
              const colClass = styles[config.columnClass] ?? "";
              return (
                <div key={pos} className={`${styles.column} ${colClass}`}>
                  <div className={styles.colHeader}>
                    <div className={styles.colNumeral}>{config.numeral}</div>
                    <div className={styles.colLabel}>{config.label}</div>
                  </div>

                  {picked ? (
                    <motion.div
                      layoutId={`card-${picked.card.id}-${sessionKey}`}
                      className={`${styles.slotCard} ${revealing ? styles.revealingCard : ""}`}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 26,
                      }}
                    >
                      <TarotCard
                        card={picked.card}
                        faceUp={revealing}
                        highlighted={revealing}
                      />
                    </motion.div>
                  ) : (
                    <div className={styles.slotEmpty}>
                      <span className={styles.slotEmptyMark}>
                        {config.numeral}
                      </span>
                    </div>
                  )}

                  {revealing && picked && (
                    <div className={styles.interpretation}>
                      <div className={styles.cardTitle}>
                        <span className={styles.cardTitleNumeral}>
                          {picked.card.numeral}
                        </span>{" "}
                        · {picked.card.name}
                      </div>
                      <div className={styles.keywords}>
                        {picked.card.keywords.map((k) => (
                          <span key={k} className={styles.keyword}>
                            {k}
                          </span>
                        ))}
                      </div>
                      <p className={styles.interpretationBody}>
                        {picked.card.reading[pos]}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </LayoutGroup>

        {stage === "picking" && picksStarted && (
          <button
            type="button"
            onClick={handleReset}
            className={styles.resetLink}
          >
            Embaralhar de novo
          </button>
        )}

        {/* ═══ REVEALING: fechamento + convite ═══ */}
        {revealing && (
          <section className={styles.closing}>
            {/* Selo de fim da tiragem */}
            <div className={styles.closingSeal}>
              <span className={styles.closingSealLine} />
              <span className={styles.closingSealMark}>· fim da tiragem ·</span>
              <span className={styles.closingSealLine} />
            </div>

            {/* Frase de transição, curta e ritmada */}
            <div className={styles.closingLines}>
              <p>
                As cartas mostraram o que tá{" "}
                <em className={styles.emAccent}>em volta</em> de você.
              </p>
              <p>Nenhuma delas tocou a sua mão.</p>
              <p>
                E é ali dentro que mora{" "}
                <em className={styles.emBright}>quem você é</em>.
              </p>
            </div>

            {/* Card de convite pra leitura paga */}
            <article className={styles.invite}>
              <div className={styles.inviteCorner + " " + styles.inviteCornerTl} />
              <div className={styles.inviteCorner + " " + styles.inviteCornerTr} />
              <div className={styles.inviteCorner + " " + styles.inviteCornerBl} />
              <div className={styles.inviteCorner + " " + styles.inviteCornerBr} />

              <HandMark className={styles.inviteIcon} />

              <div className={styles.inviteEyebrow}>A outra leitura</div>
              <h2 className={styles.inviteTitle}>Me mostra sua mão</h2>
              <p className={styles.inviteBody}>
                Suas linhas guardam o que nenhum baralho alcança. Uma foto, um
                minuto, e eu te conto quem você é por dentro.
              </p>

              <Link href="/ler/nome" className={styles.inviteCta}>
                <span>Começar leitura da mão</span>
                <span aria-hidden className={styles.inviteArrow}>
                  →
                </span>
              </Link>

              <div className={styles.inviteMeta}>
                · leitura personalizada · cerca de 1 minuto ·
              </div>
            </article>

            {/* Ações secundárias */}
            <div className={styles.secondaryActions}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setShareOpen(true)}
              >
                Compartilhar tiragem
              </button>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={handleReset}
              >
                Tirar três cartas de novo
              </button>
            </div>
          </section>
        )}
      </div>

      {/* ═══ LOADING OVERLAY ═══ */}
      {stage === "loading" && <LoadingOverlay />}

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
          <div
            className={styles.shareInner}
            onClick={(e) => e.stopPropagation()}
          >
            <TarotShareCard spread={picks} />
            <p className={styles.sharePicked}>
              Captura de tela pra compartilhar
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
