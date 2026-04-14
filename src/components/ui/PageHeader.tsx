"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import Menu from "@/components/landing/Menu";
import BrandIcon from "@/components/ui/BrandIcon";
import { GUEST_ITEMS, LOGGED_ITEMS } from "@/data/menu-items";
import { useAuth } from "@/hooks/useAuth";

/**
 * Header usado em todas as rotas não-landing.
 * Compartilha o visual do Nav da landing (logo gold + trigger do Menu)
 * mas com um grid próprio (max-w-xl) pra alinhar com o conteúdo das
 * páginas internas.
 */
export default function PageHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = useMemo(() => {
    if (!user) return GUEST_ITEMS;
    return [
      ...LOGGED_ITEMS,
      {
        id: "sair",
        num: "07",
        label: "Sair",
        sub: "Até a próxima",
        href: "/",
        onClick: () => {
          logout();
          router.push("/");
        },
      },
    ];
  }, [user, logout, router]);

  return (
    <header
      role="banner"
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.82), rgba(0,0,0,0.35) 70%, transparent)",
      }}
    >
      <div className="max-w-xl mx-auto flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          aria-label="MãosFalam"
          className="flex items-center gap-2.5"
          style={{ filter: "drop-shadow(0 0 10px rgba(201,162,74,0.12))" }}
        >
          {/* Símbolo: mão abstrata */}
          <BrandIcon width={26} height={16} className="shrink-0 block text-gold" />

          {/* Logo wordmark ao lado do símbolo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vetor-logo.svg"
            alt="MãosFalam"
            className="shrink-0 block opacity-90"
            style={{ width: 56, height: "auto" }}
          />
        </Link>

        <Menu activeId="ler" items={menuItems} />
      </div>
    </header>
  );
}
