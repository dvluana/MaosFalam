"use client";

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...rest }: InputProps) {
  return (
    <div className="w-full">
      <label
        className="block font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold mb-2"
        style={{ fontWeight: 500 }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          {...rest}
          className={`w-full bg-transparent border-0 border-b text-bone font-raleway text-[15px] py-3 outline-none transition-colors duration-300 placeholder:font-raleway placeholder:font-light placeholder:text-bone-dim/50 placeholder:text-[14px] placeholder:tracking-normal focus:border-gold ${className}`}
          style={{
            borderBottomColor: "rgba(201,162,74,0.22)",
          }}
        />
        <span className="input-accent-line" />
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
