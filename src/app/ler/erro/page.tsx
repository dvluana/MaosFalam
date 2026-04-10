"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageLoading from "@/components/ui/PageLoading";

type ErrorType = "low_confidence" | "api_error" | "too_many_attempts";

function ErrorInner() {
  const search = useSearchParams();
  const type = (search?.get("type") as ErrorType) ?? "low_confidence";
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (type === "too_many_attempts") {
    return (
      <main className="min-h-dvh bg-black flex flex-col items-center justify-center px-6 gap-8 text-center">
        <p className="font-cormorant italic text-2xl text-bone max-w-sm leading-snug">
          Suas mãos estão resistindo. Tente amanhã.
        </p>
        <Link href="/manifesto">
          <Button variant="secondary">Ler o manifesto enquanto isso</Button>
        </Link>
      </main>
    );
  }

  if (type === "api_error") {
    return (
      <main className="min-h-dvh bg-black flex flex-col items-center justify-center px-6 gap-8 text-center">
        <p className="font-cormorant italic text-2xl text-bone max-w-sm leading-snug">
          Eu preciso de um momento. Volte em breve.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/ler/camera">
            <Button variant="primary" className="w-full">
              Tentar de novo
            </Button>
          </Link>
          {!submitted ? (
            <>
              <Input
                label="Quer que eu te chame quando voltar?"
                placeholder="seu email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="ghost" onClick={() => setSubmitted(true)} disabled={!email}>
                Me avisa
              </Button>
            </>
          ) : (
            <p className="font-cormorant italic text-bone-dim">Eu te chamo. Prometo.</p>
          )}
        </div>
      </main>
    );
  }

  // low_confidence
  return (
    <main className="min-h-dvh bg-black flex flex-col items-center justify-center px-6 gap-8 text-center">
      <p className="font-cormorant italic text-2xl text-bone max-w-sm leading-snug">
        Suas linhas estão tímidas hoje. Tente de novo com mais luz.
      </p>

      <div className="flex gap-8 text-bone-dim">
        <div className="flex flex-col items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
            <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.3" />
            <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
              <line x1="16" y1="3" x2="16" y2="7" />
              <line x1="16" y1="25" x2="16" y2="29" />
              <line x1="3" y1="16" x2="7" y2="16" />
              <line x1="25" y1="16" x2="29" y2="16" />
              <line x1="6" y1="6" x2="9" y2="9" />
              <line x1="23" y1="23" x2="26" y2="26" />
              <line x1="6" y1="26" x2="9" y2="23" />
              <line x1="23" y1="9" x2="26" y2="6" />
            </g>
          </svg>
          <span className="font-jetbrains text-[8px] uppercase">luz</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
            <path
              d="M10 28V14 Q10 8 13 8 Q15 8 15 14 V6 Q15 4 17 4 Q19 4 19 6 V14 V7 Q19 5 21 5 Q23 5 23 8 V14 V10 Q23 8 25 9 Q27 10 27 14 V22 Q27 28 22 28 Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-jetbrains text-[8px] uppercase">mão aberta</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
            <rect x="4" y="4" width="24" height="24" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span className="font-jetbrains text-[8px] uppercase">fundo limpo</span>
        </div>
      </div>

      <Link href="/ler/camera">
        <Button variant="primary">Tentar de novo</Button>
      </Link>
    </main>
  );
}

export default function ErroPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ErrorInner />
    </Suspense>
  );
}
