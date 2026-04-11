import type { HandElement } from "@/types/report";

interface Props {
  type: HandElement;
  width?: number;
  height?: number;
}

/**
 * Camada de atmosfera do elemento. Fica absolute position atrás do
 * nome do elemento no hero. Efeito animado SVG puro, não caricato:
 *  - Fogo: brasas subindo + heat shimmer gradient
 *  - Água: ondas horizontais + bolhas subindo
 *  - Terra: poeira derivando + sedimentação
 *  - Ar: linhas de vento passando + redemoinho sutil
 */
export default function ElementAtmosphere({ type, width = 560, height = 280 }: Props) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="pointer-events-none absolute inset-0"
    >
      {type === "fire" && <FireAtmosphere width={width} height={height} />}
      {type === "water" && <WaterAtmosphere width={width} height={height} />}
      {type === "earth" && <EarthAtmosphere width={width} height={height} />}
      {type === "air" && <AirAtmosphere width={width} height={height} />}
    </svg>
  );
}

function FireAtmosphere({ width, height }: { width: number; height: number }) {
  // Brasas subindo — menos densas, distribuídas
  const embers = [
    { x: 0.18, size: 0.9, dur: 5.2, delay: 0, hue: "#ffd27a" },
    { x: 0.32, size: 1.1, dur: 4.6, delay: 1.5, hue: "#ffb248" },
    { x: 0.46, size: 0.7, dur: 5.8, delay: 0.8, hue: "#ffe79a" },
    { x: 0.58, size: 1.0, dur: 4.8, delay: 2.2, hue: "#ffd27a" },
    { x: 0.7, size: 0.85, dur: 5.4, delay: 0.4, hue: "#ffb248" },
    { x: 0.84, size: 0.95, dur: 5.0, delay: 1.8, hue: "#ffe79a" },
  ];

  return (
    <g>
      <defs>
        <radialGradient id="fire-heat" cx="50%" cy="60%" r="45%">
          <stop offset="0%" stopColor="rgba(239,130,40,0.1)" />
          <stop offset="55%" stopColor="rgba(201,100,20,0.04)" />
          <stop offset="100%" stopColor="rgba(80,20,10,0)" />
        </radialGradient>
      </defs>

      {/* Heat glow atrás do texto, bem sutil */}
      <rect x="0" y="0" width={width} height={height} fill="url(#fire-heat)" />

      {/* Brasas subindo */}
      {embers.map((e, i) => (
        <circle key={i} cx={width * e.x} cy={height - 10} r={e.size} fill={e.hue}>
          <animate
            attributeName="cy"
            values={`${height - 5};${height * 0.1}`}
            dur={`${e.dur}s`}
            begin={`${e.delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.1;0.7;1"
            dur={`${e.dur}s`}
            begin={`${e.delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cx"
            values={`${width * e.x};${width * (e.x + (i % 2 === 0 ? 0.015 : -0.015))};${width * e.x}`}
            dur={`${e.dur}s`}
            begin={`${e.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
}

function WaterAtmosphere({ width, height }: { width: number; height: number }) {
  const bubbles = [
    { x: 0.15, size: 1.2, dur: 6, delay: 0 },
    { x: 0.28, size: 0.8, dur: 7, delay: 1.5 },
    { x: 0.42, size: 1.5, dur: 5.5, delay: 3 },
    { x: 0.55, size: 1, dur: 6.5, delay: 0.8 },
    { x: 0.68, size: 0.9, dur: 7, delay: 2.2 },
    { x: 0.78, size: 1.3, dur: 5.8, delay: 1.2 },
    { x: 0.88, size: 0.85, dur: 6.8, delay: 3.3 },
  ];

  return (
    <g>
      <defs>
        <linearGradient id="water-depth" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="rgba(139,123,191,0.04)" />
          <stop offset="100%" stopColor="rgba(42,31,74,0.2)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={width} height={height} fill="url(#water-depth)" />

      {/* Ondas horizontais */}
      {[0.35, 0.5, 0.65, 0.8].map((y, i) => (
        <path
          key={i}
          d={`M 0 ${height * y} Q ${width * 0.25} ${height * y - 8} ${width * 0.5} ${height * y} T ${width} ${height * y}`}
          stroke="rgba(139,123,191,0.4)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            values={`M 0 ${height * y} Q ${width * 0.25} ${height * y - 8} ${width * 0.5} ${height * y} T ${width} ${height * y};M 0 ${height * y} Q ${width * 0.25} ${height * y + 8} ${width * 0.5} ${height * y} T ${width} ${height * y};M 0 ${height * y} Q ${width * 0.25} ${height * y - 8} ${width * 0.5} ${height * y} T ${width} ${height * y}`}
            dur={`${4 + i * 0.7}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.25;0.55;0.25"
            dur={`${4 + i * 0.7}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}

      {/* Bolhas subindo */}
      {bubbles.map((b, i) => (
        <circle
          key={i}
          cx={width * b.x}
          cy={height}
          r={b.size}
          fill="none"
          stroke="rgba(220,230,255,0.7)"
          strokeWidth="0.6"
        >
          <animate
            attributeName="cy"
            values={`${height};${height * 0.1}`}
            dur={`${b.dur}s`}
            begin={`${b.delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0.8;0"
            dur={`${b.dur}s`}
            begin={`${b.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
}

function EarthAtmosphere({ width, height }: { width: number; height: number }) {
  const dust = Array.from({ length: 14 }, (_, i) => ({
    x: (i * 0.07 + 0.05) % 1,
    y: 0.3 + ((i * 0.11) % 0.6),
    size: 0.5 + ((i * 0.13) % 0.8),
    dur: 8 + (i % 5),
    delay: (i * 0.7) % 4,
  }));

  return (
    <g>
      <defs>
        <linearGradient id="earth-base" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="rgba(139,91,56,0.2)" />
          <stop offset="100%" stopColor="rgba(58,33,22,0)" />
        </linearGradient>
      </defs>

      <rect x="0" y={height * 0.5} width={width} height={height * 0.5} fill="url(#earth-base)" />

      {/* Sedimentação horizontal */}
      {[0.6, 0.72, 0.84].map((y, i) => (
        <line
          key={i}
          x1="0"
          y1={height * y}
          x2={width}
          y2={height * y}
          stroke="rgba(201,155,106,0.15)"
          strokeWidth="0.5"
          strokeDasharray="3 6"
          opacity={0.8 - i * 0.2}
        />
      ))}

      {/* Poeira derivando */}
      {dust.map((d, i) => (
        <circle key={i} cx={width * d.x} cy={height * d.y} r={d.size} fill="rgba(201,155,106,0.85)">
          <animate
            attributeName="cx"
            values={`${width * d.x};${width * (d.x + 0.04)};${width * d.x}`}
            dur={`${d.dur}s`}
            begin={`${d.delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values={`${height * d.y};${height * (d.y - 0.03)};${height * d.y}`}
            dur={`${d.dur}s`}
            begin={`${d.delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0.8;0"
            dur={`${d.dur}s`}
            begin={`${d.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
}

function AirAtmosphere({ width, height }: { width: number; height: number }) {
  return (
    <g>
      <defs>
        <linearGradient id="air-gl" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="rgba(244,236,216,0)" />
          <stop offset="50%" stopColor="rgba(244,236,216,0.4)" />
          <stop offset="100%" stopColor="rgba(244,236,216,0)" />
        </linearGradient>
      </defs>

      {/* Linhas de vento horizontais */}
      {[0.2, 0.32, 0.46, 0.58, 0.7, 0.82].map((y, i) => (
        <path
          key={i}
          d={`M 0 ${height * y} Q ${width * 0.3} ${height * y - 6} ${width * 0.55} ${height * y} T ${width} ${height * y}`}
          stroke="url(#air-gl)"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            values={`M 0 ${height * y} Q ${width * 0.3} ${height * y - 6} ${width * 0.55} ${height * y} T ${width} ${height * y};M 0 ${height * y} Q ${width * 0.3} ${height * y + 6} ${width * 0.55} ${height * y} T ${width} ${height * y};M 0 ${height * y} Q ${width * 0.3} ${height * y - 6} ${width * 0.55} ${height * y} T ${width} ${height * y}`}
            dur={`${4 + i * 0.6}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.6;0.2"
            dur={`${4 + i * 0.6}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}

      {/* Partículas cruzando */}
      {[0.25, 0.4, 0.55, 0.7, 0.85].map((y, i) => (
        <circle key={i} cx="0" cy={height * y} r="0.8" fill="rgba(244,236,216,0.9)">
          <animate
            attributeName="cx"
            values={`-20;${width + 20}`}
            dur={`${6 + i * 0.8}s`}
            begin={`${i * 1.2}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur={`${6 + i * 0.8}s`}
            begin={`${i * 1.2}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
}
