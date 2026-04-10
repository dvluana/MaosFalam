"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Separator from "@/components/ui/Separator";
import { useAuth } from "@/hooks/useAuth";

/**
 * Perfil do usuário logado. Fluxo simplificado:
 *   - Visualizar nome e email (email read-only)
 *   - Editar nome
 *   - Trocar senha (modal próprio, precisa da senha atual + nova + confirmação)
 *   - Sair
 *
 * NÃO tem: excluir conta (removido a pedido — essa operação fica fora do
 * MVP, futuramente irá pra uma tela dedicada de settings avançadas).
 *
 * TODO (backend):
 *   - Editar nome: PATCH /api/user { name }
 *   - Trocar senha: POST /api/auth/change-password { current, next }
 *     retornando erro específico se senha atual incorreta
 */

type Mode = "view" | "editing_name" | "changing_password";

function PerfilContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("view");
  const [nameInput, setNameInput] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState<string | undefined>();
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSaveName = () => {
    // Mock: só fecha o form. Quando tiver backend, chamar PATCH /api/user.
    setMode("view");
    setNameInput("");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(undefined);
    if (currentPwd.length < 6) {
      setPwdError("Senha atual inválida.");
      return;
    }
    if (newPwd.length < 6) {
      setPwdError("Nova senha curta. Mínimo 6.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("As duas senhas não batem.");
      return;
    }
    // Mock: sucesso. Quando tiver backend, chamar POST /api/auth/change-password.
    setPwdSuccess(true);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    window.setTimeout(() => {
      setPwdSuccess(false);
      setMode("view");
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-10 flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-3 mb-3">
          <span
            className="h-px w-8"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.5))",
            }}
          />
          <span
            className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold whitespace-nowrap"
            style={{ fontWeight: 500 }}
          >
            Sua conta
          </span>
          <span className="h-px flex-1 bg-gold-dim/20" />
        </div>
        <h1 className="font-cinzel text-[26px] sm:text-[30px] text-bone leading-tight">
          Quem você é pra mim.
        </h1>
      </header>

      {/* Dados básicos */}
      <Card accentColor="violet">
        {mode === "editing_name" ? (
          <div className="flex flex-col gap-5">
            <Input
              label="Seu nome"
              value={nameInput || user.name}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="primary" size="sm" onClick={handleSaveName}>
                Salvar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNameInput("");
                  setMode("view");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p
                className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold-dim mb-1"
                style={{ fontWeight: 500 }}
              >
                Nome
              </p>
              <div className="flex items-center justify-between gap-3">
                <p className="font-cinzel text-[18px] text-bone">{user.name}</p>
                <Button variant="ghost" size="sm" onClick={() => setMode("editing_name")}>
                  Trocar
                </Button>
              </div>
            </div>
            <Separator variant="thin" />
            <div>
              <p
                className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold-dim mb-1"
                style={{ fontWeight: 500 }}
              >
                Email
              </p>
              <p className="font-raleway text-[14px] text-bone-dim">{user.email}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Trocar senha */}
      <Card accentColor="gold">
        {mode === "changing_password" ? (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
            <p
              className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold mb-1"
              style={{ fontWeight: 500 }}
            >
              Trocar senha
            </p>
            <Input
              label="Senha atual"
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              required
            />
            <Input
              label="Nova senha"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              error={pwdError}
              required
            />
            {pwdSuccess && (
              <p
                className="font-cormorant italic text-[15px] text-gold text-center"
                style={{
                  textShadow: "0 0 12px rgba(201,162,74,0.3)",
                }}
              >
                Senha trocada. Lembra dela dessa vez.
              </p>
            )}
            <div className="flex gap-3">
              <Button type="submit" variant="primary" size="sm">
                Salvar senha
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setCurrentPwd("");
                  setNewPwd("");
                  setConfirmPwd("");
                  setPwdError(undefined);
                  setMode("view");
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="font-jetbrains text-[9.5px] tracking-[1.8px] uppercase text-gold-dim mb-1"
                style={{ fontWeight: 500 }}
              >
                Senha
              </p>
              <p className="font-cormorant italic text-[15px] text-bone-dim">
                O segredo que te abre a porta.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMode("changing_password")}>
              Trocar
            </Button>
          </div>
        )}
      </Card>

      <Separator variant="gold" />

      <div className="flex flex-col items-center gap-3">
        {confirmingLogout ? (
          <div className="flex flex-col items-center gap-3">
            <p className="font-cormorant italic text-[15px] text-bone text-center">Tem certeza?</p>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Sim, sair
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingLogout(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setConfirmingLogout(true)}>
            Sair
          </Button>
        )}
        <p className="font-cormorant italic text-[13px] text-bone-dim text-center">
          Eu vou tá aqui quando você voltar.
        </p>
      </div>
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
