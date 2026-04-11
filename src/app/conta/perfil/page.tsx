"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";
import { useAuth } from "@/hooks/useAuth";

/**
 * Perfil do usuário logado.
 * Edição de nome e senha delegada ao Clerk UserProfile (CLK-03, CLK-04).
 * Mantém bloco de logout com confirmação.
 */
export default function PerfilPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
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

      <UserProfile
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "#C9A24A",
            colorBackground: "#110C1A",
            colorText: "#E8DFD0",
            colorTextSecondary: "#9b9284",
            colorInputBackground: "#171222",
            colorInputText: "#E8DFD0",
            borderRadius: "0.375rem",
          },
        }}
      />

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
