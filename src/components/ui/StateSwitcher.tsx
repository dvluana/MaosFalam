"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface StateSwitcherProps {
  states: readonly string[];
  current: string;
}

export default function StateSwitcher({ states, current }: StateSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  if (process.env.NODE_ENV === "production") return null;

  const setState = (s: string) => {
    const params = new URLSearchParams(search?.toString() ?? "");
    params.set("state", s);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="fixed bottom-3 right-3 z-[9999] flex flex-col gap-1 max-w-[180px]">
      <span className="font-jetbrains text-[8px] text-bone-dim uppercase tracking-wider">
        state
      </span>
      {states.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setState(s)}
          className={`font-jetbrains text-[9px] px-2 py-1 text-left branded-radius border transition-all ${
            current === s
              ? "border-gold text-gold bg-[rgba(201,162,74,0.08)]"
              : "border-[rgba(201,162,74,0.12)] text-bone-dim hover:text-bone"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
