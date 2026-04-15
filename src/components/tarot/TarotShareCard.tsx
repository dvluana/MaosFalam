"use client";

import BrandIcon from "@/components/ui/BrandIcon";
import type { DrawnCard, SpreadPosition } from "@/types/tarot";

import TarotCard from "./TarotCard";
import styles from "./TarotShareCard.module.css";

const POSITION_LABEL: Record<SpreadPosition, string> = {
  past: "Passado",
  present: "Presente",
  future: "Futuro",
};

interface TarotShareCardProps {
  spread: DrawnCard[];
  /** Frase opcional no meio. Se omitida, usa default viral. */
  phrase?: string;
}

const DEFAULT_PHRASE = "Três cartas. Uma leitura. E eu ainda pensando.";

export default function TarotShareCard({ spread, phrase = DEFAULT_PHRASE }: TarotShareCardProps) {
  return (
    <div className={styles.shareCard}>
      {/* Cantos dourados */}
      <div className={`${styles.corner} ${styles.cornerTl}`} />
      <div className={`${styles.corner} ${styles.cornerTr}`} />
      <div className={`${styles.corner} ${styles.cornerBl}`} />
      <div className={`${styles.corner} ${styles.cornerBr}`} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>Tarot Online</div>
        <h3 className={styles.headline}>Tirei Meu Tarô</h3>
        <div className={styles.ornament}>
          <span className={styles.ornamentDot} />
        </div>
      </div>

      {/* Três cartas */}
      <div className={styles.cardsRow}>
        {spread.map((draw) => (
          <div key={draw.card.id + "-" + draw.position} className={styles.mini}>
            <div className={styles.miniCard}>
              <TarotCard card={draw.card} faceUp />
            </div>
            <div className={styles.miniLabel}>{POSITION_LABEL[draw.position]}</div>
            <div className={styles.miniName}>
              <span className={styles.miniNumeral}>{draw.card.numeral}</span>
              {draw.card.name}
            </div>
          </div>
        ))}
      </div>

      {/* Frase */}
      <div className={styles.phraseBox}>
        <p className={styles.phrase}>{phrase}</p>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <BrandIcon className={styles.footerSymbol} />
        <div className={styles.footerBrand}>MãosFalam</div>
        <div className={styles.footerCta}>Tira o seu · maosfalam.app</div>
      </div>
    </div>
  );
}
