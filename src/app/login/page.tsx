"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button, Card, Input, Separator, GoogleButton, PageLoading } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { readCheckoutIntent } from "@/lib/checkout-intent";

type State =
  | "default"
  | "google_oauth_loading"
  | "google_oauth_error"
  | "email_login_error"
  | "email_login_success";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAuth();
  const [state, setState] = useState<State>("default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Decide pra onde mandar a usuária depois do login bem-sucedido:
   *  1. Se há ?return= na URL, respeita (ex: return=/creditos)
   *  2. Se há intent de checkout salvo, volta pra /creditos?pacote={id}
   *  3. Default: /conta/leituras
   */
  function resolveDestination(): string {
    const returnTo = search?.get("return");
    if (returnTo && returnTo.startsWith("/")) {
      const intent = readCheckoutIntent();
      if (returnTo === "/creditos" && intent) {
        return `/creditos?pacote=${intent.pacoteId}`;
      }
      return returnTo;
    }
    const intent = readCheckoutIntent();
    if (intent) {
      return `/creditos?pacote=${intent.pacoteId}`;
    }
    return "/conta/leituras";
  }

  const handleGoogle = () => {
    setState("google_oauth_loading");
    // Mock: simula OAuth Google. Em produção, redireciona pro OAuth real
    // e no callback chama login() e depois resolveDestination().
    window.setTimeout(() => {
      login("cigana@google.com", "123456");
      router.push(resolveDestination());
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(email, password);
    if (!ok) {
      setState("email_login_error");
      return;
    }
    setState("email_login_success");
    router.push(resolveDestination());
  };

  const loading = state === "google_oauth_loading";
  const isCheckoutReturn = search?.get("return") === "/creditos";

  return (
    <main className="min-h-dvh velvet-bg flex items-center justify-center px-6 pt-28 pb-12">
      <div className="w-full max-w-sm">
        <Card accentColor="violet">
          <div className="flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              <span className="font-logo text-xl text-gold tracking-wider">MãosFalam</span>
              {isCheckoutReturn ? (
                <p className="font-cormorant italic text-lg text-bone leading-snug">
                  Entra pra eu guardar seus créditos. Depois você volta exatamente pra onde estava.
                </p>
              ) : (
                <p className="font-cormorant italic text-lg text-bone leading-snug">
                  Voltou. Suas mãos não mudaram. Ou mudaram?
                </p>
              )}
            </div>

            <GoogleButton onClick={handleGoogle} loading={loading} label="Entrar com Google" />

            {state === "google_oauth_error" && (
              <p className="font-jetbrains text-[11px] text-rose text-center">
                Não consegui conectar com o Google. Tente de novo.
              </p>
            )}

            <div className="flex items-center gap-3">
              <Separator variant="gold" className="flex-1" />
              <span className="font-cormorant italic text-xs text-bone-dim">ou</span>
              <Separator variant="gold" className="flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Seu email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                required
              />
              <Input
                label="Sua senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="o segredo que te abre a porta"
                required
              />

              {state === "email_login_error" && (
                <p
                  className="font-jetbrains text-[10px] tracking-[0.5px] text-rose"
                  style={{ fontWeight: 500 }}
                >
                  Email ou senha incorretos.
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full">
                Entrar
              </Button>
            </form>

            <div className="flex items-center justify-between pt-2">
              <Link
                href={
                  search?.get("return") ? `/registro?return=${search.get("return")}` : "/registro"
                }
              >
                <Button variant="ghost" size="sm">
                  Criar conta
                </Button>
              </Link>
              <Link href="/esqueci-senha">
                <Button variant="ghost" size="sm">
                  Esqueci a senha
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
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
