"use client";

import { useEffect, useState } from "react";

/**
 * LunarClock — relógio que marca as horas e a fase da lua agora.
 * A cigana não precisa de calendário. Ela olha pro céu.
 *
 * Pinned bottom-left no desktop, centralizado no rodapé no mobile.
 */

const SYNODIC_PERIOD = 29.53058867;
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

function getLunarPhaseDays(date: Date): number {
  const daysSince = (date.getTime() - KNOWN_NEW_MOON_MS) / 86_400_000;
  const mod = ((daysSince % SYNODIC_PERIOD) + SYNODIC_PERIOD) % SYNODIC_PERIOD;
  return mod;
}

/** Retorna um dos 8 setores: 0 nova, 2 quarto crescente, 4 cheia, 6 quarto minguante. */
function getPhaseSector(phaseDays: number): number {
  const normalized = phaseDays / SYNODIC_PERIOD;
  return Math.round(normalized * 8) % 8;
}

const GOLD = "rgba(201,162,74,0.5)";
const DARK = "rgba(20,12,35,0.95)";
const OUTLINE = "rgba(201,162,74,0.3)";
const R = 5;
const CX = 7;
const CY = 7;

function MoonSvg({ sector }: { sector: number }) {
  const baseFill = sector >= 4 ? GOLD : DARK;

  let shape: React.ReactNode = null;
  if (sector === 2) {
    shape = (
      <path d={`M${CX},${CY - R} A${R},${R} 0 0,1 ${CX},${CY + R} Z`} fill={GOLD} />
    );
  } else if (sector === 6) {
    shape = (
      <path d={`M${CX},${CY - R} A${R},${R} 0 0,0 ${CX},${CY + R} Z`} fill={GOLD} />
    );
  } else if (sector === 1) {
    shape = (
      <>
        <circle cx={CX} cy={CY} r={R} fill={DARK} stroke={OUTLINE} strokeWidth="0.5" />
        <path
          d={`M${CX},${CY - R} A${R * 0.3},${R} 0 0,1 ${CX},${CY + R} A${R},${R} 0 0,1 ${CX},${CY - R} Z`}
          fill={GOLD}
        />
      </>
    );
  } else if (sector === 3) {
    shape = (
      <path
        d={`M${CX},${CY - R} A${R * 0.3},${R} 0 0,0 ${CX},${CY + R} A${R},${R} 0 0,1 ${CX},${CY - R} Z`}
        fill={DARK}
      />
    );
  } else if (sector === 5) {
    shape = (
      <path
        d={`M${CX},${CY - R} A${R * 0.3},${R} 0 0,1 ${CX},${CY + R} A${R},${R} 0 0,0 ${CX},${CY - R} Z`}
        fill={DARK}
      />
    );
  } else if (sector === 7) {
    shape = (
      <>
        <circle cx={CX} cy={CY} r={R} fill={DARK} stroke={OUTLINE} strokeWidth="0.5" />
        <path
          d={`M${CX},${CY - R} A${R * 0.3},${R} 0 0,0 ${CX},${CY + R} A${R},${R} 0 0,0 ${CX},${CY - R} Z`}
          fill={GOLD}
        />
      </>
    );
  }

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx={CX} cy={CY} r={R} fill={baseFill} stroke={OUTLINE} strokeWidth="0.5" />
      {shape}
    </svg>
  );
}

interface LunarClockProps {
  /** Controla a aparição suave. Default true. */
  visible?: boolean;
}

export default function LunarClock({ visible = true }: LunarClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Enquanto não hidratou, não renderiza nada pra evitar mismatch SSR/CSR.
  if (!now) return null;

  const sector = getPhaseSector(getLunarPhaseDays(now));
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  return (
    <div
      aria-label="Hora e fase da lua"
      className={[
        "pointer-events-none fixed z-[60] flex items-center gap-[7px] transition-opacity duration-[600ms] ease-out",
        "bottom-6 left-5",
        "max-[480px]:left-1/2 max-[480px]:bottom-3 max-[480px]:-translate-x-1/2",
        "max-[480px]:rounded-none max-[480px]:rounded-tr-[3px] max-[480px]:rounded-bl-[3px]",
        "max-[480px]:border max-[480px]:border-gold/10 max-[480px]:bg-black/40 max-[480px]:px-[10px] max-[480px]:py-[4px]",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <MoonSvg sector={sector} />
      <span
        className="font-jetbrains text-[8px] font-light tracking-[3px] text-gold/45 max-[480px]:tracking-[2px]"
      >
        {hh}:{mm}
      </span>
    </div>
  );
}
