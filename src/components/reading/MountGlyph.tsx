import GlyphShell, { type GlyphTheme } from "./GlyphShell";

interface Props {
  name: string;
  size?: number;
}

const MOUNT_THEME: GlyphTheme = {
  id: "mount",
  stops: [
    { offset: "0%", color: "#e8d49b" },
    { offset: "60%", color: "#c9a24a" },
    { offset: "100%", color: "#6e5a28" },
  ],
  coreStops: [
    { offset: "0%", color: "rgba(201,162,74,0.28)" },
    { offset: "100%", color: "rgba(201,162,74,0)" },
  ],
  ringColor: "rgba(201,162,74,0.3)",
  innerRingColor: "rgba(201,162,74,0.12)",
  shadow: "drop-shadow(0 0 8px rgba(201,162,74,0.35))",
};

const GRAD = "url(#mount-grad)";

/**
 * Glyph pequeno pros Montes — usa o símbolo planetário correspondente.
 * Cada um com uma animação sutil própria (pulse/rotate/shimmer).
 */
export default function MountGlyph({ name, size = 64 }: Props) {
  const key = name.toLowerCase();

  return (
    <GlyphShell theme={MOUNT_THEME} size={size}>
      {pickSymbol(key)}
    </GlyphShell>
  );
}

function pickSymbol(key: string) {
  if (key.includes("júpiter") || key.includes("jupiter")) {
    return (
      <g>
        <path
          d="M28 30 L46 30 M34 30 L34 46 Q34 54 42 54 L48 54"
          stroke={GRAD}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />
        </path>
      </g>
    );
  }

  if (key.includes("saturno")) {
    return (
      <g>
        <path
          d="M32 26 L32 50 M28 30 L36 30 M32 50 Q36 58 44 52"
          stroke={GRAD}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    );
  }

  if (key.includes("apolo") || key.includes("apollo") || key.includes("sol")) {
    return (
      <g>
        <circle cx="40" cy="40" r="8" stroke={GRAD} strokeWidth="1.8" fill="none" />
        <circle cx="40" cy="40" r="1.8" fill={GRAD}>
          <animate attributeName="r" values="1.5;2.4;1.5" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  }

  if (key.includes("mercúrio") || key.includes("mercurio")) {
    return (
      <g>
        <path
          d="M35 22 Q40 26 45 22"
          stroke={GRAD}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="40" cy="34" r="6" stroke={GRAD} strokeWidth="1.8" fill="none" />
        <path
          d="M40 40 L40 54 M34 48 L46 48"
          stroke={GRAD}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  if (key.includes("vênus") || key.includes("venus")) {
    return (
      <g>
        <circle cx="40" cy="34" r="8" stroke={GRAD} strokeWidth="1.8" fill="none" />
        <path
          d="M40 42 L40 56 M34 50 L46 50"
          stroke={GRAD}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  if (key.includes("lua") || key.includes("luna")) {
    return (
      <path d="M46 26 A18 18 0 1 0 46 54 A13 14 0 1 1 46 26 Z" fill={GRAD} opacity="0.9">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
      </path>
    );
  }

  if (key.includes("marte") || key.includes("mars")) {
    return (
      <g>
        <circle cx="38" cy="42" r="8" stroke={GRAD} strokeWidth="1.8" fill="none" />
        <path
          d="M44 36 L54 26 M48 26 L54 26 L54 32"
          stroke={GRAD}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    );
  }

  return (
    <g>
      <path d="M40 28 L52 40 L40 52 L28 40 Z" stroke={GRAD} strokeWidth="1.6" fill="none">
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
