"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Input } from "@/components/ui";

export default function NomePage() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("maosfalam_name", trimmed);
      sessionStorage.setItem("maosfalam_name_fresh", "1");
    }
    router.push("/ler/toque");
  };

  return (
    <main className="relative min-h-dvh bg-black flex flex-col items-center justify-center px-6 pt-28 pb-16 gap-10 overflow-hidden">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 45%, rgba(201,162,74,0.06), transparent 75%)",
        }}
      />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative flex items-center gap-3"
      >
        <span
          className="h-px w-10"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,162,74,0.55))",
          }}
        />
        <span
          className="font-jetbrains text-[10px] tracking-[1.8px] uppercase text-gold whitespace-nowrap"
          style={{ fontWeight: 500 }}
        >
          Antes de eu ler
        </span>
        <span
          className="h-px w-10"
          style={{
            background:
              "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
          }}
        />
      </motion.div>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm flex flex-col gap-10"
      >
        <div className="flex flex-col gap-3 text-center">
          <p className="font-cormorant italic text-[28px] sm:text-[32px] text-bone leading-[1.25]">
            Me diz uma coisa antes.
          </p>
          <p className="font-cormorant italic text-[22px] text-bone-dim leading-[1.3]">
            Como eu te chamo?
          </p>
        </div>

        <Input
          label="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="O primeiro que vier"
          autoFocus
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={name.trim().length < 2}
        >
          Continuar
        </Button>
      </form>
    </main>
  );
}
