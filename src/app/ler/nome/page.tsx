"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

  // Existing account feedback (email already registered in Clerk)
  const [existingAccountEmail, setExistingAccountEmail] = useState(false);

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

    if (trimmedName.length < 2) {
      setValidationError("Preciso saber seu nome.");
      scrollToAndShake(nameRef);
      return;
    }
    if (!trimmedEmail.includes("@") || trimmedEmail.length < 5) {
      setEmailError("Preciso de um email pra te chamar depois.");
      setValidationError(null);
      scrollToAndShake(emailRef);
      return;
    }
    setEmailError(undefined);
    setExistingAccountEmail(false);
    setValidationError(null);
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

    // Await lead registration to detect existing account (CTX-09)
    // Failure is non-blocking: if it throws, we proceed to the funnel anyway
    try {
      const result = await registerLead({
        name: trimmedName,
        email: trimmedEmail,
        gender,
        session_id: sessionId,
        email_opt_in: emailOptIn,
      });

      if (result.existing_account) {
        // Email already has a Clerk account — show inline feedback
        setExistingAccountEmail(true);
        setSubmitting(false);
        return;
      }

      if (result.lead_id) {
        sessionStorage.setItem("maosfalam_lead_id", result.lead_id);
      }
    } catch {
      // Lead registration failure is non-blocking — proceed anyway
    }

    const ctx: ReadingContext = {
      target_name: trimmedName,
      target_gender: gender,
      dominant_hand: dominantHand,
      is_self: true,
      session_id: sessionId,
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

      // Legacy keys for toque/camera guards and revelacao personalization
      sessionStorage.setItem("maosfalam_name", trimmedName);
      sessionStorage.setItem("maosfalam_name_fresh", "1");
      sessionStorage.setItem("maosfalam_target_gender", gender);

      const ctx: ReadingContext = {
        target_name: trimmedName,
        target_gender: gender,
        dominant_hand: dominantHand,
        is_self: isSelf,
        session_id: sessionId,
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

      // Legacy keys for toque/camera guards and revelacao personalization
      sessionStorage.setItem("maosfalam_name", trimmedName);
      sessionStorage.setItem("maosfalam_name_fresh", "1");
      sessionStorage.setItem("maosfalam_target_gender", gender);

      const ctx: ReadingContext = {
        target_name: trimmedName,
        target_gender: gender,
        dominant_hand: dominantHand,
        is_self: isSelf,
        session_id: sessionId,
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

  // Refs for scroll-to-error
  const nameRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const scrollToAndShake = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

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
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-sm"
          style={{
            background: "#110C1A",
            borderRadius: "0 6px 0 6px",
          }}
        >
          {/* Gold accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.55), transparent)",
            }}
          />
          {/* Corner ornaments */}
          <span
            className="absolute top-[-1px] left-[-1px] w-3 h-3 pointer-events-none"
            style={{
              borderTop: "1px solid rgba(201,162,74,0.25)",
              borderLeft: "1px solid rgba(201,162,74,0.25)",
            }}
          />
          <span
            className="absolute bottom-[-1px] right-[-1px] w-3 h-3 pointer-events-none"
            style={{
              borderBottom: "1px solid rgba(201,162,74,0.25)",
              borderRight: "1px solid rgba(201,162,74,0.25)",
            }}
          />

          <form
            onSubmit={handleVisitorSubmit}
            className="m-[5px] flex flex-col"
            style={{ border: "1px solid rgba(201,162,74,0.04)" }}
          >
            {/* Scrollable content area */}
            <div
              ref={scrollContainerRef}
              className="flex flex-col gap-6 p-6 overflow-y-auto max-h-[calc(100dvh-220px)]"
            >
              <div className="flex flex-col gap-2 text-center">
                <p className="font-cormorant italic text-[24px] sm:text-[28px] text-bone leading-[1.25]">
                  Me diz duas coisas antes.
                </p>
                <p className="font-cormorant italic text-[16px] text-bone-dim leading-[1.35]">
                  Como eu te chamo, e onde eu te encontro depois.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <div ref={nameRef}>
                  <Input
                    label="Seu nome"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="O primeiro que vier"
                    autoFocus
                  />
                  {validationError && (
                    <p
                      className="font-jetbrains text-[11px] tracking-[0.5px] text-rose mt-2"
                      style={{ fontWeight: 500 }}
                    >
                      {validationError}
                    </p>
                  )}
                </div>

                <div ref={emailRef}>
                  <Input
                    label="Melhor email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(undefined);
                      if (existingAccountEmail) setExistingAccountEmail(false);
                    }}
                    placeholder="voce@exemplo.com"
                    error={emailError}
                    inputMode="email"
                    autoComplete="email"
                  />
                  {/* Existing account inline feedback */}
                  {existingAccountEmail && (
                    <p
                      className="font-jetbrains text-[11px] tracking-[0.5px] text-gold mt-2"
                      style={{ fontWeight: 500 }}
                    >
                      Esse email ja tem conta.{" "}
                      <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="underline hover:text-gold-light transition-colors"
                      >
                        Faz login pra continuar.
                      </button>
                    </p>
                  )}
                </div>

                {/* Ela / Ele — stacked */}
                <div className="flex flex-col gap-2">
                  <span className="font-raleway text-[13px] text-bone tracking-[0.02em]">
                    Essa leitura é para
                  </span>
                  <div className="flex gap-2">
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

                {/* Destra / Canhota — stacked below */}
                <div className="flex flex-col gap-2">
                  <span className="font-raleway text-[13px] text-bone tracking-[0.02em]">
                    Mão que usa mais
                  </span>
                  <div className="flex gap-2">
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

                {/* LGPD opt-in — styled checkbox */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <span
                    className="relative flex shrink-0 items-center justify-center w-[18px] h-[18px] transition-all duration-200"
                    style={{
                      borderRadius: "0 4px 0 4px",
                      border: emailOptIn
                        ? "1px solid rgba(201,162,74,0.5)"
                        : "1px solid rgba(123,107,165,0.25)",
                      background: emailOptIn ? "rgba(201,162,74,0.15)" : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={emailOptIn}
                      onChange={(e) => setEmailOptIn(e.target.checked)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {emailOptIn && (
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
                  <span className="font-raleway text-[12px] text-bone leading-[1.4]">
                    Aceito receber novidades e leituras por email.
                  </span>
                </label>
              </div>
            </div>

            {/* Fixed footer — always visible */}
            <div className="sticky bottom-0 flex flex-col gap-4 p-6 pt-4 bg-[#110C1A]">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!visitorCanSubmit || submitting}
              >
                {submitting ? "Aguarde..." : "Continuar"}
              </Button>

              {/* Separator */}
              <div className="flex items-center gap-3">
                <span className="flex-1 h-px" style={{ background: "rgba(201,162,74,0.08)" }} />
                <span className="font-jetbrains text-[8px] tracking-[1.5px] uppercase text-bone-dim">
                  ou
                </span>
                <span className="flex-1 h-px" style={{ background: "rgba(201,162,74,0.08)" }} />
              </div>

              {/* Login link */}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full text-center font-raleway text-[13px] text-gold hover:text-gold-light transition-colors"
              >
                Ja tenho conta. Entrar.
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── LOGGED-IN FLOW ── */}
      {isLoggedIn && (
        <form
          onSubmit={handleLoggedInSubmit}
          className="relative w-full max-w-sm flex flex-col gap-8"
        >
          <div className="flex flex-col gap-3 text-center">
            <p className="font-cormorant italic text-[28px] sm:text-[32px] text-bone leading-[1.25]">
              Pra quem e essa leitura?
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
                  <span className="font-raleway text-[13px] text-bone tracking-[0.02em]">
                    Essa leitura é para
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
              <span className="font-raleway text-[13px] text-bone tracking-[0.02em]">
                Mão que usa mais
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
