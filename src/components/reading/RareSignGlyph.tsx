interface Props {
  name: string;
  size?: number;
}

/**
 * Glyph pequeno pros Sinais Raros — ilustração única por tipo de sinal.
 * Sinais raros ganham destaque maior (glow gold) porque são, bem, raros.
 */
export default function RareSignGlyph({ name, size = 72 }: Props) {
  const key = name.toLowerCase();
  const sign = pickSign(key);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden
      style={{
        filter:
          "drop-shadow(0 0 10px rgba(201,162,74,0.55)) drop-shadow(0 0 20px rgba(201,162,74,0.25))",
      }}
    >
      <defs>
        <linearGradient id="rare-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ffe79a" />
          <stop offset="50%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#6e5a28" />
        </linearGradient>
        <radialGradient id="rare-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,220,140,0.45)" />
          <stop offset="100%" stopColor="rgba(201,162,74,0)" />
        </radialGradient>
      </defs>

      {/* Glow central mais forte que mounts */}
      <circle cx="40" cy="40" r="34" fill="url(#rare-core)">
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Anéis duplos */}
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="rgba(201,162,74,0.32)"
        strokeWidth="0.5"
        strokeDasharray="1 2"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 40 40"
          to="360 40 40"
          dur="32s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="40"
        cy="40"
        r="30"
        stroke="rgba(201,162,74,0.14)"
        strokeWidth="0.4"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="360 40 40"
          to="0 40 40"
          dur="60s"
          repeatCount="indefinite"
        />
      </circle>

      {sign}
    </svg>
  );
}

function pickSign(key: string) {
  // ESTRELA (em Júpiter, Apolo, etc.)
  if (key.includes("estrela") || key.includes("star")) {
    return (
      <g>
        <path
          d="M40 22 L43.5 36 L58 37 L47 46 L51 60 L40 52 L29 60 L33 46 L22 37 L36.5 36 Z"
          fill="url(#rare-grad)"
          stroke="url(#rare-grad)"
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
        {/* twinkle */}
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
          stroke="url(#rare-grad)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* little adornments at tips */}
        <circle cx="40" cy="22" r="1.3" fill="url(#rare-grad)" />
        <circle cx="40" cy="58" r="1.3" fill="url(#rare-grad)" />
        <circle cx="22" cy="40" r="1.3" fill="url(#rare-grad)" />
        <circle cx="58" cy="40" r="1.3" fill="url(#rare-grad)" />
        {/* diamond center pulsante */}
        <path
          d="M40 36 L44 40 L40 44 L36 40 Z"
          fill="url(#rare-grad)"
        >
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
          stroke="url(#rare-grad)"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Linha diagonal atravessando (protetora) */}
        <path
          d="M24 40 L56 40"
          stroke="url(#rare-grad)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Cantos brilhantes */}
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
  if (key.includes("salomão") || key.includes("salomao") || key.includes("anel")) {
    return (
      <g>
        <circle
          cx="40"
          cy="40"
          r="16"
          stroke="url(#rare-grad)"
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="40"
          cy="40"
          r="10"
          stroke="url(#rare-grad)"
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
          stroke="url(#rare-grad)"
          strokeWidth="2"
          fill="rgba(201,162,74,0.2)"
        />
        {/* raios */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="40"
            y1="22"
            x2="40"
            y2="28"
            stroke="url(#rare-grad)"
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

  // LINHA DE INTUIÇÃO / CINTO DE VÊNUS / TRIÂNGULO
  if (key.includes("intuição") || key.includes("intuicao")) {
    return (
      <g>
        <path
          d="M24 54 Q40 22 56 54"
          stroke="url(#rare-grad)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="40" cy="30" r="2" fill="url(#rare-grad)">
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

  if (key.includes("triângulo") || key.includes("triangulo")) {
    return (
      <g>
        <path
          d="M40 22 L58 54 L22 54 Z"
          stroke="url(#rare-grad)"
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

  // Default: estrela simples de 4 pontas (ornament)
  return (
    <g>
      <path
        d="M40 22 L44 36 L58 40 L44 44 L40 58 L36 44 L22 40 L36 36 Z"
        fill="url(#rare-grad)"
        stroke="url(#rare-grad)"
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
