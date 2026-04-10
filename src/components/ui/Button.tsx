"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "icon";
type Size = "sm" | "default" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const sizeMap: Record<Size, string> = {
  sm: "px-7 py-3 text-[9px]",
  default: "px-10 py-4 text-[10px]",
  lg: "px-[52px] py-5 text-[11px]",
};

const base =
  "font-raleway uppercase tracking-[0.06em] inline-flex items-center justify-center gap-2 transition-[box-shadow,color] duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] branded-radius corner-ornaments disabled:opacity-20 disabled:pointer-events-none cursor-pointer active:scale-[0.97] active:transition-transform active:duration-150";

const variantClass: Record<Variant, string> = {
  primary:
    "text-bone border-0 shadow-[inset_0_1px_0_rgba(232,223,208,0.08),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_0_1px_rgba(201,162,74,0.28),0_2px_0_rgba(0,0,0,0.4),0_12px_28px_-8px_rgba(123,107,165,0.35),0_0_40px_rgba(123,107,165,0.15)] hover:shadow-[inset_0_1px_0_rgba(232,223,208,0.12),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_0_1px_rgba(201,162,74,0.45),0_2px_0_rgba(0,0,0,0.4),0_16px_34px_-8px_rgba(123,107,165,0.5),0_0_56px_rgba(123,107,165,0.22)] hover:text-gold-light",
  secondary:
    "text-bone border border-[rgba(201,162,74,0.22)] bg-[rgba(23,18,34,0.85)] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6),0_0_18px_rgba(123,107,165,0.08)] hover:bg-[rgba(30,24,48,0.95)] hover:border-[rgba(201,162,74,0.4)]",
  ghost: "bg-transparent border-0 text-bone-dim hover:text-gold shadow-none",
  icon: "",
};

export default function Button({
  variant = "primary",
  size = "default",
  children,
  className = "",
  style,
  ...rest
}: ButtonProps) {
  if (variant === "icon") {
    return (
      <button
        {...rest}
        className={`w-11 h-11 flex items-center justify-center bg-transparent text-bone border border-[rgba(201,162,74,0.08)] branded-radius corner-ornaments transition-[box-shadow,color] duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:bg-[rgba(123,107,165,0.06)] active:scale-[0.97] active:transition-transform active:duration-150 ${className}`}
      >
        {children}
      </button>
    );
  }
  const primaryStyle =
    variant === "primary"
      ? {
          background: "linear-gradient(165deg, #2c2250 0%, #3a2a68 45%, #2a1f4a 100%)",
        }
      : undefined;
  return (
    <button
      {...rest}
      style={{ ...primaryStyle, ...style }}
      className={`${base} ${sizeMap[size]} ${variantClass[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
