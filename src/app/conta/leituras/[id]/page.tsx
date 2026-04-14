"use client";

import { notFound, useRouter } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";

import { getReading } from "@/lib/reading-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

function LeituraContent({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReading(id)
      .then((r) => {
        if (!r) {
          notFound();
          return;
        }
        // Redirect to the proper result page (premium or free)
        if (r.tier === "premium") {
          router.replace(`/ler/resultado/${id}/completo`);
        } else {
          router.replace(`/ler/resultado/${id}`);
        }
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  if (!loading) {
    notFound();
  }

  return (
    <main className="min-h-dvh velvet-bg flex items-center justify-center">
      <p className="font-cormorant italic text-bone-dim">Um momento...</p>
    </main>
  );
}

export default function LeituraSalvaPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh velvet-bg flex items-center justify-center">
          <p className="font-cormorant italic text-bone-dim">Um momento...</p>
        </main>
      }
    >
      <LeituraContent id={id} />
    </Suspense>
  );
}
