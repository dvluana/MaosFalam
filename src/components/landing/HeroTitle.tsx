"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./HeroTitle.module.css";

/**
 * HeroTitle — título do hero com efeito typewriter + subtítulo em fade.
 *
 * Chars are pre-populated as invisible. The effect reveals them one by one
 * via index tracking — no append, so re-mount with stale state is impossible.
 */

interface HeroTitleProps {
  title?: string;
  titleLine2?: string;
  subtitle?: string;
  typeSpeed?: number;
  typeVariance?: number;
  startDelay?: number;
  lineBreakDelay?: number;
  cursorDoneDelay?: number;
  subtitleDelay?: number;
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
  // Index of next char to reveal (-1 = not started)
  const [revealIdx, setRevealIdx] = useState(-1);
  const [cursorDone, setCursorDone] = useState(false);
  const [subtitleShown, setSubtitleShown] = useState(false);

  const fullText = title + "\n" + titleLine2;
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const timeouts: number[] = [];
    timeoutsRef.current = timeouts;

    function schedule(fn: () => void, ms: number) {
      timeouts.push(window.setTimeout(fn, ms));
    }

    function charDelay(ch: string): number {
      let wait = typeSpeed + Math.random() * typeVariance;
      if (ch === ".") wait += 460;
      else if (ch === ",") wait += 180;
      else if (ch === " ") wait -= 10;
      return wait;
    }

    let idx = 0;

    function revealNext() {
      if (idx >= fullText.length) {
        schedule(() => {
          setCursorDone(true);
          schedule(() => setSubtitleShown(true), subtitleDelay);
        }, cursorDoneDelay);
        return;
      }

      const ch = fullText[idx];
      setRevealIdx(idx);
      idx += 1;

      // Newline = line break pause
      if (ch === "\n") {
        schedule(revealNext, lineBreakDelay);
      } else {
        schedule(revealNext, charDelay(ch));
      }
    }

    schedule(() => {
      revealNext();
    }, startDelay);

    return () => {
      for (const id of timeouts) window.clearTimeout(id);
      timeouts.length = 0;
    };
  }, [
    fullText,
    typeSpeed,
    typeVariance,
    startDelay,
    lineBreakDelay,
    cursorDoneDelay,
    subtitleDelay,
  ]);

  // Split fullText into line1 and line2 at the newline
  const nlIdx = fullText.indexOf("\n");
  const line1Chars = fullText.slice(0, nlIdx);
  const line2Chars = fullText.slice(nlIdx + 1);
  const showBreak = revealIdx >= nlIdx;

  const fullLabel = `${title} ${titleLine2}`;

  return (
    <>
      <p className={styles.heroTitle} aria-label={fullLabel}>
        <span aria-hidden="true">
          {line1Chars.split("").map((ch, i) => (
            <span
              key={`l1-${i}`}
              className={`${styles.typeChar} ${i <= revealIdx ? styles.visible : ""}`}
            >
              {ch}
            </span>
          ))}
          {showBreak && <br />}
          {line2Chars.split("").map((ch, i) => {
            const globalIdx = nlIdx + 1 + i;
            return (
              <span
                key={`l2-${i}`}
                className={`${styles.typeChar} ${globalIdx <= revealIdx ? styles.visible : ""}`}
              >
                {ch}
              </span>
            );
          })}
          <span className={`${styles.typeCursor} ${cursorDone ? styles.done : ""}`} />
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
