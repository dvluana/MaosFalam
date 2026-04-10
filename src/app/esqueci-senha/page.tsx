"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button, Card, Input, StateSwitcher, PageLoading } from "@/components/ui";

type State = "default" | "sent" | "error";
const STATES = ["default", "sent", "error"] as const;

function Inner() {
  const search = useSearchParams();
  const urlState = (search?.get("state") as State) ?? "default";
  const [state, setState] = useState<State>(urlState);
  const [email, setEmail] = useState("");

  const effective: State = urlState !== "default" ? urlState : state;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setState("error");
      return;
    }
    setState("sent");
  };

  return (
    <main className="min-h-dvh velvet-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Card accentColor="violet">
          <div className="flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              <span className="font-logo text-xl text-gold tracking-wider">MãosFalam</span>
              <p className="font-cormorant italic text-lg text-bone leading-snug">
                Perdeu a chave. Acontece.
              </p>
            </div>

            {effective === "sent" ? (
              <p className="font-cormorant italic text-base text-bone text-center leading-relaxed">
                Mandei um link pro seu email. Se não chegar, olha no spam.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label="Seu email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                />
                {effective === "error" && (
                  <p className="font-jetbrains text-[11px] text-rose">
                    Não encontrei esse email.{" "}
                    <Link href="/registro" className="underline text-gold">
                      Quer criar uma conta?
                    </Link>
                  </p>
                )}
                <Button type="submit" variant="primary" className="w-full">
                  Enviar link
                </Button>
              </form>
            )}

            <div className="text-center">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Voltar pro login
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
      <StateSwitcher states={STATES} current={effective} />
    </main>
  );
}

export default function EsqueciSenhaPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Inner />
    </Suspense>
  );
}
