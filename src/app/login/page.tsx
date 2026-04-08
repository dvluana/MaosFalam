"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Separator } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";

type State =
  | "default"
  | "google_oauth_loading"
  | "google_oauth_error"
  | "email_login_error"
  | "email_login_success";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [state, setState] = useState<State>("default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogle = () => {
    setState("google_oauth_loading");
    window.setTimeout(() => {
      router.push("/conta/leituras");
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
    router.push("/conta/leituras");
  };

  const loading = state === "google_oauth_loading";

  return (
    <main className="min-h-dvh velvet-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Card accentColor="violet">
          <div className="flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              <span className="font-logo text-xl text-gold tracking-wider">
                MãosFalam
              </span>
              <p className="font-cormorant italic text-lg text-bone leading-snug">
                Voltou. Suas mãos não mudaram. Ou mudaram?
              </p>
            </div>

            <Button
              variant="secondary"
              size="default"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full"
            >
              <span aria-hidden className="text-base">G</span>
              {loading ? "Conectando" : "Entrar com Google"}
            </Button>

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
                <p className="font-jetbrains text-[11px] text-rose">
                  Email ou senha incorretos.
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full">
                Entrar
              </Button>
            </form>

            <div className="flex items-center justify-between pt-2">
              <Link href="/registro">
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
