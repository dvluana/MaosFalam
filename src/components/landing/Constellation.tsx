"use client";

import { useEffect, useRef } from "react";

import styles from "./Constellation.module.css";

/**
 * Constellation — canvas de estrelas conectadas por linhas douradas.
 * Porta fiel do Effect 5 do landing legado (public/home.html).
 */

interface Star {
  rx: number;
  ry: number;
  x: number;
  y: number;
  r: number;
  base_opacity: number;
  pulse_speed: number;
  pulse_offset: number;
  vx: number;
  vy: number;
}

interface ConstellationProps {
  /** Override do número de estrelas. Default: 55 (desktop) / 25 (mobile <480px). */
  particleCount?: number;
  /** Override da distância máxima de conexão em px. Default: 120 (desktop) / 80 (mobile). */
  connectionDistance?: number;
}

export default function Constellation({ particleCount, connectionDistance }: ConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const isMobile = window.innerWidth < 480;
    const NUM_STARS = particleCount ?? (isMobile ? 25 : 55);
    const LINK_DIST = connectionDistance ?? (isMobile ? 80 : 120);
    let stars: Star[] = [];
    let constFrame = 0;
    let rafId = 0;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      W = canvas.width = Math.ceil(window.innerWidth * dpr);
      H = canvas.height = Math.ceil(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      if (stars.length) {
        stars.forEach((s) => {
          s.x = s.rx * W;
          s.y = s.ry * H;
        });
      }
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < NUM_STARS; i++) {
        const rx = Math.random();
        const ry = Math.random();
        stars.push({
          rx,
          ry,
          x: rx * W,
          y: ry * H,
          r: 0.5 + Math.random() * 1.3,
          base_opacity: 0.1 + Math.random() * 0.4,
          pulse_speed: 0.004 + Math.random() * 0.008,
          pulse_offset: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
        });
      }
    }

    function draw(ts: number) {
      constFrame++;
      if (isMobile && constFrame % 2 !== 0) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const t = ts * 0.001;

      stars.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) {
          s.x = 0;
          s.vx *= -1;
        }
        if (s.x > W) {
          s.x = W;
          s.vx *= -1;
        }
        if (s.y < 0) {
          s.y = 0;
          s.vy *= -1;
        }
        if (s.y > H) {
          s.y = H;
          s.vy *= -1;
        }
        s.rx = s.x / W;
        s.ry = s.y / H;
      });

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.06;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(201,162,74,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      stars.forEach((s) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * s.pulse_speed * 1000 + s.pulse_offset);
        const opacity = s.base_opacity * (0.6 + 0.4 * pulse);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,74,${opacity.toFixed(3)})`;
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    }

    const handleResize = () => resize();

    resize();
    createStars();
    window.addEventListener("resize", handleResize);
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [particleCount, connectionDistance]);

  return <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />;
}
