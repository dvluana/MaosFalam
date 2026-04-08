"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Separator from "@/components/ui/Separator";
import StateSwitcher from "@/components/ui/StateSwitcher";

const STATES = ["default", "editing", "delete_confirmation"] as const;
type State = (typeof STATES)[number];

function PerfilContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const stateParam = search.get("state") as State | null;

  const [localState, setLocalState] = useState<State>("default");
  const [nameInput, setNameInput] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");

  if (!user) return null;

  const currentState: State =
    stateParam && (STATES as readonly string[]).includes(stateParam)
      ? stateParam
      : localState;
  const setState = setLocalState;
  const name = nameInput ?? user.name;
  const email = emailInput ?? user.email;
  const setName = (v: string) => setNameInput(v);
  const setEmail = (v: string) => setEmailInput(v);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleDelete = () => {
    if (confirm !== "EXCLUIR") return;
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    router.push("/");
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-8">
      <header>
        <p className="font-jetbrains text-[9px] text-bone-dim uppercase tracking-widest mb-2">
          sua conta
        </p>
        <h1 className="font-cinzel text-[26px] text-bone">Perfil</h1>
      </header>

      <Card accentColor="violet">
        {currentState === "editing" ? (
          <div className="flex flex-col gap-5">
            <Input
              label="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Seu email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="primary" size="sm" onClick={() => setState("default")}>
                Salvar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNameInput(null);
                  setEmailInput(null);
                  setState("default");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-jetbrains text-[9px] text-bone-dim uppercase tracking-widest mb-1">
                nome
              </p>
              <p className="font-cinzel text-[18px] text-bone">{user.name}</p>
            </div>
            <div>
              <p className="font-jetbrains text-[9px] text-bone-dim uppercase tracking-widest mb-1">
                email
              </p>
              <p className="font-raleway text-[14px] text-bone">{user.email}</p>
            </div>
            <div className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => setState("editing")}>
                Editar
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Separator variant="gold" />

      <div className="flex flex-col gap-4">
        <Button variant="secondary" onClick={handleLogout}>
          Sair
        </Button>
        <button
          type="button"
          onClick={() => setState("delete_confirmation")}
          className="font-raleway text-[11px] uppercase tracking-[0.06em] text-rose-dim hover:text-rose transition-colors"
        >
          Excluir conta
        </button>
      </div>

      {currentState === "delete_confirmation" && (
        <div className="fixed inset-0 velvet-bg/80 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <Card accentColor="rose">
              <h2 className="font-cormorant italic text-xl text-bone mb-3">
                Tem certeza? Suas leituras serão perdidas.
              </h2>
              <p className="font-cormorant italic text-[14px] text-bone-dim mb-5">
                Isso não tem volta. Se for, vai.
              </p>
              <Input
                label="Digite EXCLUIR pra confirmar"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <div className="flex gap-3 mt-5">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={confirm !== "EXCLUIR"}
                  onClick={handleDelete}
                >
                  Excluir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirm("");
                    setState("default");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <StateSwitcher states={STATES} current={currentState} />
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh velvet-bg flex items-center justify-center">
          <p className="font-cormorant italic text-bone-dim">Um momento...</p>
        </main>
      }
    >
      <PerfilContent />
    </Suspense>
  );
}
