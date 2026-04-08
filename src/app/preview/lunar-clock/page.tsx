import { LunarClock } from "@/components/landing";

/**
 * Preview isolado do LunarClock.
 * Acesse em /_preview/lunar-clock durante o dev.
 */
export default function LunarClockPreview() {
  return (
    <main className="relative min-h-screen bg-black">
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-cormorant italic text-2xl text-bone-dim">
          Olha pro canto da tela.
        </p>
        <p className="font-jetbrains text-[10px] uppercase tracking-[0.3em] text-gold-dim">
          Ela já sabe a hora.
        </p>
      </div>
      <LunarClock />
    </main>
  );
}
