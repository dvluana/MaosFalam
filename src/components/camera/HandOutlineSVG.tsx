"use client";

interface HandOutlineSVGProps {
  dominantHand: "right" | "left";
  size?: number;
  className?: string;
}

export default function HandOutlineSVG({
  dominantHand,
  size = 200,
  className = "",
}: HandOutlineSVGProps) {
  // The SVG is drawn as a RIGHT hand (thumb on viewer's left, pinky on viewer's right).
  // When dominantHand is "left", scaleX(-1) mirrors it horizontally.
  const flipStyle = dominantHand === "left" ? { transform: "scaleX(-1)" } : undefined;

  const handLabel =
    dominantHand === "right"
      ? "Guia de posicionamento da mão direita"
      : "Guia de posicionamento da mão esquerda";

  return (
    <svg
      width={size}
      height={Math.round(size * 1.4)}
      viewBox="0 0 200 280"
      fill="none"
      role="img"
      aria-label={handLabel}
      className={className}
      style={flipStyle}
    >
      {/* Wrist base */}
      <path
        d="M 60 270 Q 50 265 48 255 L 48 225 Q 60 230 100 230 Q 140 230 152 225 L 152 255 Q 150 265 140 270 Z"
        stroke="rgba(201,162,74,0.6)"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Palm body */}
      <path
        d="M 48 225 Q 46 195 46 180 L 48 165 Q 60 160 100 160 Q 140 160 152 165 L 154 180 Q 154 195 152 225"
        stroke="rgba(201,162,74,0.6)"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Thumb — leftmost, shorter and angled */}
      <path
        d="M 52 190 Q 40 185 30 175 Q 20 160 22 148 Q 24 138 34 136 Q 44 134 50 145 Q 54 155 54 165"
        stroke="rgba(201,162,74,0.6)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Index finger */}
      <path
        d="M 68 163 Q 66 140 64 115 Q 62 95 66 80 Q 70 68 78 67 Q 86 66 90 78 Q 94 90 94 110 Q 94 135 92 163"
        stroke="rgba(201,162,74,0.6)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Middle finger — tallest */}
      <path
        d="M 96 162 Q 94 138 93 110 Q 92 85 96 68 Q 100 54 108 54 Q 116 54 120 68 Q 124 82 123 108 Q 122 136 120 162"
        stroke="rgba(201,162,74,0.6)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Ring finger */}
      <path
        d="M 122 163 Q 122 140 122 114 Q 122 92 126 78 Q 130 66 138 66 Q 146 66 150 78 Q 154 90 153 114 Q 152 138 150 163"
        stroke="rgba(201,162,74,0.6)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pinky — rightmost, shortest */}
      <path
        d="M 152 168 Q 154 148 155 132 Q 156 118 160 108 Q 164 98 170 98 Q 176 98 178 108 Q 180 118 178 132 Q 176 148 174 168"
        stroke="rgba(201,162,74,0.6)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
