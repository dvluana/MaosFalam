interface SeparatorProps {
  variant?: "thin" | "gold" | "rose" | "ornamental";
  className?: string;
}

export default function Separator({ variant = "thin", className = "" }: SeparatorProps) {
  if (variant === "ornamental") {
    return (
      <div className={`flex items-center gap-2 justify-center ${className}`}>
        <span className="flex-1 max-w-20 h-px bg-gradient-to-r from-transparent to-[rgba(122,104,50,0.6)]" />
        <span aria-hidden className="w-1 h-1 bg-gold rotate-45" />
        <span className="flex-1 max-w-20 h-px bg-gradient-to-l from-transparent to-[rgba(122,104,50,0.6)]" />
      </div>
    );
  }
  const map = {
    thin: "bg-[rgba(201,162,74,0.04)]",
    gold: "bg-gradient-to-r from-transparent via-[rgba(201,162,74,0.12)] to-transparent",
    rose: "bg-gradient-to-r from-transparent via-[rgba(196,100,122,0.15)] to-transparent",
  } as const;
  return <div className={`h-px ${map[variant]} ${className}`} />;
}
