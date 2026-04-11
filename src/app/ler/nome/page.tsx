"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { registerLead } from "@/lib/reading-client";

// Future: verificar se email já tem conta via API antes de prosseguir (redirect pra login se sim).

export default function NomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill com dados da conta quando logada (a logada pode estar lendo
  // pra si mesma ou pra outra pessoa — ela troca se quiser)
  useEffect(() => {
    if (!user) return;
    const frame = window.requestAnimationFrame(() => {
      setName((current) => current || user.name);
      setEmail((current) => current || user.email);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2) return;
    if (!trimmedEmail.includes("@") || trimmedEmail.length < 5) {
      setEmailError("Preciso de um email pra te chamar depois.");
      return;
    }
    setEmailError(undefined);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("maosfalam_name", trimmedName);
      sessionStorage.setItem("maosfalam_email", trimmedEmail);
      sessionStorage.setItem("maosfalam_name_fresh", "1");
      sessionStorage.setItem("maosfalam_target_gender", gender);
    }
    setSubmitting(true);
    try {
      const sessionId = sessionStorage.getItem("maosfalam_session_id") ?? crypto.randomUUID();
      sessionStorage.setItem("maosfalam_session_id", sessionId);
      const { lead_id } = await registerLead({
        name: trimmedName,
        email: trimmedEmail,
        gender,
        session_id: sessionId,
        email_opt_in: emailOptIn,
      });
      sessionStorage.setItem("maosfalam_lead_id", lead_id);
    } catch {
      // Lead registration failure must not block the reading funnel
    }
    setSubmitting(false);
    router.push("/ler/toque");
  };

  const canSubmit = name.trim().length >= 2 && email.trim().length >= 5;

  return (
    <main className="relative min-h-dvh bg-black flex flex-col items-center justify-center px-6 pt-28 pb-16 gap-10 overflow-hidden">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 45%, rgba(201,162,74,0.06), transparent 75%)",
        }}
      />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative flex items-center gap-3"
      >
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
          Antes de eu ler
        </span>
        <span
          className="h-px w-10"
          style={{
            background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
          }}
        />
      </motion.div>

      <form onSubmit={handleSubmit} className="relative w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col gap-3 text-center">
          <p className="font-cormorant italic text-[28px] sm:text-[32px] text-bone leading-[1.25]">
            Me diz duas coisas antes.
          </p>
          <p className="font-cormorant italic text-[19px] text-bone-dim leading-[1.35]">
            Como eu te chamo, e onde eu te encontro depois.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <Input
            label="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="O primeiro que vier"
            autoFocus
          />

          <Input
            label="Melhor email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(undefined);
            }}
            placeholder="voce@exemplo.com"
            error={emailError}
            inputMode="email"
            autoComplete="email"
          />

          {/* Ela / Ele toggle */}
          <div className="flex flex-col gap-2">
            <span className="font-cormorant italic text-[14px] text-bone-dim tracking-[0.02em]">
              Essa leitura e pra
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender("female")}
                className="flex-1 py-3 font-raleway text-[10px] uppercase tracking-[0.06em] transition-all duration-300"
                style={{
                  background:
                    gender === "female"
                      ? "linear-gradient(160deg, #1e1838, #2a2150, #1e1838)"
                      : "transparent",
                  color: gender === "female" ? "#E8DFD0" : "#9b9284",
                  border:
                    gender === "female"
                      ? "1px solid rgba(201,162,74,0.2)"
                      : "1px solid rgba(201,162,74,0.08)",
                  borderRadius: "0 6px 0 6px",
                }}
              >
                Ela
              </button>
              <button
                type="button"
                onClick={() => setGender("male")}
                className="flex-1 py-3 font-raleway text-[10px] uppercase tracking-[0.06em] transition-all duration-300"
                style={{
                  background:
                    gender === "male"
                      ? "linear-gradient(160deg, #1e1838, #2a2150, #1e1838)"
                      : "transparent",
                  color: gender === "male" ? "#E8DFD0" : "#9b9284",
                  border:
                    gender === "male"
                      ? "1px solid rgba(201,162,74,0.2)"
                      : "1px solid rgba(201,162,74,0.08)",
                  borderRadius: "0 6px 0 6px",
                }}
              >
                Ele
              </button>
            </div>
          </div>

          {/* LGPD opt-in */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailOptIn}
              onChange={(e) => setEmailOptIn(e.target.checked)}
              className="mt-1 accent-gold w-4 h-4 shrink-0"
            />
            <span className="font-cormorant italic text-[13px] text-bone-dim leading-[1.4]">
              Aceito receber novidades e leituras por email.
            </span>
          </label>
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={!canSubmit || submitting}>
          Continuar
        </Button>
      </form>
    </main>
  );
}
