import Constellation from "@/components/landing/Constellation";
import Grain from "@/components/landing/Grain";

export default function CanvasFxPreviewPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black">
      <Constellation />
      <Grain />
      <div className="relative z-20 flex min-h-screen items-center justify-center">
        <h1 className="font-cormorant text-2xl italic tracking-[4px] text-gold/70">
          canvas-fx preview
        </h1>
      </div>
    </main>
  );
}
