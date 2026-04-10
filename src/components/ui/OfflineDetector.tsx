"use client";

import { useEffect, useState } from "react";

export default function OfflineDetector() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center px-8"
    >
      <div className="relative rounded-[0_6px_0_6px] bg-deep p-8 max-w-md text-center corner-ornaments">
        {/* corner ornaments */}
        <span
          aria-hidden
          className="absolute -top-px -left-px w-2 h-2 border-t border-l border-[rgba(201,162,74,0.25)]"
        />
        <span
          aria-hidden
          className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-[rgba(201,162,74,0.25)]"
        />

        {/* gold ornament */}
        <div className="flex items-center gap-2 justify-center mb-6">
          <span className="flex-1 max-w-12 h-px bg-gradient-to-r from-transparent to-[rgba(201,162,74,0.3)]" />
          <span aria-hidden className="w-1 h-1 bg-gold rotate-45" />
          <span className="flex-1 max-w-12 h-px bg-gradient-to-l from-transparent to-[rgba(201,162,74,0.3)]" />
        </div>

        <p className="font-cormorant italic text-2xl text-bone leading-snug">
          Até a cigana precisa de sinal. Tente quando a conexão voltar.
        </p>

        {/* subtle gold line at bottom */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[rgba(201,162,74,0.12)] to-transparent" />
      </div>
    </div>
  );
}
