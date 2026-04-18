import HomeV2Landing from "@/components/landing/HomeV2";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MãosFalam",
  description:
    "Leitura de mão online. Primeira plataforma de quiromancia do Brasil. Uma foto, 30 segundos, tudo sobre você.",
};

export default function HomePage() {
  return <HomeV2Landing />;
}
