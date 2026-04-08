interface Props {
  size?: number;
}

/**
 * Glyph pequeno pros cruzamentos — duas linhas curvas se cruzando
 * com um nó pulsante no ponto de intersecção.
 */
export default function CrossingGlyph({ size = 68 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden
      style={{
        filter:
          "drop-shadow(0 0 8px rgba(196,100,122,0.4)) drop-shadow(0 0 20px rgba(201,162,74,0.15))",
      }}
    >
      <defs>
        <linearGradient id="cx-rose" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(196,100,122,0)" />
          <stop offset="50%" stopColor="#c4647a" />
          <stop offset="100%" stopColor="rgba(196,100,122,0)" />
        </linearGradient>
        <linearGradient id="cx-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(201,162,74,0)" />
          <stop offset="50%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="rgba(201,162,74,0)" />
        </linearGradient>
        <radialGradient id="cx-core" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(255,220,140,0.6)" />
          <stop offset="100%" stopColor="rgba(201,162,74,0)" />
        </radialGradient>
      </defs>

      {/* Anel externo sutil */}
      <circle
        cx="40"
        cy="40"
        r="34"
        stroke="rgba(201,162,74,0.1)"
        strokeWidth="0.4"
        fill="none"
      />
      <circle
        cx="40"
        cy="40"
        r="28"
        stroke="rgba(201,162,74,0.18)"
        strokeWidth="0.4"
        strokeDasharray="1 2"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 40 40"
          to="360 40 40"
          dur="50s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Linha 1 — curva rose (horizontal) */}
      <path
        d="M 10 48 Q 40 28 70 48"
        stroke="url(#cx-rose)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      >
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur="3.2s"
          repeatCount="indefinite"
        />
      </path>

      {/* Linha 2 — curva gold (vertical-ish) */}
      <path
        d="M 32 10 Q 52 40 32 70"
        stroke="url(#cx-gold)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      >
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur="3.2s"
          begin="0.6s"
          repeatCount="indefinite"
        />
      </path>

      {/* Nó central — halo pulsante */}
      <circle cx="40" cy="40" r="10" fill="url(#cx-core)">
        <animate
          attributeName="r"
          values="8;14;8"
          dur="2.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="2.8s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Ponto duro no centro */}
      <circle cx="40" cy="40" r="2.2" fill="#ffe79a">
        <animate
          attributeName="r"
          values="1.8;3;1.8"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Ticks de medição ao redor do nó */}
      {[0, 90, 180, 270].map((deg) => (
        <line
          key={deg}
          x1="40"
          y1="22"
          x2="40"
          y2="26"
          stroke="rgba(201,162,74,0.4)"
          strokeWidth="0.6"
          strokeLinecap="round"
          transform={`rotate(${deg} 40 40)`}
        />
      ))}
    </svg>
  );
}
