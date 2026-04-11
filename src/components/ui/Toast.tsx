type Variant = "gold" | "rose" | "violet";

interface ToastProps {
  variant?: Variant;
  icon?: string;
  message: string;
  detail?: string;
  className?: string;
}

const border: Record<Variant, string> = {
  gold: "border-l-gold",
  rose: "border-l-rose",
  violet: "border-l-violet",
};

export default function Toast({
  variant = "gold",
  icon,
  message,
  detail,
  className = "",
}: ToastProps) {
  return (
    <div
      className={`bg-deep branded-radius grain-texture border-l-2 ${border[variant]} p-4 flex items-start gap-3 ${className}`}
    >
      {icon && (
        <span
          aria-hidden
          className="w-7 h-7 border border-[rgba(201,162,74,0.08)] flex items-center justify-center text-sm shrink-0"
        >
          {icon}
        </span>
      )}
      <div className="flex-1">
        <p className="font-cormorant italic text-base text-bone tracking-[0.02em]">{message}</p>
        {detail && <p className="font-jetbrains text-[8px] text-violet mt-1 uppercase">{detail}</p>}
      </div>
    </div>
  );
}
