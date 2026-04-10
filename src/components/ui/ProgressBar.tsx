interface ProgressBarProps {
  value: number; // 0-100
  color?: "gold" | "rose" | "violet";
  label?: string;
  className?: string;
}

const fillMap = {
  gold: "bg-gold text-gold",
  rose: "bg-rose text-rose",
  violet: "bg-violet text-violet",
} as const;

export default function ProgressBar({
  value,
  color = "gold",
  label,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Progresso: ${clamped}%`}
      className={`relative h-[2px] bg-[rgba(123,107,165,0.08)] rounded-[1px] ${className}`}
    >
      <div
        className={`h-full rounded-[1px] transition-[width] duration-300 ease-out relative ${fillMap[color]}`}
        style={{ width: `${clamped}%` }}
      >
        <span
          className="absolute -right-[3px] -top-[2px] w-[6px] h-[6px] rounded-full"
          style={{ backgroundColor: "currentColor", boxShadow: "0 0 8px currentColor" }}
        />
      </div>
    </div>
  );
}
