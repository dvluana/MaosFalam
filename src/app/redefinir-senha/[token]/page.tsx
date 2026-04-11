"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

import { Button, Card, Input } from "@/components/ui";

type State = "default" | "success" | "token_expired" | "token_invalid";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function RedefinirSenhaPage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();

  const initialState: State =
    token === "valid" ? "default" : token === "expired" ? "token_expired" : "token_invalid";

  const [state, setState] = useState<State>(initialState);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Senha curta. Mínimo 6.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não batem.");
      return;
    }
    setError(undefined);
    setState("success");
    window.setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <main className="min-h-dvh velvet-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Card accentColor="violet">
          <div className="flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              <span className="font-logo text-xl text-gold tracking-wider">MãosFalam</span>
            </div>

            {state === "default" && (
              <>
                <p className="font-cormorant italic text-lg text-bone text-center leading-snug">
                  Escolhe um novo segredo. Esse ninguém mais vai saber.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <Input
                    label="Nova senha"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="mínimo seis segredos"
                  />
                  <Input
                    label="Confirme a senha"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="de novo"
                    error={error}
                  />
                  <Button type="submit" variant="primary" className="w-full">
                    Salvar
                  </Button>
                </form>
              </>
            )}

            {state === "success" && (
              <p className="font-cormorant italic text-base text-bone text-center leading-relaxed">
                Senha atualizada. Fazendo login...
              </p>
            )}

            {state === "token_expired" && (
              <div className="flex flex-col gap-5 text-center">
                <p className="font-cormorant italic text-lg text-bone leading-snug">
                  Esse link expirou. Solicite um novo.
                </p>
                <Link href="/esqueci-senha">
                  <Button variant="secondary" className="w-full">
                    Pedir novo link
                  </Button>
                </Link>
              </div>
            )}

            {state === "token_invalid" && (
              <div className="flex flex-col gap-5 text-center">
                <p className="font-cormorant italic text-lg text-bone leading-snug">
                  Link inválido.
                </p>
                <Link href="/esqueci-senha">
                  <Button variant="secondary" className="w-full">
                    Pedir novo link
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
