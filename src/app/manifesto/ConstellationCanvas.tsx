"use client";

import { useCallback, useEffect, useRef } from "react";

interface Star {
  rx: number;
  ry: number;
  x: number;
  y: number;
  r: number;
  op: number;
  ps: number;
  po: number;
  vx: number;
  vy: number;
}

const STAR_COUNT = 40;
const LINK_DISTANCE = 110;

export default function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const dimRef = useRef({ w: 0, h: 0 });
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);

  const initStars = useCallback((w: number, h: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const rx = Math.random();
      const ry = Math.random();
      stars.push({
        rx,
        ry,
        x: rx * w,
        y: ry * h,
        r: 0.4 + Math.random() * 1.2,
        op: 0.08 + Math.random() * 0.32,
        ps: 0.004 + Math.random() * 0.007,
        po: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
      });
    }
    starsRef.current = stars;
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const d = window.devicePixelRatio || 1;
    const w = Math.ceil(window.innerWidth * d);
    const h = Math.ceil(window.innerHeight * d);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    dimRef.current = { w, h };
    starsRef.current.forEach((s) => {
      s.x = s.rx * w;
      s.y = s.ry * h;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resize();
    initStars(dimRef.current.w, dimRef.current.h);

    const draw = (ts: number) => {
      frameRef.current++;
      if (frameRef.current % 2 !== 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      const { w, h } = dimRef.current;
      ctx.clearRect(0, 0, w, h);
      const t = ts * 0.001;
      const stars = starsRef.current;

      stars.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) {
          s.x = 0;
          s.vx *= -1;
        }
        if (s.x > w) {
          s.x = w;
          s.vx *= -1;
        }
        if (s.y < 0) {
          s.y = 0;
          s.vy *= -1;
        }
        if (s.y > h) {
          s.y = h;
          s.vy *= -1;
        }
        s.rx = s.x / w;
        s.ry = s.y / h;
      });

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(201,162,74,${((1 - d / LINK_DISTANCE) * 0.05).toFixed(3)})`;
            ctx.lineWidth = 0.35;
            ctx.stroke();
          }
        }
      }

      stars.forEach((s) => {
        const p = 0.5 + 0.5 * Math.sin(t * s.ps * 1000 + s.po);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,74,${(s.op * (0.6 + 0.4 * p)).toFixed(3)})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [resize, initStars]);

  return (
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
  );
}
