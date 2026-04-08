import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-dvh velvet-bg flex flex-col items-center justify-center px-6 text-center gap-10">
      <p className="font-cormorant italic text-2xl text-bone leading-snug max-w-md">
        Esse caminho não existe. Mas o seu, sim.
      </p>
      <Link href="/">
        <Button variant="primary">Voltar pro início</Button>
      </Link>
    </main>
  );
}
