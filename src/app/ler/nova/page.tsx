"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMock } from "@/hooks/useMock";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/reading";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";
import StateSwitcher from "@/components/ui/StateSwitcher";

const STATES = [
  "choose_target",
  "no_credits",
  "has_credits",
  "confirm_credit",
] as const;
type State = (typeof STATES)[number];

function NovaContent() {
  const router = useRouter();
  const search = useSearchParams();
  const stateParam = search.get("state") as State | null;
  const { user } = useAuth();
  const { data, loading } = useMock<User>("user");

  const [name, setName] = useState("");
  const [forSelf, setForSelf] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user === null) router.push("/login");
  }, [user, router]);

  const credits = data?.credits ?? 0;

  const currentState: State = useMemo(() => {
    if (stateParam && (STATES as readonly string[]).includes(stateParam)) {
      return stateParam;
    }
    if (showConfirm) return "confirm_credit";
    if (!data) return "choose_target";
    if (credits === 0) return "no_credits";
    return "has_credits";
  }, [stateParam, showConfirm, data, credits]);

  if (loading || !data || !user) {
    return (
      <main className="min-h-dvh bg-black flex items-center justify-center">
        <p className="font-cormorant italic text-bone-dim">Um momento...</p>
      </main>
    );
  }

  const toggleSelf = () => {
    const next = !forSelf;
    setForSelf(next);
    if (next) setName(data.name);
  };

  const targetName = name.trim() || data.name;

  return (
    <main className="min-h-dvh bg-black">
      <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-8">
        <header className="text-center">
          <p className="font-jetbrains text-[9px] text-bone-dim uppercase tracking-widest mb-2">
            nova leitura
          </p>
          <h1 className="font-cormorant italic text-[28px] text-bone">
            Pra quem é essa leitura?
          </h1>
        </header>

        <Card accentColor="gold">
          <div className="flex flex-col gap-5">
            <Input
              label="Nome de quem vai ser lida"
              placeholder="escreva aqui"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (forSelf) setForSelf(false);
              }}
            />
            <button
              type="button"
              onClick={toggleSelf}
              className="flex items-center gap-3 text-left"
            >
              <span
                className={`w-11 h-6 rounded-xl relative transition-colors ${
                  forSelf ? "bg-violet" : "bg-[#3d332c]"
                }`}
              >
                <span
                  className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-bone transition-transform ${
                    forSelf ? "translate-x-[23px]" : "translate-x-[3px]"
                  }`}
                />
              </span>
              <span className="font-cormorant italic text-[15px] text-bone-dim">
                É pra mim
              </span>
            </button>
          </div>
        </Card>

        <Separator variant="gold" />

        {currentState === "no_credits" ? (
          <Card accentColor="rose">
            <p className="font-cormorant italic text-[17px] text-bone mb-5">
              Você precisa de créditos pra uma leitura completa. A free ainda é
              sua.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="secondary" onClick={() => router.push("/ler/toque")}>
                Leitura free
              </Button>
              <Button variant="primary" onClick={() => router.push("/creditos")}>
                Comprar créditos
              </Button>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-cormorant italic text-[16px] text-bone">
              1 crédito será usado. Você tem {credits}.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowConfirm(true)}
              disabled={!targetName}
            >
              Continuar
            </Button>
          </div>
        )}

        {currentState === "confirm_credit" && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full">
              <Card accentColor="violet">
                <h2 className="font-cormorant italic text-xl text-bone mb-5">
                  Usar 1 crédito pra leitura de {targetName}?
                </h2>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setShowConfirm(false);
                      router.push("/ler/toque");
                    }}
                  >
                    Confirmar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      <StateSwitcher states={STATES} current={currentState} />
    </main>
  );
}

export default function NovaPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-black flex items-center justify-center">
          <p className="font-cormorant italic text-bone-dim">Um momento...</p>
        </main>
      }
    >
      <NovaContent />
    </Suspense>
  );
}
