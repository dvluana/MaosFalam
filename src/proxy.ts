import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

const COMING_SOON_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>MãosFalam</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative&family=Cormorant+Garamond:ital@1&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#08050E;color:#E8DFD0;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem}
    h1{font-family:'Cinzel Decorative',serif;font-size:clamp(1.8rem,5vw,2.8rem);color:#C9A24A;margin-bottom:2rem;letter-spacing:0.04em}
    p{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.1rem,3vw,1.4rem);color:#9b9284;line-height:1.6;max-width:28ch}
  </style>
</head>
<body>
  <h1>MãosFalam</h1>
  <p>Suas mãos já sabem. Você ainda não. Em breve.</p>
</body>
</html>`;

const isProtectedRoute = createRouteMatcher([
  "/api/reading/new(.*)",
  "/api/credits/(.*)",
  "/api/user/(.*)",
  "/conta(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (COMING_SOON && !req.nextUrl.pathname.startsWith("/api")) {
    return new NextResponse(COMING_SOON_HTML, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
