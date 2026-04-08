"use client";

import { useEffect, useRef } from "react";
import styles from "./Grain.module.css";

/**
 * Grain — ruído cinematográfico animado.
 * Porta fiel do Effect 1 do landing legado (public/home.html).
 * Renderiza em resolução capada (máx 400px) e deixa o CSS escalar.
 */

interface GrainProps {
  /** Largura máxima do buffer de ruído em px. Default: 400 (original). */
  intensity?: number;
}

export default function Grain({ intensity = 400 }: GrainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let timeoutId = 0;

    function resize() {
      if (!canvas) return;
      const scale = Math.min(1, intensity / window.innerWidth);
      W = canvas.width = Math.ceil(window.innerWidth * scale);
      H = canvas.height = Math.ceil(window.innerHeight * scale);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }

    function drawGrain() {
      if (!ctx) return;
      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;
      const len = data.length;
      for (let i = 0; i < len; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = (18 + Math.random() * 4) | 0;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    function loop() {
      drawGrain();
      timeoutId = window.setTimeout(loop, 80);
    }

    const handleResize = () => resize();

    resize();
    window.addEventListener("resize", handleResize);
    loop();

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />;
}
