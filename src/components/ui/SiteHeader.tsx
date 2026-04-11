"use client";

import { usePathname } from "next/navigation";

import PageHeader from "./PageHeader";

/**
 * Header global: renderiza o PageHeader em todas as rotas não-landing.
 * A landing tem grid próprio (430px) e renderiza seu Nav internamente.
 */
const HIDE_ON = new Set<string>(["/", "/lp-venda"]);

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  if (HIDE_ON.has(pathname)) return null;
  return <PageHeader />;
}
