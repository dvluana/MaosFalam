import Link from "next/link";

import BlurredCard from "@/components/reading/BlurredCard";
import ElementSection from "@/components/reading/ElementSection";
import ReadingSection from "@/components/reading/ReadingSection";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Separator from "@/components/ui/Separator";
import type { Reading, ReportJSON, Tier } from "@/types/report";

import type { Metadata } from "next";

type ShareState = "valid_free" | "valid_premium" | "expired" | "not_found";
type ShareReading = Reading & { target_name: string };

interface Resolved {
  state: ShareState;
  reading: ShareReading | null;
}

const ELEMENT_LABEL: Record<string, string> = {
  fire: "Fogo",
  water: "Água",
  earth: "Terra",
  air: "Ar",
};

async function resolveReading(token: string): Promise<Resolved> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/reading/${token}`, { cache: "no-store" });
  if (res.status === 410) return { state: "expired", reading: null };
  if (!res.ok) return { state: "not_found", reading: null };
  const data = (await res.json()) as {
    reading: {
      id: string;
      target_name: string;
      tier: string;
      report: ReportJSON;
      created_at: string;
    };
  };
  const r = data.reading;
  const reading: ShareReading = {
    id: r.id,
    tier: r.tier as Tier,
    share_token: r.id,
    share_expires_at: "2099-12-31T00:00:00.000Z",
    report: r.report as ReportJSON,
    created_at: r.created_at,
    target_name: r.target_name,
  };
  const state: ShareState = r.tier === "premium" ? "valid_premium" : "valid_free";
  return { state, reading };
}

// Paywall teasers for blurred cards on share page
const SHARE_TEASERS: Array<{ label: string; teaser: string }> = [
  { label: "Mente", teaser: "Sua cabeça decide rápido. Seu coração demora pra aceitar." },
  { label: "Passado", teaser: "Tem uma marca aqui que apareceu faz uns anos." },
  { label: "Destino", teaser: "Tem algo chegando. E não, não é o que você tá esperando." },
];

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const { state, reading } = await resolveReading(token);
  if (!reading || state === "expired" || state === "not_found") {
    return {
      title: "MãosFalam",
      description: "Suas mãos já sabem. Você ainda não.",
    };
  }
  return {
    title: `Leitura de ${reading.target_name}`,
    description: reading.report.impact_phrase,
    openGraph: {
      title: `Leitura de ${reading.target_name}`,
      description: reading.report.impact_phrase,
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { token } = await params;
  const { state, reading } = await resolveReading(token);

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
  const heart = report.sections.find((s) => s.key === "heart");

  return (
    <main className="min-h-dvh velvet-bg pb-20">
      <div className="px-4 pt-10 max-w-xl mx-auto flex flex-col gap-8">
        <header className="text-center flex flex-col items-center gap-3">
          <p className="font-jetbrains text-[9px] text-bone-dim uppercase tracking-widest">
            leitura de {reading.target_name}
          </p>
          <h1 className="font-cinzel text-[26px] text-bone">As maos falaram</h1>
          <div className="flex gap-2 justify-center mt-1">
            <Badge variant="gold">{ELEMENT_LABEL[report.element.key]}</Badge>
          </div>
        </header>

        <p className="font-cormorant italic text-2xl text-gold text-center leading-snug px-2">
          &ldquo;{report.impact_phrase}&rdquo;
        </p>

        <Separator variant="gold" />

        <ElementSection element={report.element} impactPhrase={report.impact_phrase} />

        {state === "valid_free" && (
          <>
            <Separator variant="gold" />
            {heart && <ReadingSection section={heart} />}
            <Separator variant="ornamental" />
            <p className="font-cormorant italic text-xl text-bone-dim text-center">
              Tem mais. Muito mais.
            </p>
            <div className="flex flex-col gap-6">
              {SHARE_TEASERS.map((t) => (
                <BlurredCard key={t.label} label={t.label} teaser={t.teaser} />
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
                  key={s.key}
                  className="border-l-2 border-[rgba(201,162,74,0.2)] pl-4 flex flex-col gap-2"
                >
                  <Badge variant="bone">{s.label}</Badge>
                  <p className="font-cormorant italic text-lg text-bone-dim leading-snug">
                    {s.opening}
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
