"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";
import { useAuth } from "@/hooks/useAuth";

/**
 * Perfil — mostra dados da conta (Clerk) com visual do DS.
 * Nome e email são read-only (Clerk é source of truth).
 * Botões: trocar senha (via Clerk hosted) e logout.
 */
export default function PerfilPage() {
  const { user, logout } = useAuth();
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

      {/* Profile card */}
      <div
        className="relative"
        style={{
          background: "#110C1A",
          borderRadius: "0 6px 0 6px",
        }}
      >
        {/* Gold accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.55), transparent)",
          }}
        />
        {/* Corner ornaments */}
        <span
          className="absolute top-[-1px] left-[-1px] w-3 h-3 pointer-events-none"
          style={{
            borderTop: "1px solid rgba(201,162,74,0.25)",
            borderLeft: "1px solid rgba(201,162,74,0.25)",
          }}
        />
        <span
          className="absolute bottom-[-1px] right-[-1px] w-3 h-3 pointer-events-none"
          style={{
            borderBottom: "1px solid rgba(201,162,74,0.25)",
            borderRight: "1px solid rgba(201,162,74,0.25)",
          }}
        />

        <div
          className="m-[5px] p-6 flex flex-col gap-5"
          style={{ border: "1px solid rgba(201,162,74,0.04)" }}
        >
          {/* Name */}
          <div className="flex flex-col gap-1">
            <span className="font-cormorant italic text-[13px] text-bone-dim tracking-[0.02em]">
              Nome
            </span>
            <span className="font-raleway text-[16px] text-bone">{user?.name ?? "..."}</span>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <span className="font-cormorant italic text-[13px] text-bone-dim tracking-[0.02em]">
              Email
            </span>
            <span className="font-raleway text-[16px] text-bone">{user?.email ?? "..."}</span>
          </div>

          <Separator variant="thin" />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push("/login#/user/security")}
              className="w-full text-left font-cormorant italic text-[14px] text-gold hover:text-gold-light transition-colors"
            >
              Trocar senha
            </button>
          </div>
        </div>
      </div>

      <Separator variant="gold" />

      {/* Logout */}
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
