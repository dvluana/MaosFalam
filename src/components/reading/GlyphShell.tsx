import type { ReactNode } from "react";

interface GradientStop {
  offset: string;
  color: string;
}

export interface GlyphTheme {
  /** Id base usado pros gradients deste shell. Precisa ser estável e único por variante. */
  id: string;
  /** Stops do linearGradient principal (usado pelo símbolo via `url(#<id>-grad)`). */
  stops: GradientStop[];
  /** Stops do radialGradient central (glow pulsante). */
  coreStops: GradientStop[];
  /** Cor do anel externo tracejado. */
  ringColor: string;
  /** Cor do anel interno. Se omitido, usa ringColor. */
  innerRingColor?: string;
  /** drop-shadow filter aplicado no SVG. */
  shadow: string;
}

interface Props {
  theme: GlyphTheme;
  size?: number;
  /** Raio do glow central. Default 32. */
  glowRadius?: number;
  /** Raio do anel externo tracejado que gira. Default 34. */
  outerRingRadius?: number;
  /** Raio do anel interno estático. Default 28. */
  innerRingRadius?: number;
  /** Duração da rotação do anel externo. Default 40s. */
  ringRotationDur?: string;
  /** strokeDasharray do anel externo. Default "2 3". */
  outerDashArray?: string;
  /** Se definido, o anel interno também gira (contra-rotação) nesta duração. */
  innerRotationDur?: string;
  /** Duração do pulse do glow. Default 3.5s. */
  glowPulseDur?: string;
  /** Se true, o glow central também tem a opacidade animada numa faixa maior (rare signs). */
  strongGlow?: boolean;
  /** Strokeopacity do anel interno. */
  innerRingOpacity?: number;
  /** Símbolo central específico do glyph. Recebe `url(#<id>-grad)` via closure. */
  children: ReactNode;
}

/**
 * Shell compartilhado dos glyphs circulares (Line, Mount, RareSign).
 *
 * Renderiza:
 *  - defs com linear + radial gradient a partir do theme
 *  - glow central pulsante
 *  - anel externo tracejado girando
 *  - anel interno estático
 *  - símbolo específico (children) no centro
 *
 * O consumidor usa `url(#${theme.id}-grad)` pra pintar traços do símbolo.
 */
export default function GlyphShell({
  theme,
  size = 64,
  glowRadius = 32,
  outerRingRadius = 34,
  innerRingRadius = 28,
  ringRotationDur = "40s",
  outerDashArray = "2 3",
  innerRotationDur,
  glowPulseDur = "3.5s",
  strongGlow = false,
  innerRingOpacity,
  children,
}: Props) {
  const gradId = `${theme.id}-grad`;
  const coreId = `${theme.id}-core`;

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
        <linearGradient id={gradId} x1="50%" y1="0%" x2="50%" y2="100%">
          {theme.stops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          {theme.coreStops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </radialGradient>
      </defs>

      {/* Glow central pulsante */}
      <circle cx="40" cy="40" r={glowRadius} fill={`url(#${coreId})`}>
        <animate
          attributeName="opacity"
          values={strongGlow ? "0.6;1;0.6" : "0.7;1;0.7"}
          dur={glowPulseDur}
          repeatCount="indefinite"
        />
      </circle>

      {/* Anel externo tracejado girando */}
      <circle
        cx="40"
        cy="40"
        r={outerRingRadius}
        stroke={theme.ringColor}
        strokeWidth="0.5"
        strokeDasharray={outerDashArray}
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 40 40"
          to="360 40 40"
          dur={ringRotationDur}
          repeatCount="indefinite"
        />
      </circle>

      {/* Anel interno (estático ou contra-rotação) */}
      <circle
        cx="40"
        cy="40"
        r={innerRingRadius}
        stroke={theme.innerRingColor ?? theme.ringColor}
        strokeOpacity={innerRingOpacity}
        strokeWidth="0.4"
        fill="none"
      >
        {innerRotationDur && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 40 40"
            to="0 40 40"
            dur={innerRotationDur}
            repeatCount="indefinite"
          />
        )}
      </circle>

      {children}
    </svg>
  );
}
