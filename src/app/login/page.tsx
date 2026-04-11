"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Suspense } from "react";

import PageLoading from "@/components/ui/PageLoading";

function LoginInner() {
  return (
    <main className="min-h-dvh bg-black flex items-center justify-center px-6 pt-28 pb-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center flex flex-col gap-2">
          <span className="font-logo text-xl text-gold tracking-wider">MãosFalam</span>
        </div>
        <SignIn
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#C9A24A",
              colorBackground: "#110C1A",
              colorText: "#E8DFD0",
              colorTextSecondary: "#9b9284",
              colorInputBackground: "#171222",
              colorInputText: "#E8DFD0",
              borderRadius: "0px 6px 0px 6px",
            },
            elements: {
              card: {
                backgroundColor: "#110C1A",
                border: "1px solid rgba(201,162,74,0.1)",
                borderRadius: "0 6px 0 6px",
              },
              rootBox: { width: "100%" },
            },
          }}
          routing="hash"
          signUpUrl="/registro"
          fallbackRedirectUrl="/conta/leituras"
        />
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginInner />
    </Suspense>
  );
}
