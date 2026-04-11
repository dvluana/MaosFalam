"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

import BlurredCard from "./BlurredCard";

interface DeckCard {
  label: string;
  teaser: string;
}

interface Props {
  cards: DeckCard[];
}

// Stack geometry: top card clean, rest fanned out beneath
const stackResting = [
  { y: 0, rotate: -1.2, scale: 1, xOffset: 0 },
  { y: 18, rotate: 0.8, scale: 0.97, xOffset: 6 },
  { y: 36, rotate: 2.2, scale: 0.94, xOffset: -4 },
];

const stackHover = [
  { y: 0, rotate: -2.5, scale: 1, xOffset: -8 },
  { y: 28, rotate: 1.4, scale: 0.97, xOffset: 10 },
  { y: 56, rotate: 3.6, scale: 0.94, xOffset: -6 },
];

export default function BlurredDeck({ cards }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Use at most 3 cards for the stack visual
  const stackCards = cards.slice(0, 3);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        {!expanded ? (
          <motion.div
            key="stack"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <button
              type="button"
              onClick={() => setExpanded(true)}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onFocus={() => setHovered(true)}
              onBlur={() => setHovered(false)}
              aria-label="Revelar as linhas seladas"
              className="relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:rounded-sm group"
              style={{ minHeight: 420 }}
            >
              {stackCards.map((card, i) => {
                const pose = hovered ? stackHover[i] : stackResting[i];
                return (
                  <motion.div
                    key={`${card.label}-${i}`}
                    className={i === 0 ? "relative" : "absolute inset-x-0 top-0"}
                    style={{
                      zIndex: stackCards.length - i,
                      transformOrigin: "50% 0%",
                      filter: i === 0 ? "none" : `brightness(${1 - i * 0.08})`,
                    }}
                    animate={{
                      y: pose?.y ?? 0,
                      x: pose?.xOffset ?? 0,
                      rotate: pose?.rotate ?? 0,
                      scale: pose?.scale ?? 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 180,
                      damping: 22,
                      mass: 0.8,
                    }}
                  >
                    <BlurredCard label={card.label} teaser={card.teaser} />
                  </motion.div>
                );
              })}

              {/* Hint */}
              <motion.div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex items-center gap-3"
                style={{ bottom: -28 }}
                animate={{ opacity: hovered ? 1 : 0.6 }}
                transition={{ duration: 0.3 }}
              >
                <span className="h-[1px] w-8 bg-gold-dim/40" />
                <span className="font-jetbrains text-[10px] tracking-[1.5px] uppercase text-gold-dim whitespace-nowrap">
                  {hovered ? "toque pra revelar" : `${cards.length} seladas`}
                </span>
                <span className="h-[1px] w-8 bg-gold-dim/40" />
              </motion.div>
            </button>

            {/* Spacer to reserve space for fanned bottom cards + hint */}
            <div style={{ height: 90 }} />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-[2px]"
          >
            {cards.map((card, i) => (
              <motion.div
                key={`${card.label}-${i}`}
                initial={{ opacity: 0, y: 24, rotate: i === 0 ? -1 : i === 1 ? 1 : 2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{
                  delay: i * 0.12,
                  type: "spring",
                  stiffness: 140,
                  damping: 20,
                }}
              >
                <BlurredCard label={card.label} teaser={card.teaser} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
