"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
}

const BREADCRUMBS: Record<string, string> = {
  "/conta/leituras": "Leituras",
  "/conta/perfil": "Perfil",
};

export default function ContaLayout({ children }: LayoutProps) {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  const currentLabel = Object.entries(BREADCRUMBS).find(([href]) =>
    pathname?.startsWith(href),
  )?.[1];

  return (
    <div className="min-h-dvh velvet-bg">
      {/* breadcrumb minimalista abaixo do SiteHeader global */}
      <div className="pt-20">
        <div className="max-w-xl mx-auto px-5 py-4 flex items-center gap-2">
          <Link
            href="/conta/leituras"
            className="font-mono text-[8px] uppercase tracking-[1.5px] text-bone-dim hover:text-gold transition-colors"
          >
            Conta
          </Link>
          {currentLabel && (
            <>
              <span className="w-1 h-1 bg-gold rotate-45 opacity-40" />
              <span className="font-mono text-[8px] uppercase tracking-[1.5px] text-gold">
                {currentLabel}
              </span>
            </>
          )}
        </div>
        <div className="max-w-xl mx-auto px-5">
          <div className="h-px bg-gradient-to-r from-transparent via-[rgba(201,162,74,0.08)] to-transparent" />
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
