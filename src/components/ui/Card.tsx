import type { ReactNode } from "react";

type Accent = "gold" | "rose" | "violet" | "bone";

interface CardProps {
  accentColor?: Accent;
  parchment?: boolean;
  children: ReactNode;
  className?: string;
}

const accentMap: Record<Accent, string> = {
  gold: "bg-gradient-to-r from-transparent via-gold to-transparent",
  rose: "bg-gradient-to-r from-transparent via-rose to-transparent",
  violet: "bg-gradient-to-r from-transparent via-violet to-transparent",
  bone: "bg-gradient-to-r from-transparent via-bone to-transparent",
};

export default function Card({
  accentColor,
  parchment = false,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`relative branded-radius corner-ornaments grain-texture overflow-hidden ${parchment ? "bg-parchment" : "bg-deep"} ${className}`}
    >
      {accentColor && (
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentMap[accentColor]}`} />
      )}
      <div className="m-[5px] p-5 border border-[rgba(201,162,74,0.04)]">{children}</div>
    </div>
  );
}
