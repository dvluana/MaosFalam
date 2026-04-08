import type { HandElement } from "@/types/reading";

interface Props {
  type: HandElement;
  size?: number;
}

/**
 * Símbolos alquímicos dos 4 elementos com efeitos próprios:
 *  - Fogo: brasa pulsante, gradient laranja-dourado, shimmer
 *  - Água: líquido animado, ripple, gradient violeta-azul
 *  - Terra: poeira, granulado, gradient ember-brown
 *  - Ar: linhas de vento moving, gradient bone-gold
 */
export default function ElementGlyph({ type, size = 140 }: Props) {
  const strokeWidth = 1.1;

  // Cada elemento tem seu próprio triangulo + pattern interno
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      aria-hidden
      style={{
        filter:
          "drop-shadow(0 0 14px rgba(201,162,74,0.3)) drop-shadow(0 0 32px rgba(201,162,74,0.12))",
      }}
    >
      <defs>
        {/* === FOGO === */}
        <linearGradient id="fire-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ffd27a" />
          <stop offset="40%" stopColor="#f2a54a" />
          <stop offset="75%" stopColor="#c9541e" />
          <stop offset="100%" stopColor="#521810" />
        </linearGradient>
        <radialGradient id="fire-core" cx="50%" cy="70%" r="55%">
          <stop offset="0%" stopColor="rgba(255,220,140,0.55)" />
          <stop offset="40%" stopColor="rgba(239,130,40,0.3)" />
          <stop offset="100%" stopColor="rgba(80,20,10,0)" />
        </radialGradient>

        {/* === ÁGUA === */}
        <linearGradient id="water-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#d6e4ff" />
          <stop offset="45%" stopColor="#7b6ba5" />
          <stop offset="100%" stopColor="#2a1f4a" />
        </linearGradient>
        <radialGradient id="water-core" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="rgba(180,200,255,0.5)" />
          <stop offset="100%" stopColor="rgba(42,31,74,0)" />
        </radialGradient>
        <linearGradient id="water-shine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(220,230,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        {/* === TERRA === */}
        <linearGradient id="earth-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#c99b6a" />
          <stop offset="45%" stopColor="#8b5a38" />
          <stop offset="100%" stopColor="#3a2116" />
        </linearGradient>
        <radialGradient id="earth-core" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="rgba(201,155,106,0.35)" />
          <stop offset="100%" stopColor="rgba(58,33,22,0)" />
        </radialGradient>
        <pattern
          id="earth-dust"
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="2.5" r="0.5" fill="rgba(201,155,106,0.6)" />
          <circle cx="5.5" cy="4.5" r="0.4" fill="rgba(139,90,56,0.7)" />
          <circle cx="3" cy="6.5" r="0.35" fill="rgba(201,155,106,0.5)" />
          <circle cx="6.5" cy="1.2" r="0.3" fill="rgba(90,50,30,0.6)" />
        </pattern>

        {/* === AR === */}
        <linearGradient id="air-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f4ecd8" />
          <stop offset="50%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#5a4f2e" />
        </linearGradient>
        <radialGradient id="air-core" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgba(244,236,216,0.35)" />
          <stop offset="100%" stopColor="rgba(90,79,46,0)" />
        </radialGradient>

        {/* Clip masks pros triangulos */}
        <clipPath id="clip-up">
          <path d="M70 22 L120 114 L20 114 Z" />
        </clipPath>
        <clipPath id="clip-down">
          <path d="M20 28 L120 28 L70 120 Z" />
        </clipPath>
      </defs>

      {/* === Anéis de contexto (comuns a todos) === */}
      <circle
        cx="70"
        cy="70"
        r="64"
        stroke="rgba(201,162,74,0.14)"
        strokeWidth="0.4"
        fill="none"
      />
      <circle
        cx="70"
        cy="70"
        r="58"
        stroke="rgba(201,162,74,0.06)"
        strokeWidth="0.4"
        fill="none"
      />

      {/* === FOGO === */}
      {type === "fire" && (
        <g>
          {/* fill interno pulsante */}
          <g clipPath="url(#clip-up)">
            <rect x="0" y="0" width="140" height="140" fill="url(#fire-core)">
              <animate
                attributeName="opacity"
                values="0.6;1;0.75;1;0.65"
                dur="3.2s"
                repeatCount="indefinite"
              />
            </rect>
            {/* línguas de fogo flickering */}
            <path
              d="M45 110 Q50 90 48 80 Q52 88 55 82 Q54 95 58 105 Z"
              fill="rgba(255,180,60,0.55)"
            >
              <animate
                attributeName="opacity"
                values="0.55;0.9;0.4;0.75;0.55"
                dur="1.8s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 -3; 0 0; 0 -2; 0 0"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M65 108 Q70 85 68 75 Q74 82 78 78 Q75 92 80 104 Z"
              fill="rgba(255,200,90,0.6)"
            >
              <animate
                attributeName="opacity"
                values="0.6;0.3;0.9;0.5;0.6"
                dur="2.2s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 -4; 0 -1; 0 -3; 0 0"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M85 108 Q90 92 88 82 Q94 90 98 85 Q96 100 100 106 Z"
              fill="rgba(255,160,40,0.5)"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.85;0.4;0.65;0.5"
                dur="2.6s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 -2; 0 0; 0 -3; 0 0"
                dur="2.6s"
                repeatCount="indefinite"
              />
            </path>
            {/* brasas flutuantes */}
            <circle cx="55" cy="70" r="0.8" fill="#ffd27a">
              <animate
                attributeName="cy"
                values="90;30"
                dur="4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="82" cy="65" r="0.6" fill="#ffb248">
              <animate
                attributeName="cy"
                values="95;35"
                dur="5s"
                begin="1s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="5s"
                begin="1s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="70" cy="55" r="0.5" fill="#ffe79a">
              <animate
                attributeName="cy"
                values="88;25"
                dur="4.5s"
                begin="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="4.5s"
                begin="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
          {/* contorno do triangulo */}
          <path
            d="M70 22 L120 114 L20 114 Z"
            stroke="url(#fire-grad)"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      )}

      {/* === ÁGUA === */}
      {type === "water" && (
        <g>
          <g clipPath="url(#clip-down)">
            <rect
              x="0"
              y="0"
              width="140"
              height="140"
              fill="url(#water-core)"
            />
            {/* superfície ondulante */}
            <path
              d="M20 50 Q40 46 60 50 T100 50 T140 50 L140 120 L0 120 Z"
              fill="rgba(123,107,165,0.25)"
            >
              <animate
                attributeName="d"
                values="
                  M20 50 Q40 46 60 50 T100 50 T140 50 L140 120 L0 120 Z;
                  M20 50 Q40 54 60 50 T100 50 T140 50 L140 120 L0 120 Z;
                  M20 50 Q40 46 60 50 T100 50 T140 50 L140 120 L0 120 Z
                "
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M20 65 Q40 61 60 65 T100 65 T140 65 L140 120 L0 120 Z"
              fill="rgba(139,123,191,0.2)"
            >
              <animate
                attributeName="d"
                values="
                  M20 65 Q40 61 60 65 T100 65 T140 65 L140 120 L0 120 Z;
                  M20 65 Q40 69 60 65 T100 65 T140 65 L140 120 L0 120 Z;
                  M20 65 Q40 61 60 65 T100 65 T140 65 L140 120 L0 120 Z
                "
                dur="5s"
                repeatCount="indefinite"
              />
            </path>
            {/* shine horizontal */}
            <rect
              x="-140"
              y="40"
              width="140"
              height="4"
              fill="url(#water-shine)"
              opacity="0.6"
            >
              <animate
                attributeName="x"
                values="-140;140"
                dur="6s"
                repeatCount="indefinite"
              />
            </rect>
            {/* gotas descendo */}
            <circle cx="50" cy="45" r="1" fill="rgba(220,230,255,0.7)">
              <animate
                attributeName="cy"
                values="45;105"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="85" cy="40" r="0.8" fill="rgba(220,230,255,0.6)">
              <animate
                attributeName="cy"
                values="40;110"
                dur="3.8s"
                begin="1s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="3.8s"
                begin="1s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
          <path
            d="M20 28 L120 28 L70 120 Z"
            stroke="url(#water-grad)"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      )}

      {/* === TERRA === */}
      {type === "earth" && (
        <g>
          <g clipPath="url(#clip-down)">
            <rect
              x="0"
              y="0"
              width="140"
              height="140"
              fill="url(#earth-core)"
            />
            <rect
              x="0"
              y="0"
              width="140"
              height="140"
              fill="url(#earth-dust)"
              opacity="0.5"
            />
            {/* poeira flutuando */}
            <circle cx="55" cy="80" r="0.6" fill="rgba(201,155,106,0.8)">
              <animate
                attributeName="cy"
                values="110;60"
                dur="7s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cx"
                values="55;58;55"
                dur="7s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.8;0"
                dur="7s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="75" cy="85" r="0.5" fill="rgba(201,155,106,0.7)">
              <animate
                attributeName="cy"
                values="115;55"
                dur="8s"
                begin="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cx"
                values="75;72;75"
                dur="8s"
                begin="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.7;0"
                dur="8s"
                begin="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="90" cy="90" r="0.45" fill="rgba(139,90,56,0.8)">
              <animate
                attributeName="cy"
                values="112;58"
                dur="9s"
                begin="4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.6;0"
                dur="9s"
                begin="4s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
          <path
            d="M20 28 L120 28 L70 120 Z"
            stroke="url(#earth-grad)"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            fill="none"
          />
          {/* barra horizontal (alquímico) */}
          <line
            x1="38"
            y1="73"
            x2="102"
            y2="73"
            stroke="url(#earth-grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* === AR === */}
      {type === "air" && (
        <g>
          <g clipPath="url(#clip-up)">
            <rect x="0" y="0" width="140" height="140" fill="url(#air-core)" />
            {/* linhas de vento deslizando */}
            <path
              d="M25 70 Q50 66 75 70 T125 70"
              stroke="rgba(244,236,216,0.45)"
              strokeWidth="0.6"
              fill="none"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="
                  M25 70 Q50 66 75 70 T125 70;
                  M25 70 Q50 74 75 70 T125 70;
                  M25 70 Q50 66 75 70 T125 70
                "
                dur="4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0.7;0.3"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M30 85 Q55 81 80 85 T130 85"
              stroke="rgba(244,236,216,0.4)"
              strokeWidth="0.5"
              fill="none"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="
                  M30 85 Q55 81 80 85 T130 85;
                  M30 85 Q55 89 80 85 T130 85;
                  M30 85 Q55 81 80 85 T130 85
                "
                dur="5s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M28 98 Q53 94 78 98 T128 98"
              stroke="rgba(244,236,216,0.35)"
              strokeWidth="0.5"
              fill="none"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="
                  M28 98 Q53 94 78 98 T128 98;
                  M28 98 Q53 102 78 98 T128 98;
                  M28 98 Q53 94 78 98 T128 98
                "
                dur="6s"
                repeatCount="indefinite"
              />
            </path>
            {/* partículas cruzando horizontalmente */}
            <circle cx="30" cy="75" r="0.6" fill="rgba(244,236,216,0.9)">
              <animate
                attributeName="cx"
                values="20;120"
                dur="5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="30" cy="92" r="0.5" fill="rgba(244,236,216,0.8)">
              <animate
                attributeName="cx"
                values="20;120"
                dur="7s"
                begin="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="7s"
                begin="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
          <path
            d="M70 22 L120 114 L20 114 Z"
            stroke="url(#air-grad)"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            fill="none"
          />
          <line
            x1="38"
            y1="82"
            x2="102"
            y2="82"
            stroke="url(#air-grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
