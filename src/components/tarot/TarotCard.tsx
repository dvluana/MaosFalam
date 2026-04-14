"use client";

import Image from "next/image";

import BrandIcon from "@/components/ui/BrandIcon";
import type { TarotCardData } from "@/types/tarot";

import styles from "./TarotCard.module.css";

interface TarotCardProps {
  card: TarotCardData;
  faceUp?: boolean;
  dimmed?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  /** Mostra apenas as costas (pro deck face-down antes da escolha). */
  hideFront?: boolean;
}

export default function TarotCard({
  card,
  faceUp = false,
  dimmed = false,
  highlighted = false,
  onClick,
  hideFront = false,
}: TarotCardProps) {
  const clickable = Boolean(onClick) && !dimmed;
  const cls = [
    styles.card,
    faceUp ? styles.flipped : "",
    dimmed ? styles.dimmed : "",
    highlighted ? styles.highlighted : "",
    clickable ? styles.clickable : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={faceUp ? `${card.numeral} ${card.name}` : "Carta virada pra baixo"}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className={styles.inner}>
        {/* ═══ COSTAS ═══ */}
        <div className={`${styles.face} ${styles.back}`}>
          <div className={styles.content}>
            <span className={styles.contentCorner + " " + styles.contentCornerTl} />
            <span className={styles.contentCorner + " " + styles.contentCornerTr} />
            <span className={styles.contentCorner + " " + styles.contentCornerBl} />
            <span className={styles.contentCorner + " " + styles.contentCornerBr} />

            <BrandIcon className={styles.backSymbol} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vetor-logo.svg" alt="MãosFalam" className={styles.backWordmark} />
          </div>
        </div>

        {/* ═══ FRENTE ═══ */}
        {!hideFront && (
          <div className={`${styles.face} ${styles.front}`}>
            <div className={styles.content}>
              <span className={styles.contentCorner + " " + styles.contentCornerTl} />
              <span className={styles.contentCorner + " " + styles.contentCornerTr} />
              <span className={styles.contentCorner + " " + styles.contentCornerBl} />
              <span className={styles.contentCorner + " " + styles.contentCornerBr} />

              {/* Cartela do numeral */}
              <div className={styles.cartouche}>
                <div className={styles.line} />
                <div className={styles.cartoucheBox}>{card.numeral}</div>
                <div className={styles.line} />
              </div>

              {/* Moldura da imagem — com partículas místicas */}
              <div className={styles.imageFrame}>
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  sizes="(max-width: 480px) 42vw, 240px"
                />
                {/* Pontinhos lilás que sobem da imagem, mostrando que ela tá viva */}
                <span className={styles.particle} />
                <span className={styles.particle} />
                <span className={styles.particle} />
                <span className={styles.particle} />
                <span className={styles.particle} />
                <span className={styles.particle} />
                <span className={styles.particle} />
              </div>

              {/* Banner do nome */}
              <div className={styles.banner}>
                <div className={styles.bannerName}>{card.name}</div>
                <div className={styles.bannerDecor}>
                  <span className={styles.bannerDot} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
