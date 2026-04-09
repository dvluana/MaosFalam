"use client";

import type { MouseEventHandler } from "react";

interface Props {
  onClick: MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
  label?: string;
  loadingLabel?: string;
}

/**
 * Botão "Continuar com Google" unificado — mesmo visual do modal
 * requires_login da página /creditos. Fundo bone translúcido, borda gold,
 * corner accents TL/BR, SVG oficial 4-cor do Google, Raleway 14px.
 * Suporta loading state.
 */
export default function GoogleButton({
  onClick,
  loading = false,
  label = "Continuar com Google",
  loadingLabel = "Conectando...",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 transition-all disabled:opacity-50 disabled:cursor-wait focus:outline-none hover:border-[rgba(201,162,74,0.65)]"
      style={{
        background: "rgba(232,223,208,0.05)",
        border: "1px solid rgba(201,162,74,0.45)",
        boxShadow:
          "0 10px 24px -8px rgba(0,0,0,0.8), 0 0 20px -6px rgba(201,162,74,0.18)",
      }}
    >
      {/* Corner accents TL / BR */}
      <span
        aria-hidden
        className="absolute w-[8px] h-[8px] top-0 left-0 border-t border-l"
        style={{ borderColor: "rgba(201,162,74,0.6)" }}
      />
      <span
        aria-hidden
        className="absolute w-[8px] h-[8px] bottom-0 right-0 border-b border-r"
        style={{ borderColor: "rgba(201,162,74,0.6)" }}
      />

      {/* Ícone Google oficial 4-cor */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      <span
        className="font-raleway text-[14px] text-bone tracking-[0.02em]"
        style={{ fontWeight: 500 }}
      >
        {loading ? loadingLabel : label}
      </span>
    </button>
  );
}
