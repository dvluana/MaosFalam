"use client";

interface ToggleButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}

export default function ToggleButton({
  selected,
  onClick,
  children,
  ariaLabel,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className="flex-1 py-3 font-raleway text-[10px] uppercase tracking-[0.06em] transition-all duration-300"
      style={{
        background: selected ? "linear-gradient(160deg, #1e1838, #2a2150, #1e1838)" : "transparent",
        color: selected ? "#E8DFD0" : "#9b9284",
        border: selected ? "1px solid rgba(201,162,74,0.2)" : "1px solid rgba(201,162,74,0.08)",
        borderRadius: "0 6px 0 6px",
      }}
    >
      {children}
    </button>
  );
}
