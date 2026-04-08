"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Curtains.module.css";

/**
 * Curtains — preloader com duas cortinas de veludo em canvas.
 *
 * Cada cortina é uma simulação leve de tecido: FOLDS dobras verticais
 * com ROWS amostras cada, uma onda composta por 3 senoides em frequências
 * diferentes (sway orgânico), e um "anticipation shimmer" antes de abrir.
 *
 * Timeline default (bate com o reveal original da home):
 *   t = openDelay    (2200 ms) → anticipation breath
 *   t + 820 ms       → sweep começa
 *   t = fadeDelay    (7200 ms) → preloader fade 0.9s
 *   t = cleanupDelay (8500 ms) → display:none + RAF loops killed
 *
 * A coreografia completa da landing (lamp + stage-dark + nav) é feita
 * pelo pai via props adicionais (onOpenStart, onFadeComplete).
 */

type Side = "left" | "right";

class VelvetCurtain {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly side: Side;
  readonly FOLDS: number;
  readonly ROWS: number;

  t = 0;
  openP = 0;
  antP = 0;
  opening = false;
  anticipating = false;
  alive = true;

  private W = 0;
  private H = 0;
  private rafId: number | null = null;
  private openTimeoutId: number | null = null;
  private readonly resizeHandler: () => void;

  constructor(canvas: HTMLCanvasElement, side: Side) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
    this.side = side;

    const isMob = window.innerWidth <= 480;
    this.FOLDS = isMob ? 5 : 9;
    this.ROWS = isMob ? 42 : 52;

    this.resizeHandler = () => this._resize();
    this._resize();
    window.addEventListener("resize", this.resizeHandler);
    this.rafId = requestAnimationFrame((ts) => this._loop(ts));
  }

  private _resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.W = this.canvas.width;
    this.H = this.canvas.height;
  }

  /** Posição horizontal da amostra c na linha yF no tempo t. */
  private _cx(c: number, _yF: number, t: number): number {
    const W = this.W;
    const total = this.FOLDS * 2 + 1;
    const base = (c / total) * W;
    // ef: proximidade da borda livre (0 = parede ancorada, 1 = centro livre)
    const ef = this.side === "left" ? c / total : 1 - c / total;
    // anticipation shimmer — borda livre balança mais
    const ant = Math.sin(t * 13 + c * 1.05) * this.antP * 7 * ef;
    // three-frequency sway — morre conforme a cortina abre
    const sa = (1.6 + ef * 2.6) * (1 - this.openP);
    const sway =
      Math.sin(t * 0.44 + c * 0.68) * sa +
      Math.sin(t * 0.87 + c * 1.22) * sa * 0.4 +
      Math.sin(t * 1.51 + c * 0.48) * sa * 0.18;
    let openX = 0;
    if (this.openP > 0) {
      const eased = 1 - Math.pow(1 - this.openP, 3);
      openX = (this.side === "left" ? -1 : 1) * eased * W * 1.12;
    }
    return base + ant + sway + openX;
  }

  private _draw(t: number) {
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;
    ctx.clearRect(0, 0, W, H);
    const total = this.FOLDS * 2 + 1;

    for (let c = 0; c < total - 1; c++) {
      const isPeak = c % 2 === 0;
      const Lx: number[] = [];
      const Rx: number[] = [];
      for (let r = 0; r <= this.ROWS; r++) {
        const yF = r / this.ROWS;
        Lx.push(this._cx(c, yF, t));
        Rx.push(this._cx(c + 1, yF, t));
      }

      ctx.beginPath();
      ctx.moveTo(Lx[0], 0);
      for (let r = 1; r <= this.ROWS; r++) {
        ctx.lineTo(Lx[r], (r / this.ROWS) * H);
      }
      for (let r = this.ROWS; r >= 0; r--) {
        ctx.lineTo(Rx[r], (r / this.ROWS) * H);
      }
      ctx.closePath();

      const g = ctx.createLinearGradient(
        this._cx(c, 0.5, t),
        0,
        this._cx(c + 1, 0.5, t),
        0,
      );
      if (isPeak) {
        g.addColorStop(0, "rgba(3,2,5,1)");
        g.addColorStop(0.3, "rgba(12,8,16,1)");
        g.addColorStop(0.5, "rgba(16,10,20,1)");
        g.addColorStop(0.7, "rgba(12,8,16,1)");
        g.addColorStop(1, "rgba(3,2,5,1)");
      } else {
        g.addColorStop(0, "rgba(2,1,3,1)");
        g.addColorStop(0.5, "rgba(2,1,4,1)");
        g.addColorStop(1, "rgba(2,1,3,1)");
      }
      ctx.fillStyle = g;
      ctx.fill();
    }

    // Sombra superior + vinheta inferior
    const dg = ctx.createLinearGradient(0, 0, 0, H);
    dg.addColorStop(0, "rgba(0,0,0,0.72)");
    dg.addColorStop(0.06, "rgba(0,0,0,0)");
    dg.addColorStop(0.8, "rgba(0,0,0,0)");
    dg.addColorStop(1, "rgba(0,0,0,0.90)");
    ctx.fillStyle = dg;
    ctx.fillRect(0, 0, W, H);

    // Barra de bainha dourada no rodapé
    ctx.globalAlpha = 0.6;
    for (let x = 0; x < W; x += 9) {
      ctx.fillStyle =
        x % 18 === 0 ? "rgba(160,122,44,0.85)" : "rgba(90,68,22,0.7)";
      ctx.fillRect(x, H - 20, 1.4, 20);
    }
    ctx.globalAlpha = 1;
  }

  private _loop = (ts: number) => {
    if (!this.alive) return;
    this.t = ts * 0.001;
    if (this.anticipating && this.antP < 1) {
      this.antP = Math.min(1, this.antP + 0.045);
    } else if (!this.anticipating && this.antP > 0) {
      this.antP = Math.max(0, this.antP - 0.018);
    }
    // Sweep mais lento — majestoso
    if (this.opening && this.openP < 1) {
      this.openP = Math.min(1, this.openP + 0.0065);
    }
    this._draw(this.t);
    if (this.alive) {
      this.rafId = requestAnimationFrame(this._loop);
    }
  };

  open() {
    this.anticipating = true;
    // Respiração longa antes de abrir o sweep
    this.openTimeoutId = window.setTimeout(() => {
      this.anticipating = false;
      this.opening = true;
      this.openTimeoutId = null;
    }, 820);
  }

  destroy() {
    this.alive = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.openTimeoutId !== null) {
      window.clearTimeout(this.openTimeoutId);
      this.openTimeoutId = null;
    }
    window.removeEventListener("resize", this.resizeHandler);
  }
}

interface CurtainsProps {
  /** Delay em ms antes de começar a anticipation + sweep. */
  openDelay?: number;
  /** Delay em ms antes de aplicar a classe `fade` (preloader fade out 0.9s). */
  fadeDelay?: number;
  /** Delay em ms antes de remover display e matar os RAF loops. */
  cleanupDelay?: number;
  /** Disparado quando `open()` é chamado (início da anticipation). */
  onOpenStart?: () => void;
  /** Disparado quando o preloader entra em fade. */
  onFadeStart?: () => void;
  /** Disparado quando o preloader termina cleanup e vai embora. */
  onCleanup?: () => void;
  /**
   * Se false, o componente monta mas não roda a timeline automática —
   * útil pra testes ou pra coreografia manual via ref no futuro.
   * Default: true.
   */
  autoPlay?: boolean;
}

export default function Curtains({
  openDelay = 2200,
  fadeDelay = 7200,
  cleanupDelay = 8500,
  onOpenStart,
  onFadeStart,
  onCleanup,
  autoPlay = true,
}: CurtainsProps) {
  const canvasLeftRef = useRef<HTMLCanvasElement>(null);
  const canvasRightRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<"idle" | "fading" | "gone">("idle");

  useEffect(() => {
    if (!canvasLeftRef.current || !canvasRightRef.current) return;

    let curtL: VelvetCurtain;
    let curtR: VelvetCurtain;
    try {
      curtL = new VelvetCurtain(canvasLeftRef.current, "left");
      curtR = new VelvetCurtain(canvasRightRef.current, "right");
    } catch {
      // Contexto 2D indisponível — pula cortinas, não quebra a landing
      setStage("gone");
      return;
    }

    const timeouts: number[] = [];
    if (autoPlay) {
      timeouts.push(
        window.setTimeout(() => {
          curtL.open();
          curtR.open();
          onOpenStart?.();
        }, openDelay),
      );
      timeouts.push(
        window.setTimeout(() => {
          setStage("fading");
          onFadeStart?.();
        }, fadeDelay),
      );
      timeouts.push(
        window.setTimeout(() => {
          setStage("gone");
          curtL.destroy();
          curtR.destroy();
          onCleanup?.();
        }, cleanupDelay),
      );
    }

    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
      curtL.destroy();
      curtR.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const className = [
    styles.preloader,
    stage === "fading" ? styles.fade : "",
    stage === "gone" ? styles.gone : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} aria-hidden="true">
      <div className={styles.curtainLeft}>
        <canvas ref={canvasLeftRef} className={styles.canvas} />
      </div>
      <div className={styles.curtainRight}>
        <canvas ref={canvasRightRef} className={styles.canvas} />
      </div>
    </div>
  );
}
