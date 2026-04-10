import { NextResponse, type NextRequest } from "next/server";

/**
 * Rewrites para HTMLs estáticos legados em /public.
 *
 * `/`          → renderizado por src/app/page.tsx (HomeLanding nativo).
 * `/manifesto` → MIGRADO para src/app/manifesto/page.tsx.
 *                O rewrite abaixo pode ser removido. A rota App Router tem
 *                prioridade, mas manter o rewrite causa conflito.
 *                TODO: remover este rewrite e deletar public/manifesto.html.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/manifesto") {
    return NextResponse.rewrite(new URL("/manifesto.html", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/manifesto"],
};
