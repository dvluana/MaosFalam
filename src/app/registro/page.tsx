"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button, Card, Input, Separator, Toast, GoogleButton, PageLoading } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { readCheckoutIntent } from "@/lib/checkout-intent";

type State =
  | "default"
  | "registration_success"
  | "registration_error_email_exists"
  | "registration_error_validation";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

function RegistroInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { register } = useAuth();
  const [state, setState] = useState<State>("default");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function resolveDestination(): string {
    const returnTo = search?.get("return");
    const intent = readCheckoutIntent();
    if (returnTo === "/creditos" && intent) {
      return `/creditos?pacote=${intent.pacoteId}`;
    }
    if (returnTo && returnTo.startsWith("/")) return returnTo;
    if (intent) return `/creditos?pacote=${intent.pacoteId}`;
    return "/conta/leituras";
  }

  const handleGoogle = () => {
    window.setTimeout(() => router.push(resolveDestination()), 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Preciso do seu nome.";
    if (!email.includes("@")) next.email = "Email inválido.";
    if (password.length < 6) next.password = "Senha curta. Mínimo 6.";

    if (Object.keys(next).length > 0) {
      setErrors(next);
      setState("registration_error_validation");
      return;
    }

    if (typeof window !== "undefined") {
      const existing = window.localStorage.getItem("maosfalam_user");
      if (existing) {
        try {
          const parsed = JSON.parse(existing) as { email?: string };
          if (parsed.email === email) {
            setState("registration_error_email_exists");
            return;
          }
        } catch {
          // ignore
        }
      }
    }

    const ok = register(name, email, password);
    if (!ok) {
      setState("registration_error_validation");
      return;
    }
    setErrors({});
    setState("registration_success");
    window.setTimeout(() => router.push(resolveDestination()), 1500);
  };

  return (
    <main className="min-h-dvh velvet-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-4">
        {state === "registration_success" && (
          <Toast
            variant="rose"
            icon="♀"
            message={`Bem-vinda, ${name}. Suas mãos estavam esperando.`}
          />
        )}
        <Card accentColor="rose">
          <div className="flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              <span className="font-logo text-xl text-gold tracking-wider">MãosFalam</span>
              <p className="font-cormorant italic text-lg text-bone leading-snug">
                Você chegou. Eu já estava te esperando.
              </p>
            </div>

            <GoogleButton onClick={handleGoogle} label="Criar com Google" />

            <div className="flex items-center gap-3">
              <Separator variant="gold" className="flex-1" />
              <span className="font-cormorant italic text-xs text-bone-dim">ou</span>
              <Separator variant="gold" className="flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="o nome que te chamam"
                error={errors.name}
              />
              <Input
                label="Seu email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                error={errors.email}
              />
              <Input
                label="Sua senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo seis segredos"
                error={errors.password}
              />

              {state === "registration_error_email_exists" && (
                <p className="font-jetbrains text-[11px] text-rose">
                  Esse email já tem conta.{" "}
                  <Link href="/login" className="underline text-gold">
                    Fazer login?
                  </Link>
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full">
                Criar conta
              </Button>
            </form>

            <div className="text-center">
              <Link
                href={search?.get("return") ? `/login?return=${search.get("return")}` : "/login"}
              >
                <Button variant="ghost" size="sm">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RegistroInner />
    </Suspense>
  );
}
