import GlyphShell, { type GlyphTheme } from "./GlyphShell";

interface Props {
  name: string;
  size?: number;
}

const RARE_THEME: GlyphTheme = {
  id: "rare",
  stops: [
    { offset: "0%", color: "#ffe79a" },
    { offset: "50%", color: "#c9a24a" },
    { offset: "100%", color: "#6e5a28" },
  ],
  coreStops: [
    { offset: "0%", color: "rgba(255,220,140,0.45)" },
    { offset: "100%", color: "rgba(201,162,74,0)" },
  ],
  ringColor: "rgba(201,162,74,0.32)",
  innerRingColor: "rgba(201,162,74,0.14)",
  shadow:
    "drop-shadow(0 0 10px rgba(201,162,74,0.55)) drop-shadow(0 0 20px rgba(201,162,74,0.25))",
};

const GRAD = "url(#rare-grad)";

/**
 * Glyph pequeno pros Sinais Raros — ilustração única por tipo de sinal.
 * Sinais raros ganham destaque maior (glow gold) porque são, bem, raros.
 */
export default function RareSignGlyph({ name, size = 72 }: Props) {
  const key = name.toLowerCase();

  return (
    <GlyphShell
      theme={RARE_THEME}
      size={size}
      glowRadius={34}
      outerRingRadius={36}
      innerRingRadius={30}
      outerDashArray="1 2"
      ringRotationDur="32s"
      innerRotationDur="60s"
      glowPulseDur="3s"
      strongGlow
    >
      {pickSign(key)}
    </GlyphShell>
  );
}

function pickSign(key: string) {
  // ESTRELA
  if (key.includes("estrela") || key.includes("star")) {
    return (
      <g>
        <path
          d="M40 22 L43.5 36 L58 37 L47 46 L51 60 L40 52 L29 60 L33 46 L22 37 L36.5 36 Z"
          fill={GRAD}
          stroke={GRAD}
          strokeWidth="0.8"
          strokeLinejoin="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 40 40"
            to="360 40 40"
            dur="50s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="40" cy="40" r="1.5" fill="#fff9e0">
          <animate
            attributeName="r"
            values="1;2.5;1"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.4;1;0.4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  }

  // CRUZ MÍSTICA
  if (key.includes("cruz") || key.includes("cross")) {
    return (
      <g>
        <path
          d="M40 22 L40 58 M22 40 L58 40"
          stroke={GRAD}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="40" cy="22" r="1.3" fill={GRAD} />
        <circle cx="40" cy="58" r="1.3" fill={GRAD} />
        <circle cx="22" cy="40" r="1.3" fill={GRAD} />
        <circle cx="58" cy="40" r="1.3" fill={GRAD} />
        <path d="M40 36 L44 40 L40 44 L36 40 Z" fill={GRAD}>
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="2.6s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    );
  }

  // QUADRADO PROTETOR
  if (key.includes("quadrado") || key.includes("square")) {
    return (
      <g>
        <rect
          x="24"
          y="24"
          width="32"
          height="32"
          stroke={GRAD}
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        <path
          d="M24 40 L56 40"
          stroke={GRAD}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle cx="24" cy="24" r="1.5" fill="#ffe79a">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="56" cy="24" r="1.5" fill="#ffe79a">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="2.4s"
            begin="0.6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="24" cy="56" r="1.5" fill="#ffe79a">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="2.4s"
            begin="1.2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="56" cy="56" r="1.5" fill="#ffe79a">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="2.4s"
            begin="1.8s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  }

  // ANEL DE SALOMÃO
  if (
    key.includes("salomão") ||
    key.includes("salomao") ||
    key.includes("anel")
  ) {
    return (
      <g>
        <circle
          cx="40"
          cy="40"
          r="16"
          stroke={GRAD}
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="40"
          cy="40"
          r="10"
          stroke={GRAD}
          strokeWidth="1.2"
          strokeDasharray="2 2"
          fill="none"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 40 40"
            to="360 40 40"
            dur="15s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  }

  // LINHA DO SOL
  if (key.includes("sol")) {
    return (
      <g>
        <circle
          cx="40"
          cy="40"
          r="8"
          stroke={GRAD}
          strokeWidth="2"
          fill="rgba(201,162,74,0.2)"
        />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="40"
            y1="22"
            x2="40"
            y2="28"
            stroke={GRAD}
            strokeWidth="1.6"
            strokeLinecap="round"
            transform={`rotate(${deg} 40 40)`}
          />
        ))}
        <circle cx="40" cy="40" r="2" fill="#ffe79a">
          <animate
            attributeName="r"
            values="1.5;3;1.5"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  }

  // INTUIÇÃO
  if (key.includes("intuição") || key.includes("intuicao")) {
    return (
      <g>
        <path
          d="M24 54 Q40 22 56 54"
          stroke={GRAD}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="40" cy="30" r="2" fill={GRAD}>
          <animate
            attributeName="opacity"
            values="0.4;1;0.4"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  }

  // TRIÂNGULO
  if (key.includes("triângulo") || key.includes("triangulo")) {
    return (
      <g>
        <path
          d="M40 22 L58 54 L22 54 Z"
          stroke={GRAD}
          strokeWidth="2"
          fill="rgba(201,162,74,0.12)"
          strokeLinejoin="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 40 40"
            to="360 40 40"
            dur="40s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    );
  }

  // Default: estrela de 4 pontas
  return (
    <g>
      <path
        d="M40 22 L44 36 L58 40 L44 44 L40 58 L36 44 L22 40 L36 36 Z"
        fill={GRAD}
        stroke={GRAD}
        strokeWidth="0.8"
        strokeLinejoin="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 40 40"
          to="360 40 40"
          dur="60s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  );
}
