"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export default function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <span
        className="relative flex shrink-0 items-center justify-center w-[18px] h-[18px] transition-all duration-200"
        style={{
          borderRadius: "0 4px 0 4px",
          border: checked ? "1px solid rgba(201,162,74,0.5)" : "1px solid rgba(123,107,165,0.25)",
          background: checked ? "rgba(201,162,74,0.15)" : "transparent",
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="#C9A24A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="font-raleway text-[12px] text-bone leading-[1.4]">{label}</span>
    </label>
  );
}
