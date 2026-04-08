interface Props {
  name: string;
  size?: number;
}

/**
 * Glyph pequeno pros Montes — usa o símbolo planetário correspondente.
 * Cada um com uma animação sutil própria (pulse/rotate/shimmer).
 */
export default function MountGlyph({ name, size = 64 }: Props) {
  const key = name.toLowerCase();

  const symbol = pickSymbol(key);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden
      style={{
        filter: "drop-shadow(0 0 8px rgba(201,162,74,0.35))",
      }}
    >
      <defs>
        <linearGradient id="mount-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#e8d49b" />
          <stop offset="60%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#6e5a28" />
        </linearGradient>
        <radialGradient id="mount-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(201,162,74,0.28)" />
          <stop offset="100%" stopColor="rgba(201,162,74,0)" />
        </radialGradient>
      </defs>

      {/* Glow central pulsante */}
      <circle cx="40" cy="40" r="32" fill="url(#mount-core)">
        <animate
          attributeName="opacity"
          values="0.7;1;0.7"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Anel externo tracejado girando */}
      <g>
        <circle
          cx="40"
          cy="40"
          r="34"
          stroke="rgba(201,162,74,0.3)"
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
        <circle
          cx="40"
          cy="40"
          r="28"
          stroke="rgba(201,162,74,0.12)"
          strokeWidth="0.4"
          fill="none"
        />
      </g>

      {/* Símbolo central */}
      {symbol}
    </svg>
  );
}

function pickSymbol(key: string) {
  if (key.includes("júpiter") || key.includes("jupiter")) {
    // ♃ — estilizado
    return (
      <g>
        <path
          d="M28 30 L46 30 M34 30 L34 46 Q34 54 42 54 L48 54"
          stroke="url(#mount-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <animate
            attributeName="opacity"
            values="0.8;1;0.8"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    );
  }

  if (key.includes("saturno")) {
    // ♄ — foice
    return (
      <g>
        <path
          d="M32 26 L32 50 M28 30 L36 30 M32 50 Q36 58 44 52"
          stroke="url(#mount-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    );
  }

  if (
    key.includes("apolo") ||
    key.includes("apollo") ||
    key.includes("sol")
  ) {
    // ☉ — sol
    return (
      <g>
        <circle
          cx="40"
          cy="40"
          r="8"
          stroke="url(#mount-grad)"
          strokeWidth="1.8"
          fill="none"
        />
        <circle cx="40" cy="40" r="1.8" fill="url(#mount-grad)">
          <animate
            attributeName="r"
            values="1.5;2.4;1.5"
            dur="2.8s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  }

  if (key.includes("mercúrio") || key.includes("mercurio")) {
    // ☿ — mercúrio
    return (
      <g>
        <path
          d="M35 22 Q40 26 45 22"
          stroke="url(#mount-grad)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <circle
          cx="40"
          cy="34"
          r="6"
          stroke="url(#mount-grad)"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M40 40 L40 54 M34 48 L46 48"
          stroke="url(#mount-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  if (key.includes("vênus") || key.includes("venus")) {
    // ♀ — vênus
    return (
      <g>
        <circle
          cx="40"
          cy="34"
          r="8"
          stroke="url(#mount-grad)"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M40 42 L40 56 M34 50 L46 50"
          stroke="url(#mount-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  if (key.includes("lua") || key.includes("luna")) {
    // ☽ — crescente
    return (
      <path
        d="M46 26 A18 18 0 1 0 46 54 A13 14 0 1 1 46 26 Z"
        fill="url(#mount-grad)"
        opacity="0.9"
      >
        <animate
          attributeName="opacity"
          values="0.7;1;0.7"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
    );
  }

  if (key.includes("marte") || key.includes("mars")) {
    // ♂ — marte
    return (
      <g>
        <circle
          cx="38"
          cy="42"
          r="8"
          stroke="url(#mount-grad)"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M44 36 L54 26 M48 26 L54 26 L54 32"
          stroke="url(#mount-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    );
  }

  // Default: losango ornamental
  return (
    <g>
      <path
        d="M40 28 L52 40 L40 52 L28 40 Z"
        stroke="url(#mount-grad)"
        strokeWidth="1.6"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 40 40"
          to="360 40 40"
          dur="30s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  );
}
