"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import Menu from "@/components/landing/Menu";
import { useAuth } from "@/hooks/useAuth";

/**
 * Menu items conforme estado de auth. Quando logada, as opções "Entrar" e
 * "Criar conta" viram "Minhas leituras" e "Sair".
 */
const GUEST_ITEMS = [
  { id: "home", num: "01", label: "Início", sub: "Você está aqui", href: "/" },
  { id: "ler", num: "02", label: "Mostre sua mão", sub: "Começar agora", href: "/ler/nome" },
  { id: "tarot", num: "03", label: "Tarot Online", sub: "Três cartas, de graça", href: "/tarot" },
  { id: "login", num: "04", label: "Entrar", sub: "Já te conheço", href: "/login" },
  { id: "registro", num: "05", label: "Criar conta", sub: "Pra você voltar", href: "/registro" },
];

const LOGGED_STATIC = [
  { id: "home", num: "01", label: "Início", sub: "Você está aqui", href: "/" },
  {
    id: "leituras",
    num: "02",
    label: "Minhas leituras",
    sub: "O que suas mãos já disseram",
    href: "/conta/leituras",
  },
  {
    id: "nova",
    num: "03",
    label: "Nova leitura",
    sub: "Mostre sua mão de novo",
    href: "/ler/nome",
  },
  {
    id: "tarot",
    num: "04",
    label: "Tarot Online",
    sub: "Três cartas pra distrair a sorte",
    href: "/tarot",
  },
  { id: "perfil", num: "05", label: "Perfil", sub: "Quem você é pra mim", href: "/conta/perfil" },
];

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
      ...LOGGED_STATIC,
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
          <svg
            width="26"
            height="16"
            className="shrink-0 block"
            viewBox="0 0 613 366"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M288.841 46.146C293.104 63.164 294.411 81.573 303.299 97.107C325.889 136.609 370.568 149.719 409.266 166.602C448.926 183.898 485.101 198.622 526.441 211.064C554.06 219.031 584.428 226.543 613 229.958C589.772 232.047 567.585 233.251 545.348 241.341C490.896 261.154 455.302 309.301 405.034 336.378C376.118 352.549 342.428 363.614 309.407 365.631C228.034 370.594 156.821 324.788 100.808 270.409C69.826 240.329 46.14 231.59 3.873 233.998C39.206 222.563 76.544 210.374 110.893 196.244C131.719 187.677 153.615 176.583 174.614 167.361C201.576 155.521 232.546 143.208 255.681 125.206C282.259 104.522 285.384 77.21 288.841 46.146ZM186.868 189.901C162.296 196.041 135.412 203.801 112.617 215.05C140.258 268.656 185.396 302.01 242.39 320.92C289.186 336.445 335.486 330.379 379.135 307.728C408.246 292.444 433.675 271.037 453.652 244.989C462.06 233.667 468.287 224.416 475.31 211.92C446.699 201.199 427.791 195.122 397.098 190.419C385.734 217.643 373.703 233.21 347.931 248.771C328.926 260.244 307.287 266.407 298.388 288.461C292.152 302.791 292.83 314.962 290.316 329.469C283.284 284.931 282.968 270.655 241.441 252.165C219 242.174 195.323 215.339 188.641 192.39C188.055 190.675 188.244 191.161 186.868 189.901ZM291.189 119.862C285.757 140.802 285.287 167.666 264.068 179.993C250.004 188.164 231.156 191.659 215.317 194.703C237.911 198.153 260.984 201.515 276.27 220.408C286.936 233.594 287.25 259.37 292.278 265.801C295.962 244.728 297.927 223.026 317.462 210.068C331.665 200.65 351.476 197.325 368.006 194.537C345.642 190.728 320.292 187.484 306.06 167.68C295.167 152.512 296.944 134.946 291.189 119.862Z"
              fill="var(--color-gold)"
            />
            <path
              d="M174.092 27.061C216.082 5.198 264.16-3.393 311.107 1.2C385.635 7.242 445.195 45.298 492.124 101.452C517.484 131.787 543.237 164.456 573.822 189.931C585.854 199.957 597.257 203.796 612.029 208.232C589.528 208.793 569.548 204.094 548.51 196.162C525.939 187.769 504.902 175.732 486.241 160.537C441.876 124.183 412.773 75.612 354.471 53.625C284.215 27.133 207.402 44.015 154.972 97.537C131.109 121.896 112.03 148.118 86.776 170.051C60.877 192.542 30.905 204.67 0 218.127C13.719 208.345 26.438 181.177 37.791 169.08C82.573 121.359 113.787 58.461 174.092 27.061Z"
              fill="var(--color-gold)"
            />
          </svg>

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
