"use client";

import { motion } from "framer-motion";
import MethodCard from "./MethodCard";

interface Props {
  onPickLive: () => void;
  onPickUpload: () => void;
}

function MysticEyeIllustration() {
  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
      className="transition-transform duration-500 group-hover:scale-105"
      style={{
        filter:
          "drop-shadow(0 0 14px rgba(201,162,74,0.35)) drop-shadow(0 0 32px rgba(201,162,74,0.12))",
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
      width="110"
      height="110"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
      className="transition-transform duration-500 group-hover:scale-105"
      style={{
        filter:
          "drop-shadow(0 0 14px rgba(139,123,191,0.35)) drop-shadow(0 0 32px rgba(201,162,74,0.12))",
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

function MethodChoice({ onPickLive, onPickUpload }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.1 }}
      className="relative grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl"
    >
      <MethodCard
        onClick={onPickLive}
        glowColor="rgba(201,162,74,0.22)"
        eyebrow="ao vivo"
        title="Abrir a mão agora"
        description="Deixa eu ver na sua frente. Abro a câmera, você estende a palma."
        illustration={<MysticEyeIllustration />}
      />
      <MethodCard
        onClick={onPickUpload}
        glowColor="rgba(139,123,191,0.22)"
        eyebrow="retrato"
        title="Te entregar a foto"
        description="Já tem um retrato da sua palma. Me manda ele que eu leio do mesmo jeito."
        illustration={<PortraitIllustration />}
      />
    </motion.div>
  );
}

export default MethodChoice;
