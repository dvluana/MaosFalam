"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Suspense } from "react";

import PageLoading from "@/components/ui/PageLoading";

function RegistroInner() {
  return (
    <main className="min-h-dvh velvet-bg flex items-center justify-center px-6 pt-28 pb-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center flex flex-col gap-2">
          <span className="font-logo text-xl text-gold tracking-wider">MaosFalam</span>
          <p className="font-cormorant italic text-lg text-bone leading-snug">
            Voce chegou. Eu ja estava te esperando.
          </p>
        </div>
        <SignUp
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#C9A24A",
              colorBackground: "#110C1A",
              colorText: "#E8DFD0",
              colorTextSecondary: "#9b9284",
              colorInputBackground: "#171222",
              colorInputText: "#E8DFD0",
              borderRadius: "0.375rem",
            },
          }}
          routing="hash"
          signInUrl="/login"
          fallbackRedirectUrl="/conta/leituras"
        />
      </div>
    </main>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RegistroInner />
    </Suspense>
  );
}
