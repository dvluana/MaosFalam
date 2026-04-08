"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HeroTitle.module.css";

/**
 * HeroTitle — título do hero com efeito typewriter + subtítulo em fade.
 *
 * A cigana não grita. Ela datilografa cada letra como quem escreve à mão,
 * e só depois, num suspiro, solta a provocação embaixo.
 *
 * Porta fiel do IIFE original em public/home.html (linhas ~1660-1706):
 *  - Digita TITLE_1, quebra de linha, TITLE_2
 *  - Cursor pisca enquanto digita, vira `done` (fade out) ao terminar
 *  - Subtítulo aparece com fade 80ms depois do cursor terminar
 *  - Cada char tem delay base + variance aleatória, com pausas extras em
 *    `.` (+460ms), `,` (+180ms), espaço (-10ms)
 */

interface HeroTitleProps {
  /** Primeira linha do título. */
  title?: string;
  /** Segunda linha do título (renderizada após <br>). */
  titleLine2?: string;
  /** Subtítulo que aparece em fade depois do typewriter. */
  subtitle?: string;
  /** Delay base por caractere em ms. */
  typeSpeed?: number;
  /** Variação aleatória somada ao typeSpeed (0..variance ms). */
  typeVariance?: number;
  /** Delay antes de começar a digitar (em ms). */
  startDelay?: number;
  /** Pausa entre as duas linhas do título (em ms). */
  lineBreakDelay?: number;
  /** Pausa depois do título antes de marcar o cursor como done (em ms). */
  cursorDoneDelay?: number;
  /** Pausa depois do cursor done antes de revelar o subtítulo (em ms). */
  subtitleDelay?: number;
}

type VisibleChar = { ch: string; visible: boolean };

interface LineState {
  chars: VisibleChar[];
  done: boolean;
}

export default function HeroTitle({
  title = "Suas mãos já sabem.",
  titleLine2 = "Você ainda não.",
  subtitle = "Uma foto. 30 segundos. E eu te conto o que você esconde de todo mundo.",
  typeSpeed = 52,
  typeVariance = 48,
  startDelay = 8300,
  lineBreakDelay = 480,
  cursorDoneDelay = 1100,
  subtitleDelay = 80,
}: HeroTitleProps) {
  const [line1, setLine1] = useState<LineState>({ chars: [], done: false });
  const [line2, setLine2] = useState<LineState>({ chars: [], done: false });
  const [showBreak, setShowBreak] = useState(false);
  const [cursorDone, setCursorDone] = useState(false);
  const [subtitleShown, setSubtitleShown] = useState(false);

  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;

    function schedule(fn: () => void, ms: number) {
      const id = window.setTimeout(fn, ms);
      timeouts.push(id);
    }

    function charDelay(ch: string): number {
      let wait = typeSpeed + Math.random() * typeVariance;
      if (ch === ".") wait += 460;
      else if (ch === ",") wait += 180;
      else if (ch === " ") wait -= 10;
      return wait;
    }

    function typeLine(
      text: string,
      setLine: React.Dispatch<React.SetStateAction<LineState>>,
      onDone: () => void,
    ) {
      let i = 0;
      function next() {
        if (i >= text.length) {
          setLine((prev) => ({ ...prev, done: true }));
          onDone();
          return;
        }
        const ch = text[i];
        i += 1;
        setLine((prev) => ({
          ...prev,
          chars: [...prev.chars, { ch, visible: false }],
        }));
        // two RAFs to let CSS transition trigger (mirrors original)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setLine((prev) => {
              const chars = prev.chars.slice();
              const idx = chars.length - 1;
              if (idx >= 0) chars[idx] = { ...chars[idx], visible: true };
              return { ...prev, chars };
            });
          });
        });
        schedule(next, charDelay(ch));
      }
      next();
    }

    function run() {
      typeLine(title, setLine1, () => {
        setShowBreak(true);
        schedule(() => {
          typeLine(titleLine2, setLine2, () => {
            schedule(() => {
              setCursorDone(true);
              schedule(() => setSubtitleShown(true), subtitleDelay);
            }, cursorDoneDelay);
          });
        }, lineBreakDelay);
      });
    }

    schedule(run, startDelay);

    return () => {
      for (const id of timeouts) window.clearTimeout(id);
      timeouts.length = 0;
    };
  }, [
    title,
    titleLine2,
    typeSpeed,
    typeVariance,
    startDelay,
    lineBreakDelay,
    cursorDoneDelay,
    subtitleDelay,
  ]);

  const fullTitle = `${title} ${titleLine2}`;

  return (
    <>
      <p
        className={styles.heroTitle}
        aria-label={fullTitle}
      >
        <span aria-hidden="true">
          {line1.chars.map((c, i) => (
            <span
              key={`l1-${i}`}
              className={`${styles.typeChar} ${c.visible ? styles.visible : ""}`}
            >
              {c.ch}
            </span>
          ))}
          {showBreak && <br />}
          {line2.chars.map((c, i) => (
            <span
              key={`l2-${i}`}
              className={`${styles.typeChar} ${c.visible ? styles.visible : ""}`}
            >
              {c.ch}
            </span>
          ))}
          <span
            className={`${styles.typeCursor} ${cursorDone ? styles.done : ""}`}
          />
        </span>
      </p>
      <p
        className={`${styles.heroSubtitle} ${subtitleShown ? styles.show : ""}`}
        aria-label={subtitle}
      >
        <span aria-hidden={!subtitleShown}>{subtitleShown ? subtitle : ""}</span>
      </p>
    </>
  );
}
