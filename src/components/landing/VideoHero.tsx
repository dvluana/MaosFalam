"use client";

import type { ReactNode } from "react";
import styles from "./VideoHero.module.css";

/**
 * VideoHero — container fullscreen do hero da landing MãosFalam.
 *
 * Porta fiel do markup legado em public/home.html (linhas ~1387-1438):
 *  - 5 particles decorativas (`.p1..p5`) com animação `float`
 *  - SVG da mandala com círculos concêntricos (anima `mandalaSpin` 180s)
 *  - Wrapper do diorama contendo o <video> loop + glows / stage lines
 *  - Slot `children` para compor o HeroTitle (ou qualquer conteúdo) dentro
 *    de `.hero-content`
 *
 * É Client Component porque o <video> depende de autoplay no browser.
 */

interface VideoHeroProps {
  /** Conteúdo renderizado dentro de `.hero-content` (ex: HeroTitle + CTA). */
  children?: ReactNode;
  /** Source do vídeo loop. Default: `/video-loop.mp4`. */
  videoSrc?: string;
  /** Poster opcional exibido antes do vídeo carregar. */
  posterSrc?: string;
}

export default function VideoHero({
  children,
  videoSrc = "/video-loop.mp4",
  posterSrc,
}: VideoHeroProps) {
  return (
    <div className={styles.hero} id="hero">
      <div className={`${styles.particle} ${styles.p1}`} aria-hidden="true" />
      <div className={`${styles.particle} ${styles.p2}`} aria-hidden="true" />
      <div className={`${styles.particle} ${styles.p3}`} aria-hidden="true" />
      <div className={`${styles.particle} ${styles.p4}`} aria-hidden="true" />
      <div className={`${styles.particle} ${styles.p5}`} aria-hidden="true" />

      <div className={styles.heroMandala} aria-hidden="true">
        <svg viewBox="-200 -200 400 400" xmlns="http://www.w3.org/2000/svg">
          <circle r="192" fill="none" stroke="rgba(201,162,74,0.04)" strokeWidth="0.4" />
          <circle r="168" fill="none" stroke="rgba(139,123,191,0.055)" strokeWidth="0.4" />
          <circle r="140" fill="none" stroke="rgba(201,162,74,0.04)" strokeWidth="0.4" />
          <circle r="108" fill="none" stroke="rgba(139,123,191,0.05)" strokeWidth="0.4" />
          <circle r="72" fill="none" stroke="rgba(201,162,74,0.045)" strokeWidth="0.4" />
          <circle r="38" fill="none" stroke="rgba(139,123,191,0.06)" strokeWidth="0.4" />
          <polygon
            points="0,-168 168,0 0,168 -168,0"
            fill="none"
            stroke="rgba(201,162,74,0.045)"
            strokeWidth="0.4"
          />
          <polygon
            points="0,-140 140,0 0,140 -140,0"
            fill="none"
            stroke="rgba(139,123,191,0.035)"
            strokeWidth="0.3"
            transform="rotate(45)"
          />
          <line x1="-192" y1="0" x2="192" y2="0" stroke="rgba(201,162,74,0.035)" strokeWidth="0.35" />
          <line x1="0" y1="-192" x2="0" y2="192" stroke="rgba(201,162,74,0.035)" strokeWidth="0.35" />
          <line x1="-136" y1="-136" x2="136" y2="136" stroke="rgba(201,162,74,0.025)" strokeWidth="0.3" />
          <line x1="136" y1="-136" x2="-136" y2="136" stroke="rgba(201,162,74,0.025)" strokeWidth="0.3" />
          <line x1="-96" y1="-166" x2="96" y2="166" stroke="rgba(139,123,191,0.025)" strokeWidth="0.25" />
          <line x1="96" y1="-166" x2="-96" y2="166" stroke="rgba(139,123,191,0.025)" strokeWidth="0.25" />
          <line x1="-166" y1="-96" x2="166" y2="96" stroke="rgba(139,123,191,0.025)" strokeWidth="0.25" />
          <line x1="166" y1="-96" x2="-166" y2="96" stroke="rgba(139,123,191,0.025)" strokeWidth="0.25" />
        </svg>
      </div>

      <div className={styles.dioramaWrap}>
        <div className={styles.dioramaGlow} aria-hidden="true" />
        <div className={styles.dioramaVoid} aria-hidden="true" />
        <video
          className={styles.dioramaImg}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
        />
        <div className={styles.dioramaStage} aria-hidden="true" />
      </div>

      <div className={styles.heroContent}>{children}</div>
    </div>
  );
}
