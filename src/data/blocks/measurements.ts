import type { MeasurementSet } from "@/types/blocks";
import type {
  HeartVariation,
  HeadVariation,
  LifeVariation,
  FateVariation,
} from "@/types/hand-attributes";

export const HEART_MEASUREMENTS: Record<HeartVariation, MeasurementSet> = {
  long_straight: {
    comprimento: "Longa. Atravessa a palma inteira sem parar.",
    curvatura: "Reta. Sem desvio nenhum.",
    profundidade: "Marcada. Funda. Sem correntes.",
  },
  long_curved: {
    comprimento: "Longa. Vai de ponta a ponta.",
    curvatura: "Curva suave, generosa.",
    profundidade: "Consistente do início ao fim.",
  },
  long_deep_curved: {
    comprimento: "Longa. Passa do centro com folga.",
    curvatura: "Curva acentuada. Mergulha.",
    profundidade: "Profunda. Das mais marcadas que eu vi.",
  },
  short_straight: {
    comprimento: "Curta. Para no meio da palma.",
    curvatura: "Reta. Objetiva.",
    profundidade: "Firme, mas discreta.",
  },
  short_curved: {
    comprimento: "Curta. Compacta.",
    curvatura: "Curva concentrada.",
    profundidade: "Média. Presente, não gritante.",
  },
  medium_straight: {
    comprimento: "Média. Nem longa, nem curta.",
    curvatura: "Reta. Equilibrada.",
    profundidade: "Uniforme. Sem variação.",
  },
  medium_curved: {
    comprimento: "Média. Comprimento moderado.",
    curvatura: "Curva presente, não exagerada.",
    profundidade: "Moderada. Consistente.",
  },
  faint: {
    comprimento: "Extensão variável.",
    curvatura: "Direção suave, quase hesitante.",
    profundidade: "Tênue. Precisa de luz boa pra ver.",
  },
} as const;

export const HEAD_MEASUREMENTS: Record<HeadVariation, MeasurementSet> = {
  long_straight: {
    comprimento: "Longa. Passa do centro da palma.",
    direcao: "Reta. Direta. Sem desvio.",
    profundidade: "Uniforme. Firme.",
  },
  long_curved: {
    comprimento: "Longa. Extensa.",
    direcao: "Mergulha pro Monte da Lua.",
    profundidade: "Constante. Sem interrupção.",
  },
  long_deep_curved: {
    comprimento: "Muito longa. Quase toca a borda.",
    direcao: "Curva profunda pra Lua.",
    profundidade: "Profunda. Marcada. Pesada.",
  },
  short_straight: {
    comprimento: "Curta. Para antes do centro.",
    direcao: "Reta. Pragmática.",
    profundidade: "Firme. Compacta.",
  },
  short_curved: {
    comprimento: "Curta. Compacta.",
    direcao: "Curva leve. Intuitiva.",
    profundidade: "Média. Suave.",
  },
  medium_straight: {
    comprimento: "Média. Comprimento padrão.",
    direcao: "Reta. Sem desvio.",
    profundidade: "Moderada. Estável.",
  },
  medium_curved: {
    comprimento: "Média.",
    direcao: "Curva suave presente.",
    profundidade: "Equilibrada.",
  },
  faint: {
    comprimento: "Extensão difícil de medir.",
    direcao: "Direção sutil.",
    profundidade: "Fraca. Discreta. Presente, mas quieta.",
  },
} as const;

export const LIFE_MEASUREMENTS: Record<LifeVariation, MeasurementSet> = {
  long_deep: {
    arco: "Extenso. Contorna generosamente.",
    monte_venus: "Pronunciado, firme.",
    profundidade: "Profunda. Constante até o pulso.",
  },
  long_faint: {
    arco: "Extenso, mas suave.",
    monte_venus: "Moderado.",
    profundidade: "Tênue. Presente mas sem força.",
  },
  short_deep: {
    arco: "Curto. Para cedo.",
    monte_venus: "Contido.",
    profundidade: "Funda enquanto dura.",
  },
  short_faint: {
    arco: "Curto e suave.",
    monte_venus: "Discreto.",
    profundidade: "Fraca. Pede atenção.",
  },
  curved_wide: {
    arco: "Arco largo. Generoso.",
    monte_venus: "Pronunciado. Vênus cheio.",
    profundidade: "Consistente. Forte.",
  },
  curved_tight: {
    arco: "Arco fechado. Perto do polegar.",
    monte_venus: "Contido. Reservado.",
    profundidade: "Presente, firme.",
  },
  broken_restart: {
    arco: "Interrompido. Recomeça mais fundo.",
    monte_venus: "Varia.",
    profundidade: "Mais funda na segunda fase.",
  },
  chained: {
    arco: "Ondulado. Oscilante.",
    monte_venus: "Moderado.",
    profundidade: "Irregular. Vai e volta.",
  },
} as const;

export const FATE_MEASUREMENTS: Record<FateVariation, MeasurementSet> = {
  present_deep: {
    inicio: "Do pulso ou perto.",
    direcao: "Firme em direção a Saturno.",
    terminacao: "Forte. Sem bifurcação.",
  },
  present_faint: {
    inicio: "Início indefinido.",
    direcao: "Sutil. Pra cima, mas hesitante.",
    terminacao: "Suave.",
  },
  broken: {
    inicio: "Começa, para, recomeça.",
    direcao: "Muda de direção após a pausa.",
    terminacao: "A segunda fase é mais forte.",
  },
  multiple: {
    inicio: "Múltiplos pontos de início.",
    direcao: "Direções paralelas subindo.",
    terminacao: "Várias terminações.",
  },
  late_start: {
    inicio: "Começa no meio da palma.",
    direcao: "Firme quando começa.",
    terminacao: "Sólida. Sem hesitação.",
  },
  absent: {
    inicio: "Sem linha visível",
    direcao: "Sem linha visível",
    terminacao: "Sem linha visível",
  },
} as const;
