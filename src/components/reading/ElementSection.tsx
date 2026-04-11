"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import useStoredName from "@/hooks/useStoredName";
import { personalize } from "@/lib/personalize";
import type { HandElement, ReportJSON } from "@/types/report";

interface Props {
  element: ReportJSON["element"];
  impactPhrase: string;
}

const elementLabel: Record<HandElement, string> = {
  fire: "Fogo",
  water: "Água",
  earth: "Terra",
  air: "Ar",
};

export default function ElementSection({ element, impactPhrase }: Props) {
  const name = useStoredName();

  return (
    <Card parchment accentColor="gold">
      <div className="flex items-center gap-3 mb-4">
        <Badge variant="gold">Elemento</Badge>
        <Badge variant="bone">{elementLabel[element.key]}</Badge>
      </div>
      <h2 className="font-cinzel text-[18px] text-bone mb-4">
        {elementLabel[element.key]}
      </h2>
      <p className="font-raleway text-[15px] leading-[1.85] text-bone mb-6">{element.body}</p>
      <p className="font-cormorant italic text-xl text-gold leading-snug">
        &ldquo;{personalize(impactPhrase, name)}&rdquo;
      </p>
    </Card>
  );
}
