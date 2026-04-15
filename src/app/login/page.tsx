"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageLoading from "@/components/ui/PageLoading";
import { consumeCheckoutIntent } from "@/lib/checkout-intent";

function LoginInner() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return") ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const getRedirectUrl = (): string => {
    const intent = consumeCheckoutIntent();
    if (intent) return `/creditos?pacote=${intent.pacoteId}`;
    if (returnTo && returnTo.startsWith("/")) return returnTo;
    return "/conta/leituras";
  };

  const handleGoogle = async () => {
    if (!isLoaded) return;
    setGoogleLoading(true);
    try {
      const intent = consumeCheckoutIntent();
      const redirectUrlComplete = intent
        ? `/creditos?pacote=${intent.pacoteId}`
        : returnTo && returnTo.startsWith("/")
          ? returnTo
          : "/conta/leituras";
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete,
      });
    } catch {
      setGoogleLoading(false);
      setError("Não consegui conectar com o Google. Tenta de novo.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;

    setLoading(true);
    setError(undefined);

    try {
      const result = await signIn.create({
        identifier: trimmedEmail,
        password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.push(getRedirectUrl());
        return;
      }

      // Handle intermediate states: Clerk may require additional verification
      if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
        // Attempt password factor if first factor is still needed
        const factor = result.supportedFirstFactors?.find((f) => f.strategy === "password");
        if (factor) {
          const secondAttempt = await signIn.attemptFirstFactor({
            strategy: "password",
            password,
          });
          if (secondAttempt.status === "complete" && secondAttempt.createdSessionId) {
            await setActive({ session: secondAttempt.createdSessionId });
            router.push(getRedirectUrl());
            return;
          }
        }

        // If email verification is pending, inform the user
        const emailFactor = result.supportedFirstFactors?.find(
          (f) => f.strategy === "email_code" || f.strategy === "email_link",
        );
        if (emailFactor) {
          setError("Verifique seu email antes de entrar. Clerk enviou um link de verificação.");
          setLoading(false);
          return;
        }

        setError("Login precisa de verificação adicional. Tente entrar com Google.");
        setLoading(false);
        return;
      }

      setError("Algo deu errado. Tenta de novo.");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const clerkErr = err as { errors?: Array<{ code?: string; message?: string }> };
      const firstCode = clerkErr.errors?.[0]?.code ?? "";
      const firstMsg = clerkErr.errors?.[0]?.message ?? "";
      const fallbackMsg = err instanceof Error ? err.message : "";
      const combined = `${firstCode} ${firstMsg} ${fallbackMsg}`;

      if (
        combined.includes("identifier") ||
        combined.includes("password") ||
        combined.includes("Invalid") ||
        combined.includes("invalid") ||
        combined.includes("form_password_incorrect") ||
        combined.includes("form_identifier_not_found")
      ) {
        setError("Email ou senha incorretos.");
      } else if (combined.includes("too_many") || combined.includes("rate")) {
        setError("Muitas tentativas. Espera um pouco e tenta de novo.");
      } else {
        setError("Algo deu errado. Tenta de novo.");
      }
    }
  };

  return (
    <main className="min-h-dvh bg-black flex flex-col items-center justify-center px-6 pt-28 pb-12">
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

        <div
          className="m-[5px] p-6 flex flex-col gap-6"
          style={{ border: "1px solid rgba(201,162,74,0.04)" }}
        >
          <div className="flex flex-col gap-2 text-center">
            <p className="font-cormorant italic text-[24px] sm:text-[28px] text-bone leading-[1.25]">
              Eu sei quem você é.
            </p>
            <p className="font-cormorant italic text-[15px] text-bone-dim leading-[1.35]">
              Entra. Suas mãos estão esperando.
            </p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={() => void handleGoogle()}
            disabled={googleLoading || !isLoaded}
            className="w-full py-3.5 flex items-center justify-center gap-3 font-raleway text-[11px] uppercase tracking-[0.06em] text-bone transition-all duration-300 disabled:opacity-30"
            style={{
              background: "rgba(23,18,34,0.85)",
              border: "1px solid rgba(201,162,74,0.15)",
              borderRadius: "0 6px 0 6px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {googleLoading ? "Conectando..." : "Entrar com Google"}
          </button>

          {/* Separator */}
          <div className="flex items-center gap-3">
            <span className="flex-1 h-px" style={{ background: "rgba(201,162,74,0.08)" }} />
            <span className="font-jetbrains text-[8px] tracking-[1.5px] uppercase text-bone-dim">
              ou
            </span>
            <span className="flex-1 h-px" style={{ background: "rgba(201,162,74,0.08)" }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(undefined);
              }}
              placeholder="voce@exemplo.com"
              inputMode="email"
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(undefined);
              }}
              placeholder="Sua senha"
              autoComplete="current-password"
              error={error}
            />

            {/* Clerk CAPTCHA widget for bot protection */}
            <div id="clerk-captcha" />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !email.trim() || !password}
              className="w-full"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Links */}
          <div className="flex flex-col gap-3 text-center">
            <button
              type="button"
              onClick={() => router.push("/esqueci-senha")}
              className="font-cormorant italic text-[13px] text-bone-dim hover:text-gold transition-colors"
            >
              Esqueci minha senha
            </button>

            <div className="flex items-center gap-3">
              <span className="flex-1 h-px" style={{ background: "rgba(201,162,74,0.04)" }} />
              <span className="flex-1 h-px" style={{ background: "rgba(201,162,74,0.04)" }} />
            </div>

            <button
              type="button"
              onClick={() => router.push("/registro")}
              className="font-cormorant italic text-[14px] text-gold hover:text-gold-light transition-colors"
            >
              Não tenho conta. Criar uma.
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginInner />
    </Suspense>
  );
}
