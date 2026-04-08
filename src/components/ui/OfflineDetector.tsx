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
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center px-8 text-center"
    >
      <p className="font-cormorant italic text-2xl text-bone leading-snug max-w-md">
        Até a cigana precisa de sinal. Tente quando a conexão voltar.
      </p>
    </div>
  );
}
