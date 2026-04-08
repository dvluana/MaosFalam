"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMock } from "@/hooks/useMock";
import type { User } from "@/types/reading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StateSwitcher from "@/components/ui/StateSwitcher";
import ReadingCard from "@/components/account/ReadingCard";

const STATES = ["has_readings", "empty", "loading"] as const;
type State = (typeof STATES)[number];

function Skeletons() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <div className="animate-pulse flex flex-col gap-3">
            <div className="h-3 w-20 bg-[rgba(232,223,208,0.08)]" />
            <div className="h-4 w-40 bg-[rgba(232,223,208,0.08)]" />
            <div className="h-3 w-full bg-[rgba(232,223,208,0.05)]" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function LeiturasContent() {
  const router = useRouter();
  const search = useSearchParams();
  const stateParam = search.get("state") as State | null;
  const { data, loading } = useMock<User>("user");

  const currentState: State = useMemo(() => {
    if (stateParam && (STATES as readonly string[]).includes(stateParam)) {
      return stateParam;
    }
    if (loading) return "loading";
    if (!data || data.readings.length === 0) return "empty";
    return "has_readings";
  }, [stateParam, loading, data]);

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="font-jetbrains text-[9px] text-bone-dim uppercase tracking-widest mb-2">
          suas leituras
        </p>
        <h1 className="font-cinzel text-[26px] text-bone">Minhas leituras</h1>
      </header>

      {currentState === "loading" && <Skeletons />}

      {currentState === "empty" && (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <p className="font-cormorant italic text-xl text-bone-dim max-w-sm">
            Suas mãos ainda não falaram. Faça sua primeira leitura.
          </p>
          <Button variant="primary" onClick={() => router.push("/ler/nova")}>
            Fazer leitura
          </Button>
        </div>
      )}

      {currentState === "has_readings" && data && (
        <div className="flex flex-col gap-4">
          {data.readings.map((r) => (
            <ReadingCard key={r.id} reading={r} currentUser={{ name: data.name }} />
          ))}
        </div>
      )}

      <StateSwitcher states={STATES} current={currentState} />
    </div>
  );
}

export default function LeiturasPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh velvet-bg flex items-center justify-center">
          <p className="font-cormorant italic text-bone-dim">Um momento...</p>
        </main>
      }
    >
      <LeiturasContent />
    </Suspense>
  );
}
