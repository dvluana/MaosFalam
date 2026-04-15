"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useId, useMemo, useRef, useState } from "react";

import Toast from "./Toast";

type Variant = "gold" | "rose" | "violet";

interface ToastData {
  id: string;
  variant?: Variant;
  icon?: string;
  message: string;
  detail?: string;
}

type ShowToastParams = Omit<ToastData, "id">;

interface ToastContextValue {
  showToast: (params: ShowToastParams) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 4000;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const prefix = useId();
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (params: ShowToastParams) => {
      counterRef.current += 1;
      const id = `${prefix}-${Date.now()}-${counterRef.current}`;
      const toast: ToastData = { ...params, id };

      setToasts((prev) => {
        const next = [...prev, toast];
        return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
      });

      setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
    },
    [prefix, removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Backdrop overlay when toasts are visible */}
      <AnimatePresence>
        {toasts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: "rgba(8,5,14,0.4)" }}
          />
        )}
      </AnimatePresence>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="pointer-events-auto"
            >
              <Toast variant={t.variant} icon={t.icon} message={t.message} detail={t.detail} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
