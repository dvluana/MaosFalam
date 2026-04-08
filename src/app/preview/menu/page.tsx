import { Menu } from "@/components/landing";

/**
 * Preview isolado do Menu. Acesse em /preview/menu.
 * O trigger fica fixo no canto superior direito.
 */
export default function MenuPreview() {
  return (
    <main className="relative min-h-screen bg-black">
      {/* Nav fake só pra ancorar o trigger no canto superior direito */}
      <div className="fixed top-4 right-5 z-[100]">
        <Menu activeId="home" />
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-cormorant italic text-2xl text-bone-dim max-w-md">
          Clica no canto. Ou aperta Esc quando quiser sair.
        </p>
        <p className="font-jetbrains text-[10px] uppercase tracking-[0.3em] text-gold-dim">
          Preview · Menu
        </p>
      </div>
    </main>
  );
}
