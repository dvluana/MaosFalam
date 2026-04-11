import type { TextBlock } from "@/types/blocks";
import type { RareSignKey } from "@/types/hand-attributes";

export interface RareSignBlock {
  readonly name: string;
  readonly body: TextBlock;
}

export const RARE_SIGN_BLOCKS: Record<RareSignKey, RareSignBlock> = {
  star_jupiter: {
    name: "Estrela no Monte de Júpiter",
    body: {
      content:
        'Estrela no Monte de Júpiter. Um dos sinais mais positivos que existem. Sucesso que parece sorte mas é competência acumulada. Algo que você vem construindo vai dar resultado. Quando der, vão dizer "que sorte". Não é sorte. Você sabe.',
      alt: "Estrela em Júpiter. Reconhecimento vindo. Você plantou. Regou. Esperou. Tá quase.",
      alt2: "Estrela no monte da ambição. Raro. O esforço vai ser recompensado de uma forma que vai surpreender até você.",
    },
  },
  mystic_cross: {
    name: "Cruz Mística",
    body: {
      content:
        'No centro da palma, entre Coração e Cabeça, tem uma Cruz Mística. Aparece em poucas mãos. Intuição fora do padrão. Você sente coisas antes de acontecerem. Padrões que os outros não veem, você vê. Quando diz "eu sabia", não é arrogância. É verdade.',
      alt: "Cruz Mística. Rara. Marca de quem percebe o que tá por trás da superfície. Não adivinha. Lê. Sempre soube fazer isso.",
      alt2: "A Cruz Mística. Radar. Intuição que funciona como sexto sentido. Entra num lugar e já sabe. Conhece alguém e já sabe. Nem sempre consegue explicar.",
    },
  },
  ring_solomon: {
    name: "Anel de Salomão",
    body: {
      content:
        "Anel de Salomão. Semicírculo na base do indicador. Capacidade de ler pessoas. Não é empatia comum. É raio-x. Você vê intenção por trás de ação. Motivação por trás de discurso. Impossível de enganar.",
      alt: "Anel de Salomão. Sabedoria social. Entende gente melhor do que gente entende gente. Não porque estudou. Porque nasceu com isso.",
      alt2: "Salomão na sua mão. Julgamento que assusta. Avalia uma pessoa em segundos. Quase nunca erra.",
    },
  },
  sun_line: {
    name: "Linha do Sol",
    body: {
      content:
        "Linha do Sol. Brilho pessoal. Ilumina ambientes sem forçar. Tem gente que entra num lugar e muda a energia. Você é essa gente. Nem sempre percebe.",
      alt: "Linha do Sol. Carisma natural. Não é performance. É emissão. Atrai oportunidades, pessoas, situações. Sem esforço consciente.",
      alt2: "Sol na mão. Reconhecimento que vem naturalmente. Não precisa se promover. O que faz se promove sozinho.",
    },
  },
  intuition_line: {
    name: "Linha de Intuição",
    body: {
      content:
        "Linha de Intuição. Rara. Pressentimentos que se confirmam. Sempre. Você já duvidou de si mesma. Parou de duvidar. Porque toda vez que ignorou a intuição, se arrependeu.",
      alt: "Linha de Intuição. Antena. Capta sinais que os outros não captam. Não é místico. Seu sistema nervoso processa em camadas que a consciência não acessa.",
      alt2: 'Intuição como linha visível. Poucas mãos têm. Seu inconsciente trabalha mais rápido que seu consciente. Quando algo "parece errado" sem motivo, não é paranoia.',
    },
  },
  protection_marks: {
    name: "Marcas de Proteção",
    body: {
      content:
        "Marcas de proteção. Linhas paralelas em pontos específicos. Alguém cuida de você. Visível ou não. Ancestralidade, universo, ou acaso jogando a seu favor repetidamente. O nome não importa. A proteção é real.",
      alt: "Marcas de proteção. Escudo em áreas vulneráveis. Já escapou de coisas que não deveria ter escapado. Coincidência demais.",
      alt2: "Proteção escrita na mão. Rede de segurança invisível. Não significa que nada vai dar errado. Significa que quando der, algo te segura. Sempre segurou.",
    },
  },
} as const;
