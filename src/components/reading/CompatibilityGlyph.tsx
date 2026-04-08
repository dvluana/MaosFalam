import type { HandElement } from "@/types/reading";

interface Props {
  pair: string;
  size?: number;
}

/**
 * Glyph pequeno pra cada par de compatibilidade. Mostra os 2 símbolos
 * alquímicos dos elementos envolvidos se tocando, com animação própria
 * do par: faísca (fogo+ar), vapor (fogo+água), etc.
 */
export default function CompatibilityGlyph({ pair, size = 76 }: Props) {
  const [a, b] = parsePair(pair);
  const kind = `${a}-${b}` as const;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 80"
      fill="none"
      aria-hidden
      style={{
        filter:
          "drop-shadow(0 0 10px rgba(201,162,74,0.4)) drop-shadow(0 0 22px rgba(201,162,74,0.18))",
      }}
    >
      <defs>
        <linearGradient id="cp-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8d49b" />
          <stop offset="60%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#6e5a28" />
        </linearGradient>
        <radialGradient id="cp-core" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(255,220,140,0.45)" />
          <stop offset="100%" stopColor="rgba(201,162,74,0)" />
        </radialGradient>
      </defs>

      {/* Left element */}
      <g transform="translate(28 40)">
        {renderSymbol(a, 16)}
      </g>

      {/* Right element */}
      <g transform="translate(92 40)">
        {renderSymbol(b, 16)}
      </g>

      {/* Reação central — varia por tipo de encontro */}
      <g transform="translate(60 40)">{renderReaction(kind)}</g>
    </svg>
  );
}

function parsePair(pair: string): [HandElement, HandElement] {
  const parts = pair.split("+").map((s) => s.trim().toLowerCase());
  const toElement = (s: string): HandElement => {
    if (s.includes("fogo")) return "fire";
    if (s.includes("água") || s.includes("agua")) return "water";
    if (s.includes("terra")) return "earth";
    if (s.includes("ar")) return "air";
    return "fire";
  };
  return [toElement(parts[0] ?? "fogo"), toElement(parts[1] ?? "fogo")];
}

function renderSymbol(el: HandElement, r: number) {
  // Triângulos alquímicos em versão compacta
  const stroke = "url(#cp-grad)";
  const strokeWidth = 1.2;
  if (el === "fire") {
    return (
      <path
        d={`M 0 ${-r} L ${r * 0.87} ${r * 0.5} L ${-r * 0.87} ${r * 0.5} Z`}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="rgba(201,162,74,0.1)"
      />
    );
  }
  if (el === "water") {
    return (
      <path
        d={`M ${-r * 0.87} ${-r * 0.5} L ${r * 0.87} ${-r * 0.5} L 0 ${r} Z`}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="rgba(139,123,191,0.12)"
      />
    );
  }
  if (el === "earth") {
    return (
      <g>
        <path
          d={`M ${-r * 0.87} ${-r * 0.5} L ${r * 0.87} ${-r * 0.5} L 0 ${r} Z`}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          fill="rgba(139,91,56,0.14)"
        />
        <line
          x1={-r * 0.6}
          y1={r * 0.15}
          x2={r * 0.6}
          y2={r * 0.15}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </g>
    );
  }
  // air
  return (
    <g>
      <path
        d={`M 0 ${-r} L ${r * 0.87} ${r * 0.5} L ${-r * 0.87} ${r * 0.5} Z`}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="rgba(232,223,208,0.1)"
      />
      <line
        x1={-r * 0.6}
        y1={-r * 0.1}
        x2={r * 0.6}
        y2={-r * 0.1}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </g>
  );
}

function renderReaction(kind: string) {
  // Halo pulsante comum
  const halo = (
    <circle cx="0" cy="0" r="10" fill="url(#cp-core)">
      <animate
        attributeName="opacity"
        values="0.4;0.9;0.4"
        dur="2.4s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="r"
        values="9;13;9"
        dur="2.4s"
        repeatCount="indefinite"
      />
    </circle>
  );

  // Faísca: fogo+ar (bolinhas saindo pros lados)
  if (kind === "fire-air" || kind === "air-fire") {
    return (
      <g>
        {halo}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="0"
            y1="-4"
            x2="0"
            y2="-9"
            stroke="#ffd27a"
            strokeWidth="1.2"
            strokeLinecap="round"
            transform={`rotate(${deg})`}
          >
            <animate
              attributeName="opacity"
              values="0.2;1;0.2"
              dur="1.6s"
              begin={`${(deg / 360) * 0.5}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}
      </g>
    );
  }

  // Vapor: fogo+água (ondulações subindo)
  if (kind === "fire-water" || kind === "water-fire") {
    return (
      <g>
        {halo}
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d="M -6 4 Q -3 -2 0 0 T 6 -4"
            stroke="rgba(220,230,255,0.8)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            transform={`translate(0 ${4 - i * 6})`}
          >
            <animate
              attributeName="transform"
              values={`translate(0 ${4 - i * 6}); translate(0 ${-8 - i * 6}); translate(0 ${4 - i * 6})`}
              dur="3s"
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0"
              dur="3s"
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
            />
          </path>
        ))}
      </g>
    );
  }

  // Fundação: fogo+terra (base sólida)
  if (kind === "fire-earth" || kind === "earth-fire") {
    return (
      <g>
        {halo}
        <rect
          x="-10"
          y="2"
          width="20"
          height="3"
          fill="rgba(139,91,56,0.6)"
          stroke="url(#cp-grad)"
          strokeWidth="0.6"
        />
        <rect
          x="-8"
          y="5"
          width="16"
          height="3"
          fill="rgba(139,91,56,0.5)"
          stroke="url(#cp-grad)"
          strokeWidth="0.5"
        />
        <rect
          x="-6"
          y="8"
          width="12"
          height="2"
          fill="rgba(139,91,56,0.4)"
          stroke="url(#cp-grad)"
          strokeWidth="0.4"
        />
      </g>
    );
  }

  // Incêndio: fogo+fogo (dois triângulos sobrepostos pulsando)
  if (kind === "fire-fire") {
    return (
      <g>
        {halo}
        <path
          d="M 0 -8 L 7 5 L -7 5 Z"
          stroke="url(#cp-grad)"
          strokeWidth="1"
          fill="rgba(239,130,40,0.4)"
          strokeLinejoin="round"
        >
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M 0 -8 L 7 5 L -7 5 Z"
          stroke="url(#cp-grad)"
          strokeWidth="0.8"
          fill="none"
          transform="rotate(60)"
        >
          <animate
            attributeName="opacity"
            values="0.4;0.9;0.4"
            dur="1.6s"
            begin="0.4s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    );
  }

  // Água + ar: chuva leve
  if (kind === "water-air" || kind === "air-water") {
    return (
      <g>
        {halo}
        {[-5, 0, 5].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1="-8"
            x2={x}
            y2="8"
            stroke="rgba(180,200,255,0.7)"
            strokeWidth="0.8"
            strokeLinecap="round"
          >
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="2s"
              begin={`${i * 0.3}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="y1"
              values="-12;-4"
              dur="2s"
              begin={`${i * 0.3}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="y2"
              values="4;12"
              dur="2s"
              begin={`${i * 0.3}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}
      </g>
    );
  }

  // Terra + água: lama / raiz crescendo
  if (kind === "earth-water" || kind === "water-earth") {
    return (
      <g>
        {halo}
        <path
          d="M -6 8 Q -4 0 0 -2 Q 4 0 6 8"
          stroke="url(#cp-grad)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="0" cy="-4" r="1.5" fill="url(#cp-grad)">
          <animate
            attributeName="r"
            values="1;2.5;1"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  }

  // Terra + ar: poeira voando
  if (kind === "earth-air" || kind === "air-earth") {
    return (
      <g>
        {halo}
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            cx={-6 + i * 4}
            cy={-2 + (i % 2) * 4}
            r="0.8"
            fill="rgba(201,155,106,0.9)"
          >
            <animate
              attributeName="cx"
              values={`${-8 + i * 4};${8 + i * 4}`}
              dur="3s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="3s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
    );
  }

  // Default: halo + ponto central
  return (
    <g>
      {halo}
      <circle cx="0" cy="0" r="2" fill="url(#cp-grad)">
        <animate
          attributeName="r"
          values="1.5;3;1.5"
          dur="2.2s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}
