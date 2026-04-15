"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <main className="min-h-dvh bg-black flex items-center justify-center">
      <div id="clerk-captcha" />
      <AuthenticateWithRedirectCallback />
    </main>
  );
}
