interface Props {
  label: string;
  teaser: string;
}

export default function BlurredCard({ label, teaser }: Props) {
  return (
    <article
      className="card-noise card-noise-dim relative overflow-hidden px-7 py-9 sm:px-9 sm:py-11 transition-colors duration-300 group"
      style={{
        background: "#0e0a18",
        border: "1px solid rgba(201,162,74,0.08)",
        boxShadow: "0 24px 48px -16px rgba(0,0,0,0.85), 0 8px 20px -8px rgba(0,0,0,0.6)",
      }}
    >
      {/* Radial glow (dim for locked) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(139,123,191,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Corner accents */}
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] top-2 left-2 border-t border-l"
        style={{ borderColor: "rgba(201,162,74,0.15)" }}
      />
      <span
        aria-hidden
        className="absolute w-[10px] h-[10px] bottom-2 right-2 border-b border-r"
        style={{ borderColor: "rgba(201,162,74,0.15)" }}
      />

      <div className="relative flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold-dim">
            {label}
          </span>
          <span
            aria-hidden
            className="font-jetbrains text-[9px] tracking-[2px] uppercase text-gold-dim flex items-center gap-1"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path
                d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5M2 5h6v4H2z"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            selada
          </span>
        </div>

        <p className="font-cormorant italic text-[18px] sm:text-[20px] text-bone-dim leading-[1.4] mb-4">
          {teaser}
        </p>

        <p className="font-raleway text-[13.5px] leading-[1.85] text-bone select-none blur-[6px]">
          Suas mãos guardam mais do que esse primeiro capítulo. Existe uma segunda camada que a
          cigana só lê quando você decide saber. O que você esconde tem nome, tem forma, e tem
          preço.
        </p>
      </div>
    </article>
  );
}
