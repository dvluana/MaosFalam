"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { ReadingReport } from "@/types/reading";
import { personalize, readStoredName } from "@/lib/personalize";

interface Props {
  element: ReadingReport["element"];
}

const elementLabel: Record<ReadingReport["element"]["type"], string> = {
  fire: "Fogo",
  water: "Água",
  earth: "Terra",
  air: "Ar",
};

export default function ElementSection({ element }: Props) {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => setName(readStoredName()), []);

  return (
    <Card parchment accentColor="gold">
      <div className="flex items-center gap-3 mb-4">
        <Badge variant="gold">Elemento</Badge>
        <Badge variant="bone">{elementLabel[element.type]}</Badge>
      </div>
      <h2 className="font-cinzel text-[18px] text-bone mb-4">
        {element.title}
      </h2>
      <p className="font-raleway text-[15px] leading-[1.85] text-bone mb-6">
        {element.body}
      </p>
      <p className="font-cormorant italic text-xl text-gold leading-snug">
        &ldquo;{personalize(element.impact, name)}&rdquo;
      </p>
    </Card>
  );
}
