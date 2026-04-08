import { NextResponse, type NextRequest } from "next/server";

/**
 * Rewrites para HTMLs estáticos legados em /public.
 *
 * `/`          → renderizado por src/app/page.tsx (HomeLanding nativo).
 * `/manifesto` → ainda servido por public/manifesto.html (migração pendente).
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
