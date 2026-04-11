import type { ReactNode } from "react";

type Variant = "gold" | "rose" | "violet" | "bone";

interface BadgeProps {
  variant?: Variant;
  icon?: string;
  children: ReactNode;
  className?: string;
}

const map: Record<Variant, string> = {
  gold: "bg-[rgba(201,162,74,0.06)] text-gold",
  rose: "bg-[rgba(196,100,122,0.06)] text-rose",
  violet: "bg-[rgba(123,107,165,0.06)] text-violet",
  bone: "bg-[rgba(232,223,208,0.06)] text-bone-dim",
};

export default function Badge({ variant = "gold", icon, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`font-jetbrains text-[8px] uppercase tracking-[1.5px] px-[14px] py-[6px] inline-flex items-center gap-[6px] branded-radius corner-ornaments ${map[variant]} ${className}`}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </span>
  );
}
