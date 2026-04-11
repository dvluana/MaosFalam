"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { HandElement } from "@/types/report";

interface Props {
  element: HandElement;
  tier: "free" | "completo";
  readingId: string;
}

const ELEMENTS: Array<{ value: HandElement; label: string; icon: string }> = [
  { value: "fire", label: "Fogo", icon: "△" },
  { value: "water", label: "Água", icon: "▽" },
  { value: "earth", label: "Terra", icon: "⏣" },
  { value: "air", label: "Ar", icon: "△̄" },
];

const TIERS: Array<{ value: "free" | "completo"; label: string }> = [
  { value: "free", label: "Free" },
  { value: "completo", label: "Pago" },
];

/**
 * Painel dev-only no canto pra trocar entre os 4 elementos e entre
 * free/completo. Só aparece em dev.
 */
export default function ResultStateSwitcher({ element, tier, readingId }: Props) {
  const router = useRouter();
  const search = useSearchParams();

  if (process.env.NODE_ENV === "production") return null;

  const goToElement = (el: HandElement) => {
    const params = new URLSearchParams(search?.toString() ?? "");
    params.set("element", el);
    const base =
      tier === "completo" ? `/ler/resultado/${readingId}/completo` : `/ler/resultado/${readingId}`;
    router.replace(`${base}?${params.toString()}`);
  };

  const goToTier = (t: "free" | "completo") => {
    const params = new URLSearchParams(search?.toString() ?? "");
    params.set("element", element);
    const base =
      t === "completo" ? `/ler/resultado/${readingId}/completo` : `/ler/resultado/${readingId}`;
    router.replace(`${base}?${params.toString()}`);
  };

  return (
    <div
      className="fixed bottom-3 right-3 z-[9999] flex flex-col gap-3 p-3 max-w-[200px]"
      style={{
        background: "rgba(14,10,24,0.92)",
        border: "1px solid rgba(201,162,74,0.22)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 10px 30px -8px rgba(0,0,0,0.9)",
      }}
    >
      <div className="flex flex-col gap-1">
        <span className="font-jetbrains text-[7px] text-gold-dim uppercase tracking-[3px]">
          Elemento
        </span>
        <div className="grid grid-cols-2 gap-1">
          {ELEMENTS.map((el) => (
            <button
              key={el.value}
              type="button"
              onClick={() => goToElement(el.value)}
              className={`font-jetbrains text-[9px] px-2 py-1.5 text-left branded-radius border transition-all ${
                element === el.value
                  ? "border-gold text-gold bg-[rgba(201,162,74,0.1)]"
                  : "border-[rgba(201,162,74,0.12)] text-bone-dim hover:text-bone hover:border-[rgba(201,162,74,0.28)]"
              }`}
            >
              <span className="mr-1 opacity-70">{el.icon}</span>
              {el.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px w-full" style={{ background: "rgba(201,162,74,0.14)" }} />

      <div className="flex flex-col gap-1">
        <span className="font-jetbrains text-[7px] text-gold-dim uppercase tracking-[3px]">
          Tier
        </span>
        <div className="grid grid-cols-2 gap-1">
          {TIERS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => goToTier(t.value)}
              className={`font-jetbrains text-[9px] px-2 py-1.5 branded-radius border transition-all ${
                tier === t.value
                  ? "border-gold text-gold bg-[rgba(201,162,74,0.1)]"
                  : "border-[rgba(201,162,74,0.12)] text-bone-dim hover:text-bone hover:border-[rgba(201,162,74,0.28)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
