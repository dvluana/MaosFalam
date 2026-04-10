"use client";

import { motion } from "framer-motion";

import type { ReactNode } from "react";

interface Props {
  onPickLive: () => void;
  onPickUpload: () => void;
}

/* ── Illustrations ── */

function MysticEyeIllustration() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
      className="shrink-0 transition-transform duration-500 group-hover:scale-110"
      style={{
        filter:
          "drop-shadow(0 0 10px rgba(201,162,74,0.3)) drop-shadow(0 0 24px rgba(201,162,74,0.1))",
      }}
    >
      <defs>
        <linearGradient id="eye-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#e3c77a" />
          <stop offset="50%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#6e5a28" />
        </linearGradient>
        <radialGradient id="eye-iris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,220,140,0.5)" />
          <stop offset="100%" stopColor="rgba(201,162,74,0)" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="54" stroke="rgba(201,162,74,0.15)" strokeWidth="0.5" fill="none" />
      <circle
        cx="60"
        cy="60"
        r="46"
        stroke="rgba(201,162,74,0.28)"
        strokeWidth="0.5"
        strokeDasharray="2 3"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 60 60"
          to="360 60 60"
          dur="40s"
          repeatCount="indefinite"
        />
      </circle>
      <path
        d="M 16 60 Q 60 24 104 60 Q 60 96 16 60 Z"
        stroke="url(#eye-grad)"
        strokeWidth="1.5"
        fill="rgba(201,162,74,0.06)"
      />
      <circle cx="60" cy="60" r="18" fill="url(#eye-iris)">
        <animate attributeName="r" values="16;20;16" dur="3.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="60" r="14" stroke="url(#eye-grad)" strokeWidth="1.2" fill="none" />
      <circle cx="60" cy="60" r="5" fill="#08050e" />
      <circle cx="60" cy="60" r="3" fill="url(#eye-grad)">
        <animate attributeName="r" values="2.5;4;2.5" dur="3.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="57" cy="57" r="1.2" fill="#ffe79a" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line
          key={deg}
          x1="60"
          y1="28"
          x2="60"
          y2="22"
          stroke="url(#eye-grad)"
          strokeWidth="1"
          strokeLinecap="round"
          transform={`rotate(${deg} 60 60)`}
          opacity="0.6"
        />
      ))}
    </svg>
  );
}

function PortraitIllustration() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
      className="shrink-0 transition-transform duration-500 group-hover:scale-110"
      style={{
        filter:
          "drop-shadow(0 0 10px rgba(139,123,191,0.3)) drop-shadow(0 0 24px rgba(201,162,74,0.1))",
      }}
    >
      <defs>
        <linearGradient id="scroll-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#e3c77a" />
          <stop offset="50%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#6e5a28" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="54" stroke="rgba(201,162,74,0.15)" strokeWidth="0.5" fill="none" />
      <circle
        cx="60"
        cy="60"
        r="46"
        stroke="rgba(139,123,191,0.28)"
        strokeWidth="0.5"
        strokeDasharray="2 3"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="360 60 60"
          to="0 60 60"
          dur="50s"
          repeatCount="indefinite"
        />
      </circle>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -3; 0 0; 0 2; 0 0"
          dur="6s"
          repeatCount="indefinite"
        />
        <rect
          x="35"
          y="32"
          width="50"
          height="56"
          stroke="url(#scroll-grad)"
          strokeWidth="1.5"
          fill="rgba(14,10,24,0.7)"
        />
        <rect
          x="39"
          y="36"
          width="42"
          height="48"
          stroke="rgba(201,162,74,0.4)"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M 48 52 Q 56 46 64 52 Q 72 58 72 68"
          stroke="rgba(201,162,74,0.5)"
          strokeWidth="0.7"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 48 62 Q 60 58 72 62"
          stroke="rgba(201,162,74,0.5)"
          strokeWidth="0.7"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 50 72 Q 60 70 70 75"
          stroke="rgba(196,100,122,0.5)"
          strokeWidth="0.7"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M 38 35 L 42 35 M 38 35 L 38 39" stroke="url(#scroll-grad)" strokeWidth="1" />
        <path d="M 82 35 L 78 35 M 82 35 L 82 39" stroke="url(#scroll-grad)" strokeWidth="1" />
        <path d="M 38 85 L 42 85 M 38 85 L 38 81" stroke="url(#scroll-grad)" strokeWidth="1" />
        <path d="M 82 85 L 78 85 M 82 85 L 82 81" stroke="url(#scroll-grad)" strokeWidth="1" />
      </g>
      <circle cx="30" cy="50" r="1" fill="#ffe79a">
        <animate attributeName="opacity" values="0;1;0" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="58" r="0.8" fill="#ffe79a">
        <animate
          attributeName="opacity"
          values="0;1;0"
          dur="3.2s"
          begin="0.7s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="28" cy="70" r="0.9" fill="#ffe79a">
        <animate
          attributeName="opacity"
          values="0;1;0"
          dur="3s"
          begin="1.3s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="92" cy="78" r="0.7" fill="#ffe79a">
        <animate
          attributeName="opacity"
          values="0;1;0"
          dur="3.4s"
          begin="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

/* ── Stacked Method Card ── */

interface MethodCardProps {
  onClick: () => void;
  glowColor: string;
  accentColor: string;
  eyebrow: string;
  title: string;
  description: string;
  illustration: ReactNode;
  delay: number;
}

function MethodCard({
  onClick,
  glowColor,
  accentColor,
  eyebrow,
  title,
  description,
  illustration,
  delay,
}: MethodCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      className="group relative w-full overflow-hidden card-noise text-left transition-[border-color,box-shadow] duration-300 focus:outline-none"
      style={{
        background: "linear-gradient(165deg, #0e0a18 0%, #110c1a 50%, #08050e 100%)",
        border: "1px solid rgba(201,162,74,0.12)",
        borderRadius: "0 6px 0 6px",
        boxShadow: `0 12px 32px -8px rgba(0,0,0,0.7), 0 0 24px -8px ${glowColor}`,
      }}
      whileHover={{
        borderColor: "rgba(201,162,74,0.3)",
        boxShadow: `0 16px 40px -8px rgba(0,0,0,0.8), 0 0 32px -4px ${glowColor}`,
      }}
    >
      {/* Accent line top */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: 0.5,
        }}
      />

      {/* Glow atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 15% 50%, ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Corner ornaments */}
      <span
        aria-hidden
        className="absolute top-[3px] left-[3px] w-2 h-2 border-t border-l border-gold/25 transition-all duration-300 group-hover:w-3 group-hover:h-3"
      />
      <span
        aria-hidden
        className="absolute bottom-[3px] right-[3px] w-2 h-2 border-b border-r border-gold/25 transition-all duration-300 group-hover:w-3 group-hover:h-3"
      />

      {/* Inner border */}
      <div
        aria-hidden
        className="absolute inset-[5px] pointer-events-none"
        style={{ border: "1px solid rgba(201,162,74,0.04)" }}
      />

      {/* Content row */}
      <div className="relative flex items-center gap-5 px-5 py-5 sm:px-6 sm:py-6">
        {/* Illustration */}
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{ width: 80, height: 80 }}
        >
          {illustration}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <span
            className="font-jetbrains text-[8px] tracking-[2px] uppercase"
            style={{ fontWeight: 500, color: accentColor }}
          >
            {eyebrow}
          </span>
          <h3 className="font-cinzel text-[16px] sm:text-[18px] font-medium tracking-[0.03em] text-bone leading-tight">
            {title}
          </h3>
          <p className="font-cormorant italic text-[14px] sm:text-[15px] text-bone-dim leading-[1.4]">
            {description}
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="shrink-0 ml-auto pl-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="text-gold-dim group-hover:text-gold transition-colors duration-300 group-hover:translate-x-0.5 transition-transform"
          >
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Main Component ── */

function MethodChoice({ onPickLive, onPickUpload }: Props) {
  return (
    <div className="relative flex flex-col gap-4 w-full max-w-md">
      <MethodCard
        onClick={onPickLive}
        glowColor="rgba(201,162,74,0.15)"
        accentColor="#c9a24a"
        eyebrow="ao vivo"
        title="Abrir a mao agora"
        description="Abro a camera, voce estende a palma."
        illustration={<MysticEyeIllustration />}
        delay={0.1}
      />
      <MethodCard
        onClick={onPickUpload}
        glowColor="rgba(139,123,191,0.15)"
        accentColor="#7b6ba5"
        eyebrow="retrato"
        title="Me mandar a foto"
        description="Ja tem um retrato da palma. Me manda."
        illustration={<PortraitIllustration />}
        delay={0.25}
      />
    </div>
  );
}

export default MethodChoice;
