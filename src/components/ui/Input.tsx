"use client";

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...rest }: InputProps) {
  return (
    <div className="w-full">
      <label className="block font-cormorant italic text-[14px] tracking-[0.02em] text-bone-dim mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          {...rest}
          className={`w-full bg-[#171222] text-bone font-raleway text-[15px] py-3 px-4 outline-none transition-all duration-300 placeholder:font-cormorant placeholder:italic placeholder:text-bone-dim/40 placeholder:text-[14px] focus:ring-1 focus:ring-gold/30 ${className}`}
          style={{
            border: "1px solid rgba(123,107,165,0.18)",
            borderRadius: "0 6px 0 6px",
          }}
        />
      </div>
      {error && (
        <p
          className="font-jetbrains text-[11px] tracking-[0.5px] text-rose mt-2"
          style={{ fontWeight: 500 }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
