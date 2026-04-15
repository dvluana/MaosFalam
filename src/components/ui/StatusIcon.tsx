import type { CheckStatus } from "@/hooks/useUploadValidation";

export function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "pending") {
    return <span className="inline-block w-1.5 h-1.5 rounded-full bg-bone/20" aria-hidden />;
  }

  if (status === "running") {
    return (
      <span
        className="inline-block w-3 h-3 rounded-full border border-violet/40 border-t-violet animate-spin"
        aria-hidden
      />
    );
  }

  if (status === "pass") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path
          d="M2 6l3 3 5-5"
          stroke="#c9a24a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === "fail") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M2 2l8 8M10 2l-8 8" stroke="#c4647a" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // skip
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2 6h8" stroke="rgba(232,223,208,0.4)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function checkLabelClass(status: CheckStatus): string {
  if (status === "pass") return "text-gold";
  if (status === "fail") return "text-rose";
  if (status === "skip") return "text-bone-dim opacity-40";
  return "text-bone-dim";
}
