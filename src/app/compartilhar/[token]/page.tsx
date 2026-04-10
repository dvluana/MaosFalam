import Link from "next/link";

import BlurredCard from "@/components/reading/BlurredCard";
import ElementSection from "@/components/reading/ElementSection";
import ReadingSection from "@/components/reading/ReadingSection";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";
import { buildMockReading } from "@/mocks/build-reading";
import type { Reading } from "@/types/reading";

import type { Metadata } from "next";

type ShareState = "valid_free" | "valid_premium" | "expired" | "not_found";

interface Resolved {
  state: ShareState;
  reading: Reading | null;
}

// NOTE: Share links no longer expire in production. The "expired" state is kept
// here only for the mock switcher / dev preview. In production, resolveToken
// will never return "expired".
function resolveToken(token: string): Resolved {
  const data: Reading = buildMockReading("fire");
  if (token === "abc123") return { state: "valid_free", reading: data };
  if (token === "premium") return { state: "valid_premium", reading: data };
  if (token === "expired") return { state: "expired", reading: null };
  return { state: "not_found", reading: null };
}

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const { state, reading } = resolveToken(token);
  if (!reading || state === "expired" || state === "not_found") {
    return {
      title: "MãosFalam",
      description: "Suas mãos já sabem. Você ainda não.",
    };
  }
  return {
    title: `Leitura de ${reading.report.user_name}`,
    description: reading.report.share_phrase,
    openGraph: {
      title: `Leitura de ${reading.report.user_name}`,
      description: reading.report.share_phrase,
    },
  };
}

const elementLabel: Record<string, string> = {
  fire: "Fogo",
  water: "Água",
  earth: "Terra",
  air: "Ar",
};

export default async function SharePage({ params }: PageProps) {
  const { token } = await params;
  const { state, reading } = resolveToken(token);

  if (state === "expired") {
    return (
      <main className="min-h-dvh velvet-bg flex flex-col items-center justify-center px-6 text-center gap-10">
        <p className="font-cormorant italic text-2xl text-bone leading-snug max-w-md">
          Essa leitura expirou. Mas a sua pode começar agora.
        </p>
        <Link href="/ler/nome">
          <Button variant="primary">Me mostre sua mão</Button>
        </Link>
      </main>
    );
  }

  if (state === "not_found" || !reading) {
    return (
      <main className="min-h-dvh velvet-bg flex flex-col items-center justify-center px-6 text-center gap-10">
        <p className="font-cormorant italic text-2xl text-bone leading-snug max-w-md">
          Essa leitura não existe.
        </p>
        <Link href="/ler/nome">
          <Button variant="primary">Voltar pro início</Button>
        </Link>
      </main>
    );
  }

  const { report } = reading;
  const heart = report.sections.find((s) => s.line === "heart");
  const others = report.sections.filter((s) => s.line !== "heart");

  return (
    <main className="min-h-dvh velvet-bg pb-20">
      <div className="px-4 pt-10 max-w-xl mx-auto flex flex-col gap-8">
        <header className="text-center flex flex-col items-center gap-3">
          <p className="font-jetbrains text-[9px] text-bone-dim uppercase tracking-widest">
            leitura de {report.user_name}
          </p>
          <h1 className="font-cinzel text-[26px] text-bone">As mãos dela falaram</h1>
          <div className="flex gap-2 justify-center mt-1">
            <Badge variant="gold">{elementLabel[report.element.type]}</Badge>
          </div>
        </header>

        <p className="font-cormorant italic text-2xl text-gold text-center leading-snug px-2">
          &ldquo;{report.share_phrase}&rdquo;
        </p>

        <Separator variant="gold" />

        <ElementSection element={report.element} />

        {state === "valid_free" && (
          <>
            <Separator variant="gold" />
            {heart && <ReadingSection section={heart} />}
            <Separator variant="ornamental" />
            <p className="font-cormorant italic text-xl text-bone-dim text-center">
              Tem mais. Muito mais.
            </p>
            <div className="flex flex-col gap-6">
              {others.map((s) => (
                <BlurredCard
                  key={s.line}
                  line={s.line}
                  symbol={s.symbol}
                  planet={s.planet}
                  teaser={s.intro}
                />
              ))}
            </div>
          </>
        )}

        {state === "valid_premium" && (
          <>
            <Separator variant="gold" />
            <div className="flex flex-col gap-6">
              {report.sections.map((s) => (
                <div
                  key={s.line}
                  className="border-l-2 border-[rgba(201,162,74,0.2)] pl-4 flex flex-col gap-2"
                >
                  <Badge variant="bone" icon={s.symbol}>
                    {s.planet}
                  </Badge>
                  <p className="font-cormorant italic text-lg text-bone-dim leading-snug">
                    {s.intro}
                  </p>
                  <p className="font-cormorant italic text-base text-gold leading-snug">
                    &ldquo;{s.impact_phrase}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator variant="ornamental" />

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-cormorant italic text-xl text-bone-dim max-w-sm">
            E as suas mãos, o que dizem?
          </p>
          <Link href="/ler/nome">
            <Button variant="primary" size="lg">
              Descubra o que suas mãos dizem
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
