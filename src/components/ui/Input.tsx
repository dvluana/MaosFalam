"use client";

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...rest }: InputProps) {
  return (
    <div className="w-full">
      <label className="block font-raleway text-[13px] tracking-[0.02em] text-bone mb-2">
        {label}
      </label>
      <div className="relative group">
        {/* Corner ornaments */}
        <span
          aria-hidden
          className="absolute top-[-1px] left-[-1px] w-2 h-2 transition-all duration-300 group-focus-within:w-3 group-focus-within:h-3 pointer-events-none"
          style={{
            borderTop: "1px solid rgba(201,162,74,0.2)",
            borderLeft: "1px solid rgba(201,162,74,0.2)",
          }}
        />
        <span
          aria-hidden
          className="absolute bottom-[-1px] right-[-1px] w-2 h-2 transition-all duration-300 group-focus-within:w-3 group-focus-within:h-3 pointer-events-none"
          style={{
            borderBottom: "1px solid rgba(201,162,74,0.2)",
            borderRight: "1px solid rgba(201,162,74,0.2)",
          }}
        />
        <input
          {...rest}
          className={`w-full text-bone font-raleway text-[15px] py-3 px-4 outline-none transition-all duration-300 placeholder:font-raleway placeholder:text-bone-dim/40 placeholder:text-[14px] focus:ring-0 ${className}`}
          style={{
            background: "linear-gradient(160deg, #110c1a, #171222, #110c1a)",
            border: "1px solid rgba(201,162,74,0.1)",
            borderRadius: "0 6px 0 6px",
            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.3)",
          }}
        />
        {/* Focus accent line — gold gradient at bottom */}
        <span
          aria-hidden
          className="absolute bottom-0 left-[10%] right-[10%] h-px opacity-0 group-focus-within:opacity-100 transition-opacity duration-400 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.4), transparent)",
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
