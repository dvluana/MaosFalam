export interface TarotCardReading {
  upright: string;
  reversed: string;
  past: string;
  present: string;
  future: string;
}

export interface TarotCardData {
  id: number;
  numeral: string;
  name: string;
  slug: string;
  image: string;
  keywords: string[];
  reading: TarotCardReading;
}

export type SpreadPosition = "past" | "present" | "future";

export interface DrawnCard {
  card: TarotCardData;
  position: SpreadPosition;
}
