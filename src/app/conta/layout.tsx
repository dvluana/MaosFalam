"use client";

import { useEffect, useState, type ReactNode } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
}

const NAV = [
  { href: "/conta/leituras", label: "Leituras" },
  { href: "/conta/creditos", label: "Créditos" },
  { href: "/conta/perfil", label: "Perfil" },
] as const;

export default function ContaLayout({ children }: LayoutProps) {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (hydrated && user === null) {
      router.push("/login");
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <main className="min-h-dvh velvet-bg flex items-center justify-center">
        <p className="font-cormorant italic text-bone-dim">Um momento...</p>
      </main>
    );
  }

  return (
    <div className="min-h-dvh velvet-bg">
      {/* sub-nav da área logada (abaixo do SiteHeader global) */}
      <nav className="pt-20 border-b border-[rgba(201,162,74,0.08)]">
        <div className="max-w-lg mx-auto px-5 py-3 flex items-center gap-6 overflow-x-auto">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`font-cinzel text-[11px] tracking-[0.08em] uppercase transition-colors whitespace-nowrap ${
                pathname?.startsWith(n.href)
                  ? "text-gold"
                  : "text-bone-dim hover:text-bone"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
