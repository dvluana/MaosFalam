"use client";

import type { ReactNode } from "react";

interface Props {
  onClick: () => void;
  glowColor: string;
  eyebrow: string;
  title: string;
  description: string;
  illustration: ReactNode;
}

type CornerVertical = "top" | "bottom";
type CornerHorizontal = "left" | "right";
const CORNERS: ReadonlyArray<readonly [CornerVertical, CornerHorizontal]> = [
  ["top", "left"],
  ["top", "right"],
  ["bottom", "left"],
  ["bottom", "right"],
];

function MethodCard({
  onClick,
  glowColor,
  eyebrow,
  title,
  description,
  illustration,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden card-noise text-left transition-all focus:outline-none"
      style={{
        aspectRatio: "5 / 7",
        background:
          "linear-gradient(165deg, #0e0a18 0%, #110c1a 50%, #08050e 100%)",
        border: "1px solid rgba(201,162,74,0.35)",
        boxShadow: `0 28px 56px -16px rgba(0,0,0,0.9), 0 0 40px -12px ${glowColor}`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 35%, ${glowColor}, transparent 75%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-2 pointer-events-none"
        style={{ border: "1px solid rgba(201,162,74,0.18)" }}
      />
      {CORNERS.map(([v, h]) => (
        <span
          key={`${v}-${h}`}
          aria-hidden
          className="absolute"
          style={{
            [v]: 3,
            [h]: 3,
            width: 14,
            height: 14,
            borderStyle: "solid",
            borderColor: "rgba(201,162,74,0.65)",
            borderWidth: `${v === "top" ? "1.5px" : "0"} ${h === "right" ? "1.5px" : "0"} ${v === "bottom" ? "1.5px" : "0"} ${h === "left" ? "1.5px" : "0"}`,
          }}
        />
      ))}

      <div className="relative h-full flex flex-col items-center justify-between px-5 py-8 text-center">
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-gold-dim/50" />
          <span
            className="w-1.5 h-1.5 rotate-45 bg-gold"
            style={{ boxShadow: "0 0 6px rgba(201,162,74,0.7)" }}
          />
          <span className="h-px w-6 bg-gold-dim/50" />
        </div>

        {illustration}

        <div className="flex flex-col items-center gap-2">
          <span
            className="font-jetbrains text-[8.5px] tracking-[1.8px] uppercase text-gold-dim"
            style={{ fontWeight: 500 }}
          >
            {eyebrow}
          </span>
          <h3 className="font-cinzel text-[18px] sm:text-[20px] font-medium tracking-[0.04em] text-gold leading-tight">
            {title}
          </h3>
          <p className="font-cormorant italic text-[14px] text-bone-dim leading-[1.4] max-w-[180px]">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export default MethodCard;
