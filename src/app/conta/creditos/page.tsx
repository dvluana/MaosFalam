"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMock } from "@/hooks/useMock";
import type { User } from "@/types/reading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import Separator from "@/components/ui/Separator";
import StateSwitcher from "@/components/ui/StateSwitcher";

const STATES = ["has_credits", "no_credits", "credits_expiring"] as const;
type State = (typeof STATES)[number];

interface Transaction {
  id: string;
  date: string;
  label: string;
  delta: number;
}

const MOCK_TX: Transaction[] = [
  { id: "t1", date: "2026-04-08", label: "Compra pacote Roda", delta: +5 },
  { id: "t2", date: "2026-04-05", label: "Leitura de Marina", delta: -1 },
  { id: "t3", date: "2026-04-02", label: "Leitura de Ana", delta: -1 },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function daysUntil(iso: string | null): number {
  if (!iso) return Infinity;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function CreditosContent() {
  const router = useRouter();
  const search = useSearchParams();
  const { data, loading } = useMock<User>("user");
  const stateParam = search.get("state") as State | null;

  const currentState: State = useMemo(() => {
    if (stateParam && (STATES as readonly string[]).includes(stateParam)) {
      return stateParam;
    }
    if (!data) return "has_credits";
    if (data.credits === 0) return "no_credits";
    const days = daysUntil(data.credits_expires_at);
    if (days <= 10) return "credits_expiring";
    return "has_credits";
  }, [stateParam, data]);

  if (loading || !data) {
    return (
      <main className="min-h-dvh velvet-bg flex items-center justify-center">
        <p className="font-cormorant italic text-bone-dim">Um momento...</p>
      </main>
    );
  }

  const credits = currentState === "no_credits" ? 0 : data.credits;

  return (
    <div className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-8">
      <header>
        <p className="font-jetbrains text-[9px] text-bone-dim uppercase tracking-widest mb-2">
          seus créditos
        </p>
        <h1 className="font-cinzel text-[26px] text-bone">Meus créditos</h1>
      </header>

      {currentState === "credits_expiring" && (
        <Toast
          variant="rose"
          icon="♄"
          message={`Sobraram ${credits} créditos. Usa com sabedoria.`}
        />
      )}

      <Card accentColor="gold">
        <div className="flex flex-col items-center gap-3 py-4">
          <span className="font-jetbrains text-[9px] text-bone-dim uppercase tracking-widest">
            saldo
          </span>
          <p className="font-cinzel text-[48px] text-gold leading-none">
            {credits}
          </p>
          <p className="font-cormorant italic text-[15px] text-bone-dim">
            {credits === 1 ? "crédito" : "créditos"}
          </p>
          {data.credits_expires_at && credits > 0 && (
            <p className="font-jetbrains text-[10px] text-violet uppercase mt-2">
              expira em {formatDate(data.credits_expires_at)}
            </p>
          )}
        </div>
      </Card>

      {currentState === "no_credits" ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-cormorant italic text-lg text-bone-dim max-w-sm">
            Sem créditos. Compre um pacote pra continuar lendo.
          </p>
          <Button variant="primary" onClick={() => router.push("/creditos")}>
            Comprar créditos
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button variant="primary" onClick={() => router.push("/creditos")}>
            Comprar mais
          </Button>
        </div>
      )}

      <Separator variant="gold" />

      <section>
        <h2 className="font-cinzel text-[14px] text-gold mb-4 uppercase tracking-[0.04em]">
          Transações
        </h2>
        <div className="flex flex-col gap-3">
          {MOCK_TX.map((tx) => (
            <Card key={tx.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-raleway text-[14px] text-bone">
                    {tx.label}
                  </p>
                  <p className="font-jetbrains text-[9px] text-bone-dim uppercase mt-1">
                    {formatDate(tx.date)}
                  </p>
                </div>
                <p
                  className={`font-jetbrains text-[14px] ${
                    tx.delta > 0 ? "text-gold" : "text-rose"
                  }`}
                >
                  {tx.delta > 0 ? "+" : ""}
                  {tx.delta}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <StateSwitcher states={STATES} current={currentState} />
    </div>
  );
}

export default function CreditosPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh velvet-bg flex items-center justify-center">
          <p className="font-cormorant italic text-bone-dim">Um momento...</p>
        </main>
      }
    >
      <CreditosContent />
    </Suspense>
  );
}
