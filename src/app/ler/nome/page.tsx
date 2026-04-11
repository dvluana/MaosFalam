"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CreditGate from "@/components/reading/CreditGate";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { registerLead, requestNewReading } from "@/lib/reading-client";
import { saveReadingContext } from "@/lib/reading-context";
import { generateUUID } from "@/lib/uuid";
import type { ReadingContext } from "@/types/reading-context";

// ============================================================
// Toggle button helper — keeps DS styling DRY
// ============================================================

interface ToggleButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}

function ToggleButton({ selected, onClick, children, ariaLabel }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className="flex-1 py-3 font-raleway text-[10px] uppercase tracking-[0.06em] transition-all duration-300"
      style={{
        background: selected ? "linear-gradient(160deg, #1e1838, #2a2150, #1e1838)" : "transparent",
        color: selected ? "#E8DFD0" : "#9b9284",
        border: selected ? "1px solid rgba(201,162,74,0.2)" : "1px solid rgba(201,162,74,0.08)",
        borderRadius: "0 6px 0 6px",
      }}
    >
      {children}
    </button>
  );
}

// ============================================================
// Page
// ============================================================

export default function NomePage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const { balance, reading_count, loading: creditsLoading } = useCredits();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [dominantHand, setDominantHand] = useState<"right" | "left">("right");
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [isSelf, setIsSelf] = useState(true);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showCreditGate, setShowCreditGate] = useState(false);

  // When logged in, pre-fill name from account on mount
  useEffect(() => {
    if (!user) return;
    const frame = window.requestAnimationFrame(() => {
      if (isSelf) {
        setName(user.name);
      }
    });
    return () => window.cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // When toggling "Pra mim", restore account name
  const handleIsSelfToggle = (value: boolean) => {
    setIsSelf(value);
    if (value && user) {
      setName(user.name);
    } else if (!value) {
      setName("");
    }
  };

  // ============================================================
  // VISITOR SUBMIT
  // ============================================================
  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) return;
    if (!trimmedEmail.includes("@") || trimmedEmail.length < 5) {
      setEmailError("Preciso de um email pra te chamar depois.");
      return;
    }
    setEmailError(undefined);
    setSubmitting(true);

    // Persist legacy session keys for downstream consumers
    if (typeof window !== "undefined") {
      sessionStorage.setItem("maosfalam_name", trimmedName);
      sessionStorage.setItem("maosfalam_email", trimmedEmail);
      sessionStorage.setItem("maosfalam_name_fresh", "1");
      sessionStorage.setItem("maosfalam_target_gender", gender);
    }

    const sessionId = sessionStorage.getItem("maosfalam_session_id") ?? generateUUID();
    sessionStorage.setItem("maosfalam_session_id", sessionId);

    // Fire-and-forget lead registration — failure must not block reading funnel (CTX-09)
    void registerLead({
      name: trimmedName,
      email: trimmedEmail,
      gender,
      session_id: sessionId,
      email_opt_in: emailOptIn,
    })
      .then(({ lead_id }) => {
        sessionStorage.setItem("maosfalam_lead_id", lead_id);
      })
      .catch(() => undefined);

    const ctx: ReadingContext = {
      target_name: trimmedName,
      target_gender: gender,
      dominant_hand: dominantHand,
      is_self: true,
      session_id: sessionId,
      credit_used: false,
    };
    saveReadingContext(ctx);
    router.push("/ler/toque");
  };

  // ============================================================
  // LOGGED-IN SUBMIT
  // ============================================================
  const handleLoggedInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return;

    // First reading is always free (CTX-06)
    if (reading_count === 0) {
      const sessionId = sessionStorage.getItem("maosfalam_session_id") ?? generateUUID();
      sessionStorage.setItem("maosfalam_session_id", sessionId);
      const ctx: ReadingContext = {
        target_name: trimmedName,
        target_gender: gender,
        dominant_hand: dominantHand,
        is_self: isSelf,
        session_id: sessionId,
        credit_used: false,
      };
      saveReadingContext(ctx);
      router.push("/ler/toque");
      return;
    }

    // Subsequent readings: gate on credit balance (CTX-07)
    if (balance === 0) {
      router.push("/creditos");
      return;
    }

    // Has credits: show confirmation modal (CTX-05)
    setShowCreditGate(true);
  };

  // ============================================================
  // CREDIT GATE CONFIRM
  // ============================================================
  const handleCreditConfirm = async () => {
    const trimmedName = name.trim();
    setConfirming(true);
    try {
      await requestNewReading({
        target_name: trimmedName,
        target_gender: gender,
        is_self: isSelf,
      });

      const sessionId = sessionStorage.getItem("maosfalam_session_id") ?? generateUUID();
      sessionStorage.setItem("maosfalam_session_id", sessionId);

      const ctx: ReadingContext = {
        target_name: trimmedName,
        target_gender: gender,
        dominant_hand: dominantHand,
        is_self: isSelf,
        session_id: sessionId,
        credit_used: true,
      };
      saveReadingContext(ctx);
      router.push("/ler/toque");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // 402 = insufficient credits → redirect to /creditos
      if (message.includes("402") || message.toLowerCase().includes("credito")) {
        router.push("/creditos");
      } else {
        setConfirming(false);
        setShowCreditGate(false);
      }
    }
  };

  // ============================================================
  // Derived values
  // ============================================================
  const isLoggedIn = hydrated && user !== null;
  const isVisitor = hydrated && user === null;

  const visitorCanSubmit = name.trim().length >= 2 && email.trim().includes("@");
  const loggedInCanSubmit = name.trim().length >= 2 && !creditsLoading;

  // ============================================================
  // Render
  // ============================================================
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

      {/* ── VISITOR FLOW ── */}
      {isVisitor && (
        <form
          onSubmit={handleVisitorSubmit}
          className="relative w-full max-w-sm flex flex-col gap-8"
        >
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
                Essa leitura é pra
              </span>
              <div className="flex gap-3">
                <ToggleButton
                  selected={gender === "female"}
                  onClick={() => setGender("female")}
                  ariaLabel="Leitura para ela (feminino)"
                >
                  Ela
                </ToggleButton>
                <ToggleButton
                  selected={gender === "male"}
                  onClick={() => setGender("male")}
                  ariaLabel="Leitura para ele (masculino)"
                >
                  Ele
                </ToggleButton>
              </div>
            </div>

            {/* Dominant hand toggle */}
            <div className="flex flex-col gap-2">
              <span className="font-cormorant italic text-[14px] text-bone-dim tracking-[0.02em]">
                Qual mão você usa mais?
              </span>
              <div className="flex gap-3">
                <ToggleButton
                  selected={dominantHand === "right"}
                  onClick={() => setDominantHand("right")}
                  ariaLabel="Mão destra (direita)"
                >
                  Destra
                </ToggleButton>
                <ToggleButton
                  selected={dominantHand === "left"}
                  onClick={() => setDominantHand("left")}
                  ariaLabel="Mão canhota (esquerda)"
                >
                  Canhota
                </ToggleButton>
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!visitorCanSubmit || submitting}
          >
            Continuar
          </Button>
        </form>
      )}

      {/* ── LOGGED-IN FLOW ── */}
      {isLoggedIn && (
        <form
          onSubmit={handleLoggedInSubmit}
          className="relative w-full max-w-sm flex flex-col gap-8"
        >
          <div className="flex flex-col gap-3 text-center">
            <p className="font-cormorant italic text-[28px] sm:text-[32px] text-bone leading-[1.25]">
              Pra quem é essa leitura?
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Pra mim / Pra outra pessoa toggle */}
            <div className="flex gap-3">
              <ToggleButton
                selected={isSelf}
                onClick={() => handleIsSelfToggle(true)}
                ariaLabel="Leitura para mim"
              >
                Pra mim
              </ToggleButton>
              <ToggleButton
                selected={!isSelf}
                onClick={() => handleIsSelfToggle(false)}
                ariaLabel="Leitura para outra pessoa"
              >
                Pra outra pessoa
              </ToggleButton>
            </div>

            {/* When reading for another person: show name + gender */}
            {!isSelf && (
              <>
                <Input
                  label="Nome da pessoa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como eu a chamo?"
                  autoFocus
                />

                <div className="flex flex-col gap-2">
                  <span className="font-cormorant italic text-[14px] text-bone-dim tracking-[0.02em]">
                    Essa leitura é pra
                  </span>
                  <div className="flex gap-3">
                    <ToggleButton
                      selected={gender === "female"}
                      onClick={() => setGender("female")}
                      ariaLabel="Leitura para ela (feminino)"
                    >
                      Ela
                    </ToggleButton>
                    <ToggleButton
                      selected={gender === "male"}
                      onClick={() => setGender("male")}
                      ariaLabel="Leitura para ele (masculino)"
                    >
                      Ele
                    </ToggleButton>
                  </div>
                </div>
              </>
            )}

            {/* Dominant hand toggle (always visible for logged-in) */}
            <div className="flex flex-col gap-2">
              <span className="font-cormorant italic text-[14px] text-bone-dim tracking-[0.02em]">
                Qual mão você usa mais?
              </span>
              <div className="flex gap-3">
                <ToggleButton
                  selected={dominantHand === "right"}
                  onClick={() => setDominantHand("right")}
                  ariaLabel="Mão destra (direita)"
                >
                  Destra
                </ToggleButton>
                <ToggleButton
                  selected={dominantHand === "left"}
                  onClick={() => setDominantHand("left")}
                  ariaLabel="Mão canhota (esquerda)"
                >
                  Canhota
                </ToggleButton>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!loggedInCanSubmit || submitting}
          >
            Continuar
          </Button>
        </form>
      )}

      {/* CreditGate modal */}
      {showCreditGate && (
        <CreditGate
          balance={balance}
          targetName={name.trim()}
          onConfirm={() => void handleCreditConfirm()}
          onCancel={() => setShowCreditGate(false)}
          confirming={confirming}
        />
      )}
    </main>
  );
}
