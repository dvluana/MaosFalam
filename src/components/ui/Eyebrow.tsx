interface EyebrowProps {
  label: string;
  className?: string;
}

export default function Eyebrow({ label, className = "" }: EyebrowProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span
        className="h-px w-10"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.55))",
        }}
      />
      <span
        className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold whitespace-nowrap"
        style={{ fontWeight: 500 }}
      >
        {label}
      </span>
      <span
        className="h-px w-10"
        style={{
          background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
        }}
      />
    </div>
  );
}
