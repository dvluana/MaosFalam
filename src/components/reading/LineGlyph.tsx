import type { LineName } from "@/types/reading";

interface Props {
  line: LineName;
  size?: number;
}

interface LineTheme {
  gradId: string;
  coreId: string;
  stops: Array<{ offset: string; color: string }>;
  coreStops: Array<{ offset: string; color: string }>;
  ringColor: string;
  shadow: string;
}

const THEMES: Record<LineName, LineTheme> = {
  heart: {
    gradId: "line-grad-heart",
    coreId: "line-core-heart",
    stops: [
      { offset: "0%", color: "#e9a0b4" },
      { offset: "60%", color: "#c4647a" },
      { offset: "100%", color: "#6e2a3a" },
    ],
    coreStops: [
      { offset: "0%", color: "rgba(196,100,122,0.32)" },
      { offset: "100%", color: "rgba(196,100,122,0)" },
    ],
    ringColor: "rgba(196,100,122,0.32)",
    shadow: "drop-shadow(0 0 8px rgba(196,100,122,0.4))",
  },
  head: {
    gradId: "line-grad-head",
    coreId: "line-core-head",
    stops: [
      { offset: "0%", color: "#b6a8d8" },
      { offset: "60%", color: "#7b6ba5" },
      { offset: "100%", color: "#3a325c" },
    ],
    coreStops: [
      { offset: "0%", color: "rgba(123,107,165,0.32)" },
      { offset: "100%", color: "rgba(123,107,165,0)" },
    ],
    ringColor: "rgba(123,107,165,0.32)",
    shadow: "drop-shadow(0 0 8px rgba(123,107,165,0.4))",
  },
  life: {
    gradId: "line-grad-life",
    coreId: "line-core-life",
    stops: [
      { offset: "0%", color: "#e8d49b" },
      { offset: "60%", color: "#c9a24a" },
      { offset: "100%", color: "#6e5a28" },
    ],
    coreStops: [
      { offset: "0%", color: "rgba(201,162,74,0.32)" },
      { offset: "100%", color: "rgba(201,162,74,0)" },
    ],
    ringColor: "rgba(201,162,74,0.32)",
    shadow: "drop-shadow(0 0 8px rgba(201,162,74,0.4))",
  },
  fate: {
    gradId: "line-grad-fate",
    coreId: "line-core-fate",
    stops: [
      { offset: "0%", color: "#f4ecd8" },
      { offset: "60%", color: "#e8dfd0" },
      { offset: "100%", color: "#7a7260" },
    ],
    coreStops: [
      { offset: "0%", color: "rgba(232,223,208,0.3)" },
      { offset: "100%", color: "rgba(232,223,208,0)" },
    ],
    ringColor: "rgba(232,223,208,0.3)",
    shadow: "drop-shadow(0 0 8px rgba(232,223,208,0.35))",
  },
};

/**
 * Glyph pras 4 linhas da mão. Segue mesma estrutura do MountGlyph:
 * glow central pulsante + anel tracejado girando + símbolo único por linha.
 */
export default function LineGlyph({ line, size = 64 }: Props) {
  const theme = THEMES[line];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden
      style={{ filter: theme.shadow }}
    >
      <defs>
        <linearGradient id={theme.gradId} x1="50%" y1="0%" x2="50%" y2="100%">
          {theme.stops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
        <radialGradient id={theme.coreId} cx="50%" cy="50%" r="50%">
          {theme.coreStops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </radialGradient>
      </defs>

      {/* Glow central pulsante */}
      <circle cx="40" cy="40" r="32" fill={`url(#${theme.coreId})`}>
        <animate
          attributeName="opacity"
          values="0.7;1;0.7"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Anel externo tracejado girando */}
      <circle
        cx="40"
        cy="40"
        r="34"
        stroke={theme.ringColor}
        strokeWidth="0.5"
        strokeDasharray="2 3"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 40 40"
          to="360 40 40"
          dur="40s"
          repeatCount="indefinite"
        />
      </circle>
      {/* Anel interno estático */}
      <circle
        cx="40"
        cy="40"
        r="28"
        stroke={theme.ringColor}
        strokeOpacity="0.4"
        strokeWidth="0.4"
        fill="none"
      />

      {pickSymbol(line, theme.gradId)}
    </svg>
  );
}

function pickSymbol(line: LineName, gradId: string) {
  const stroke = `url(#${gradId})`;

  if (line === "heart") {
    // Coração SVG custom com batimento
    return (
      <g>
        <path
          d="M40 52 C28 44 24 36 28 30 C31 26 37 27 40 32 C43 27 49 26 52 30 C56 36 52 44 40 52 Z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        >
          <animateTransform
            attributeName="transform"
            type="scale"
            additive="sum"
            values="1;1.08;1;1.04;1"
            dur="1.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.85;1;0.85"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    );
  }

  if (line === "head") {
    // Espiral/vórtice girando
    return (
      <g>
        <path
          d="M40 40 m-12 0 a12 12 0 1 1 24 0 a9 9 0 1 1 -18 0 a6 6 0 1 1 12 0 a3 3 0 1 1 -6 0"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 40 40"
            to="360 40 40"
            dur="18s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="40" cy="40" r="1.4" fill={stroke}>
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  }

  if (line === "life") {
    // Árvore: tronco + 3 galhos
    return (
      <g>
        <g>
          <path
            d="M40 56 L40 32"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M40 40 L32 32 M40 36 L48 28 M40 44 L34 40"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="32" cy="32" r="1.2" fill={stroke} />
          <circle cx="48" cy="28" r="1.2" fill={stroke} />
          <circle cx="40" cy="30" r="1.4" fill={stroke} />
          <animateTransform
            attributeName="transform"
            type="scale"
            additive="sum"
            values="0.95;1;0.95"
            dur="4s"
            repeatCount="indefinite"
          />
        </g>
      </g>
    );
  }

  // fate: seta vertical ascendente com ponta em losango
  return (
    <g>
      <g>
        <path
          d="M40 56 L40 32"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M40 24 L46 32 L40 30 L34 32 Z"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill={stroke}
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 2;0 -2;0 2"
          dur="3.2s"
          repeatCount="indefinite"
        />
      </g>
    </g>
  );
}
