"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { registerLead } from "@/lib/reading-client";

/**
 * TODO (backend):
 * O campo `email` abaixo é coletado antes da leitura pra capturar o lead
 * e, quando o backend existir, servir como VALIDADOR de conta:
 *
 *   1. Ao clicar em "Continuar", chamar GET /api/auth/check-email?email=...
 *   2. Se a API retornar { exists: true }, interromper o fluxo e
 *      redirecionar a usuária pra /login?email={email}&return=/ler/toque
 *      com um toast explicando: "Eu já te conheço. Faz login primeiro."
 *   3. Se { exists: false }, continuar o fluxo normal (salva no
 *      sessionStorage + seta maosfalam_name_fresh + push pra /ler/toque).
 *   4. No final do funil, na hora de salvar a leitura no backend, o email
 *      é usado pra criar conta automaticamente ou vincular à existente
 *      (se a pessoa fez Google OAuth antes).
 *
 * Hoje (mock) o email é só salvo no sessionStorage pra exibir no resultado
 * e pra eventual lead capture; não há validação real.
 */

export default function NomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      sessionStorage.setItem("maosfalam_target_gender", "female");
    }
    setSubmitting(true);
    try {
      const sessionId =
        sessionStorage.getItem("maosfalam_session_id") ?? crypto.randomUUID();
      sessionStorage.setItem("maosfalam_session_id", sessionId);
      const { lead_id } = await registerLead({
        name: trimmedName,
        email: trimmedEmail,
        gender: "female",
        session_id: sessionId,
        email_opt_in: false,
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

          {/* Hint sutil sobre privacidade */}
          <p className="font-cormorant italic text-[13px] text-bone-dim text-center leading-[1.4]">
            Eu só uso pra te mandar a leitura e te chamar de volta. Nada mais.
          </p>
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={!canSubmit || submitting}>
          Continuar
        </Button>
      </form>
    </main>
  );
}
