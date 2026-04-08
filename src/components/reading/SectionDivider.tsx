interface Props {
  number: string;
  label: string;
  accent?: "rose" | "violet" | "gold" | "bone";
}

const ACCENT_COLOR: Record<NonNullable<Props["accent"]>, string> = {
  rose: "#c4647a",
  violet: "#7b6ba5",
  gold: "#c9a24a",
  bone: "#e8dfd0",
};

/**
 * Divisor de seção: linha esquerda · número+label · linha direita.
 * Ex: ────── 01 · Como você ama ──────
 */
export default function SectionDivider({
  number,
  label,
  accent = "gold",
}: Props) {
  const color = ACCENT_COLOR[accent];
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <span
        aria-hidden
        className="block w-1 h-1 rotate-45 bg-[rgba(201,162,74,0.6)]"
      />
      <span className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-[rgba(201,162,74,0.5)] to-[rgba(201,162,74,0.5)]" />
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span
          className="font-mono text-[8px] uppercase tracking-[2px] text-[rgba(122,104,50,0.9)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {number}
        </span>
        <span className="text-[rgba(201,162,74,0.8)] text-xs">·</span>
        <span
          className="font-title text-[13px] uppercase tracking-[0.08em]"
          style={{ color, fontFamily: "var(--font-title)" }}
        >
          {label}
        </span>
      </div>
      <span className="flex-1 max-w-[120px] h-px bg-gradient-to-l from-transparent via-[rgba(201,162,74,0.5)] to-[rgba(201,162,74,0.5)]" />
      <span
        aria-hidden
        className="block w-1 h-1 rotate-45 bg-[rgba(201,162,74,0.6)]"
      />
    </div>
  );
}
