"use client";

import { useEffect, useRef } from "react";

import styles from "./CrystalCursor.module.css";

/**
 * CrystalCursor — cursor customizado dourado/cristal que segue o mouse com
 * suavização (lerp) e distorção via filtro SVG feTurbulence + feDisplacementMap.
 *
 * Porta fiel do Effect 6 do landing legado (public/home.html):
 *  - LERP = 0.12
 *  - baseFrequency=0.65, numOctaves=3, seed=2, displacement scale=4
 *  - Expande em elementos clicáveis
 *  - Some em touch devices (touchstart once)
 *  - Some ao sair da janela
 */

interface CrystalCursorProps {
  /** Fator de interpolação linear (0..1). Default = 0.12 (valor do original). */
  smoothing?: number;
  /** Se true, não renderiza nada. */
  disabled?: boolean;
}

const CLICKABLES = 'button, a, [role="button"], input, select, label';

export default function CrystalCursor({ smoothing = 0.12, disabled = false }: CrystalCursorProps) {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = -200;
    let mouseY = -200;
    let curX = -200;
    let curY = -200;
    let rafId = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function onMouseOver(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest(CLICKABLES)) {
        cursor?.classList.add(styles.expanded);
      }
    }

    function onMouseOut(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest(CLICKABLES)) {
        cursor?.classList.remove(styles.expanded);
      }
    }

    function onMouseLeave() {
      if (cursor) {
        cursor.style.transition = "opacity 0.2s ease";
        cursor.style.opacity = "0";
      }
    }

    function onMouseEnter() {
      if (cursor) {
        cursor.style.transition = "opacity 0.2s ease";
        cursor.style.opacity = "1";
      }
    }

    function onTouchStart() {
      if (cursor) cursor.style.display = "none";
    }

    function tick() {
      curX = lerp(curX, mouseX, smoothing);
      curY = lerp(curY, mouseY, smoothing);
      if (cursor) {
        cursor.style.left = `${curX.toFixed(2)}px`;
        cursor.style.top = `${curY.toFixed(2)}px`;
      }
      rafId = requestAnimationFrame(tick);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("touchstart", onTouchStart, { once: true });

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, [smoothing, disabled]);

  if (disabled) return null;

  return (
    <>
      <svg className={styles.svgDefs} aria-hidden="true">
        <defs>
          <filter id="crystalDistort" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div ref={cursorRef} className={styles.cursor} aria-hidden="true" />
    </>
  );
}
