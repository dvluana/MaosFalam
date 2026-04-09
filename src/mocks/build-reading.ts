import rawBlocks from "@/mocks/reading-blocks.json";
import type { ReadingBlock } from "@/types/reading-block";
import type {
  CompatibilityEntry,
  HandElement,
  LineName,
  MountDetail,
  Reading,
  ReadingReport,
  ReadingSection,
  ReadingStats,
} from "@/types/reading";

/**
 * Constrói uma leitura mock em memória a partir de reading-blocks.json
 * combinado com curadoria específica por elemento. Substitui os antigos
 * reading-{fire,water,earth,air}.json, eliminando a duplicação dos textos
 * base de elemento/linhas que já moram no banco de blocos.
 */

const BLOCKS = rawBlocks as ReadingBlock[];

interface LinePick {
  axis: "heart" | "head" | "life" | "fate";
  variation: string;
  symbol: string;
  planet: string;
  tagline: string;
}

interface SectionExtras {
  intro_suffix?: string;
  body_extras: string[];
  cigana_quotes: string[];
  technical: string[];
  impact_phrase: string;
}

interface ElementMock {
  id: string;
  share_token: string;
  user_name: string;
  title: string;
  lines: {
    heart: LinePick;
    head: LinePick;
    life: LinePick;
    fate: LinePick;
  };
  sections: Record<LineName, SectionExtras>;
  mounts: MountDetail[];
  crosses: Array<{ content: string }>;
  rare_signs: Array<{ name: string; content: string }>;
  compatibility: CompatibilityEntry[];
  intimacy: NonNullable<ReadingReport["intimacy"]>;
  stats: ReadingStats;
}

function findBlock(
  axis: ReadingBlock["axis"],
  variation: string,
  block_type: ReadingBlock["block_type"],
): string {
  const match = BLOCKS.find(
    (b) =>
      b.axis === axis &&
      b.variation === variation &&
      b.block_type === block_type,
  );
  if (!match) {
    throw new Error(
      `Bloco não encontrado: ${axis}/${variation}/${block_type}`,
    );
  }
  return match.content;
}

function replaceName(text: string, name: string): string {
  return text.replace(/\{\{name\}\}/g, name);
}

// ============================================================
// Curadoria por elemento. Textos curtos (intro/body/impact) vêm
// dos blocos; aqui ficam só os extras que não estão lá.
// ============================================================

const FIRE: ElementMock = {
  id: "mock-fire-001",
  share_token: "fire-marina-xyz",
  user_name: "Marina",
  title: "Fogo",
  lines: {
    heart: {
      axis: "heart",
      variation: "heart_long_straight",
      symbol: "♀",
      planet: "Vênus",
      tagline: "Como você ama",
    },
    head: {
      axis: "head",
      variation: "head_long_curved",
      symbol: "☿",
      planet: "Mercúrio",
      tagline: "Como você pensa",
    },
    life: {
      axis: "life",
      variation: "life_long_deep",
      symbol: "☉",
      planet: "Sol",
      tagline: "O que você já viveu",
    },
    fate: {
      axis: "fate",
      variation: "fate_present_deep",
      symbol: "♄",
      planet: "Saturno",
      tagline: "Pra onde você vai",
    },
  },
  sections: {
    heart: {
      body_extras: [
        "Perto do Monte de Júpiter, bem na base do indicador, tem uma marca que me parou. Na quiromancia clássica, isso significa que você escolhe quem ama com a cabeça. Não por frieza. Por padrão. Você busca alguém que admira, não só que deseja. Quando o respeito acaba antes da paixão, você vai embora antes da paixão acabar.",
        "A profundidade da linha mostra alguém que sente em alta definição. Cada toque fica. Cada ausência fica mais. As pessoas acham que você é fria quando termina. Você não é fria. Você é cirúrgica. A dor tá lá. Só que você decidiu que ninguém vai ver, e o que você decide em silêncio é lei.",
      ],
      cigana_quotes: [
        "Você não faz amor pela metade. E quando acaba, acaba como se nunca tivesse existido. Só que existiu. E você lembra de cada detalhe.",
      ],
      technical: [
        "COMPRIMENTO: LONGA, TERMINA NO MONTE DE JÚPITER",
        "CURVATURA: RETA, SEM DESVIO",
        "PROFUNDIDADE: ACENTUADA, SEM CORRENTES",
      ],
      impact_phrase:
        "Quando você ama, é tudo. Quando sai, queima o caminho. E não olha pra trás.",
    },
    head: {
      body_extras: [
        "A linha é longa. Passa do centro da palma e continua mergulhando em direção ao Monte da Lua, que é a área da imaginação. Na quiromancia clássica, essa curva profunda é a marca do artista. Não necessariamente alguém que pinta. Alguém que vê o mundo com uma lente que os outros não têm.",
        "A profundidade é uniforme. Sem ilhas, sem correntes. Isso significa clareza mental sustentada. Sua mente não colapsa sob pressão. Mesmo nos piores momentos da sua vida, foi a cabeça que te tirou.",
      ],
      cigana_quotes: [
        "Todo mundo olha pro pixel. Você vê o quadro completo. E isso é solidão e superpoder ao mesmo tempo.",
      ],
      technical: [
        "COMPRIMENTO: LONGA, PASSA DO CENTRO",
        "DIREÇÃO: QUEDA PROFUNDA PRO MONTE DA LUA",
        "PROFUNDIDADE: UNIFORME, SEM ILHAS",
      ],
      impact_phrase:
        "Não é sonhadora solta. É sonhadora que executa. E isso é mais raro do que você imagina.",
    },
    life: {
      body_extras: [
        "A linha faz um arco largo em torno do Monte de Vênus. Generosa. Isso significa que você tem muito pra dar. Tempo, presença, energia, afeto. E dá sem calcular.",
        "A linha termina forte, perto do pulso, sem afinar. Isso é resistência que não enfraquece com o tempo.",
      ],
      cigana_quotes: [
        "Você já recomeçou mais vezes do que a maioria teria coragem. E ninguém te agradeceu por nenhuma delas.",
      ],
      technical: [
        "ARCO: LARGO, GENEROSO SOBRE VÊNUS",
        "MONTE DE VÊNUS: PRONUNCIADO, FIRME",
        "PROFUNDIDADE: CONSTANTE ATÉ O PULSO",
      ],
      impact_phrase:
        "Você levanta. Sempre levanta. E ninguém imagina o peso do que você deixou pra trás pra poder levantar.",
    },
    fate: {
      body_extras: [
        "A linha não começa no pulso. Começa mais acima, quase no meio da palma. Isso é destino tardio. Sua primeira metade de vida foi ensaio. Cada coisa errada te levou pra direção certa.",
        "A terminação é em Saturno, firme. Não hesita, não bifurca, não se perde. Isso é o tipo de destino que chega tarde mas chega certo.",
      ],
      cigana_quotes: [
        "Planos mudam. Propósito permanece. O seu aponta pra frente. E pra cima.",
      ],
      technical: [
        "INÍCIO: TARDIO, MEIO DA PALMA",
        "DIREÇÃO: FIRME EM DIREÇÃO A SATURNO",
        "TERMINAÇÃO: FORTE, SEM BIFURCAÇÃO",
      ],
      impact_phrase:
        "Você não seguiu o caminho que esperavam. E por isso tá indo pra lugares que eles nem sabem que existem.",
    },
  },
  mounts: [
    {
      name: "Monte de Júpiter",
      planet_symbol: "♃",
      strength: 85,
      word: "Dominante",
      content:
        "Seu Monte de Júpiter é pronunciado. Na base do indicador, a área da ambição e da liderança. Você quer mais. Sempre quis. Não é ganância. É um motor interno que nunca desliga. As pessoas te seguem sem você pedir. Olham pra você quando a situação complica. Porque você tem a postura de quem vai encontrar.",
      cigana_quote:
        "Quando você entra numa sala, as pessoas sentem. Mesmo em silêncio.",
    },
    {
      name: "Monte de Mercúrio",
      planet_symbol: "☿",
      strength: 88,
      word: "Dominante",
      content:
        "Mercúrio é o mais forte da sua mão. Na base do mindinho, a área da comunicação e da inteligência verbal. Você convence sem levantar a voz. Sabe escolher as palavras exatas pra cada situação. Quando quer convencer, convence. Quando quer machucar, machuca. E sabe a diferença.",
      cigana_quote:
        "Você lê as pessoas como eu leio mãos. Sem elas perceberem que tão sendo lidas.",
    },
    {
      name: "Monte de Vênus",
      planet_symbol: "♀",
      strength: 78,
      word: "Forte",
      content:
        "Vênus pronunciado. A base do polegar, cheia, firme. Sensualidade e calor. Você precisa de toque, de presença física. Mensagem não basta. Ligação não basta. Você precisa do corpo. Do abraço que aperta, da mão que segura, do olho que olha.",
    },
  ],
  crosses: [
    {
      content:
        "A Linha do Coração reta cruzando com a Linha da Cabeça longa cria um dos cruzamentos mais difíceis de carregar. Sua cabeça decide rápido. Seu coração decide junto, mas pela mesma lógica da cabeça, só que com peso emocional em cima. Isso te faz eficiente em cortar vínculos. E devastada na madrugada seguinte.",
    },
    {
      content:
        "Linha da Vida com arco largo e Monte de Vênus pronunciado. Generosidade em dobro. Você entrega energia e presença física ao mesmo tempo, sem calcular. Ninguém devolve na mesma proporção, porque poucas pessoas sabem receber a quantidade que você oferece.",
    },
  ],
  rare_signs: [
    {
      name: "Estrela no Monte de Júpiter",
      content:
        "Tem uma estrela no seu Monte de Júpiter. Isso é um dos sinais mais positivos da quiromancia. Sucesso que parece sorte mas é competência acumulada. Algo que você vem construindo vai dar resultado. E quando der, as pessoas vão dizer 'que sorte'. Não é sorte. Você sabe. Elas não.",
    },
    {
      name: "Cruz Mística",
      content:
        "No centro da sua palma, entre a Linha do Coração e a Linha da Cabeça, tem uma Cruz Mística. Esse sinal aparece em poucas mãos. Mostra intuição fora do padrão. Você sente coisas antes de acontecerem. Padrões que os outros não veem, você vê.",
    },
  ],
  compatibility: [
    {
      pair: "Fogo + Ar",
      word: "Faísca",
      description:
        "Conversa que vira desejo. Você se apaixona pela mente antes do corpo. E quando o corpo chega, já tá tarde demais pra fingir indiferença.",
    },
    {
      pair: "Fogo + Água",
      word: "Vapor",
      description:
        "Paixão que consome. Bonito enquanto evapora. Intenso, dramático, curto. Daqueles que a gente lembra pra sempre mas não repete.",
    },
    {
      pair: "Fogo + Terra",
      word: "Fundação",
      description:
        "Impossível de largar. Construção silenciosa que cresce enquanto ninguém percebe. Pouco fogo visível, muito calor embaixo.",
    },
    {
      pair: "Fogo + Fogo",
      word: "Incêndio",
      description:
        "Lindo enquanto dura. E não dura. Dois motores no mesmo carro, puxando pro mesmo lado até um dos dois queimar.",
    },
  ],
  intimacy: {
    title: "Intimidade & Desejo",
    subtitle: "Cinturão de Vênus · Monte de Vênus · Linha do Coração",
    quote:
      "Você não é de muitos. Mas quando é de alguém, essa pessoa não vai esquecer. Nem que tente.",
    body: [
      "Na sua mão tem um Cinturão de Vênus. Um semicírculo sutil acima da Linha do Coração. Esse sinal entrega hipersensibilidade emocional e sensorial. Você não só sente suas próprias emoções com intensidade. Sente as dos outros. Na cama, isso significa que você não funciona com parceiro distraído. Você percebe a atenção dividida, o carinho performático, a pressa disfarçada de desejo. E quando percebe, desliga.",
      "Seu Monte de Vênus é pronunciado e firme, o que mostra um corpo que precisa de presença real pra se entregar. Quando se abre, o nível de presença é assustador. Quem já esteve ali sabe.",
      "Seu gatilho não é físico. É mental. Você precisa ser vista pela inteligência antes de ser tocada. Precisa de alguém que entenda o que você não disse. Aí, e só aí, o corpo responde. E quando responde, responde inteiro.",
    ],
    cigana_quotes: [
      "Você não quer ser querida. Você quer ser lida. E quase ninguém sabe a diferença.",
      "Quando você finalmente se entrega, a pessoa recebe uma versão sua que quase ninguém viu.",
      "",
    ],
    technical: [
      "CINTURÃO DE VÊNUS: PRESENTE, SINAL RARO",
      "MONTE DE VÊNUS: PRONUNCIADO, FIRME",
      "PERFIL ÍNTIMO: INTENSO + IMAGINATIVO",
    ],
  },
  stats: {
    lines: 4,
    mounts: 6,
    dominant_planet: "Mercúrio",
    rare_signs: 2,
    rarity_percent: 18,
  },
};

const WATER: ElementMock = {
  id: "mock-water-001",
  share_token: "water-camila-abc",
  user_name: "Camila",
  title: "Água",
  lines: {
    heart: {
      axis: "heart",
      variation: "heart_long_curved",
      symbol: "♀",
      planet: "Vênus",
      tagline: "Como você ama",
    },
    head: {
      axis: "head",
      variation: "head_long_deep_curved",
      symbol: "☿",
      planet: "Mercúrio",
      tagline: "Como você pensa",
    },
    life: {
      axis: "life",
      variation: "life_long_deep",
      symbol: "☉",
      planet: "Sol",
      tagline: "O que você já viveu",
    },
    fate: {
      axis: "fate",
      variation: "fate_present_faint",
      symbol: "♄",
      planet: "Saturno",
      tagline: "Pra onde você vai",
    },
  },
  sections: {
    heart: {
      body_extras: [
        "Perto do Monte de Júpiter tem uma curvatura mais acentuada. Isso é sensibilidade amplificada no momento do vínculo. Você percebe coisas que a outra pessoa nem sabe que tá sentindo. Tristeza disfarçada de cansaço. Medo disfarçado de pressa. Você acolhe tudo.",
        "A profundidade da linha é sutil, mas contínua. Isso mostra um coração que não explode. Ele transborda em silêncio. Quando você tá magoada, ninguém vê na primeira hora, nem na segunda.",
      ],
      cigana_quotes: [
        "Você não quer alguém que grite que te ama. Quer alguém que fique, calado, do lado, sem precisar explicar por quê.",
      ],
      technical: [
        "COMPRIMENTO: LONGA, CURVADA PARA CIMA",
        "CURVATURA: PROFUNDA, EM ARCO SUAVE",
        "PROFUNDIDADE: SUTIL MAS CONTÍNUA",
      ],
      impact_phrase:
        "Você ama com profundidade, não com intensidade. E isso é raro demais pra quem tem pressa.",
    },
    head: {
      body_extras: [
        "A queda da linha pro Monte da Lua é acentuada, quase um mergulho. Na quiromancia clássica isso é a marca do artista interior. De quem vê beleza onde os outros só veem rotina.",
        "A linha começa levemente separada da Linha da Vida. Isso marca independência emocional precoce. Você aprendeu cedo a pensar sozinha.",
      ],
      cigana_quotes: [
        "Três da manhã, você deitada, pensando em conversas que nunca vão acontecer. Isso não é insônia. É seu cérebro finalmente achando espaço pra trabalhar.",
      ],
      technical: [
        "COMPRIMENTO: LONGA, CAI PRO MONTE DA LUA",
        "DIREÇÃO: QUEDA ACENTUADA",
        "PROFUNDIDADE: BEM TRAÇADA, SEM ILHAS",
      ],
      impact_phrase:
        "Você vê o mundo com uma lente que os outros não têm. E isso é solidão e superpoder ao mesmo tempo.",
    },
    life: {
      body_extras: [
        "O arco da linha é largo, generoso. Você tem muito pra dar. Tempo, escuta, presença. O corpo responde à sua vontade na maior parte do tempo, mas cobra caro quando você ignora os sinais.",
        "A linha termina firme, perto do pulso. Isso é resistência que dura. Sua força não é barulhenta. É de fundo.",
      ],
      cigana_quotes: [
        "Você não se reconstruiu sozinha. Só não viu as mãos que estavam te segurando, porque não tinham rosto.",
      ],
      technical: [
        "ARCO: AMPLO, GENEROSO SOBRE VÊNUS",
        "LINHA IRMÃ: PRESENTE, PARALELA",
        "TERMINAÇÃO: FORTE PERTO DO PULSO",
      ],
      impact_phrase:
        "Você não se reconstruiu sozinha. Só não viu as mãos que estavam te segurando.",
    },
    fate: {
      body_extras: [
        "Seu destino é relacional, conectado. Você vai pra lugares porque conheceu alguém, porque uma conversa mudou tudo. Você não avança no vácuo. Avança no vínculo.",
        "A terminação aponta pra Saturno com firmeza, mas tem uma pequena segunda linha se formando paralelamente perto do fim. Isso mostra que o seu propósito vai se bifurcar de novo no futuro.",
      ],
      cigana_quotes: [
        "Sua intuição te tirou de lugares onde sua cabeça teria te deixado ficar. E você ainda duvida dela.",
      ],
      technical: [
        "INÍCIO: MONTE DA LUA, RARO",
        "DIREÇÃO: SOBE FIRME A SATURNO",
        "TERMINAÇÃO: FIRME EM SATURNO",
      ],
      impact_phrase:
        "Seu caminho não foi escolhido com régua. Foi escolhido com aquela sensação no peito que quase ninguém entende.",
    },
  },
  mounts: [
    {
      name: "Monte da Lua",
      planet_symbol: "☽",
      strength: 90,
      word: "Dominante",
      content:
        "A Lua é o monte mais forte da sua mão. Na borda oposta ao polegar. Isso é imaginação e intuição em níveis que assustam você mesma. Você sonha acordada. Constrói cenários inteiros antes do café da manhã. Sente ambientes como quem lê uma sala inteira em dois segundos.",
      cigana_quote:
        "Seu mundo interno é maior que o de fora. Você vive dois ao mesmo tempo. E nenhum descansa.",
    },
    {
      name: "Monte de Saturno",
      planet_symbol: "♄",
      strength: 72,
      word: "Forte",
      content:
        "Saturno bem marcado, na base do médio. Isso mostra responsabilidade emocional elevada. Você carrega coisas que não são suas. Problemas dos outros, culpas dos outros. Você precisa aprender que acolher não é o mesmo que adotar.",
      cigana_quote:
        "Você carrega cansaço de gente que nem sabe que você carrega. E essa gente continua dormindo bem.",
    },
    {
      name: "Monte de Vênus",
      planet_symbol: "♀",
      strength: 75,
      word: "Forte",
      content:
        "Vênus firme e sensível, na base do polegar. Você vive pelo toque, pelo cheiro, pela presença física. Quando tem, entrega um tipo de presença que vicia quem recebe.",
    },
  ],
  crosses: [
    {
      content:
        "A Linha do Coração curvada cruzando com a Linha da Cabeça que mergulha no Monte da Lua cria uma tensão bonita e pesada. Seu coração sente muito. Sua cabeça imagina tudo que o coração sente. Juntos, eles constroem cenários emocionais que outras pessoas nem sabem que existem.",
    },
    {
      content:
        "Linha do Destino nascida no Monte da Lua cruzando com Monte de Saturno forte marca o tipo de pessoa cujo propósito nasceu da própria sensibilidade. Você não virou quem virou apesar de sentir demais. Virou quem virou exatamente por causa disso.",
    },
  ],
  rare_signs: [
    {
      name: "Cruz Mística",
      content:
        "No centro da sua palma, entre a Linha do Coração e a Linha da Cabeça, tem uma Cruz Mística. Esse sinal aparece em poucas mãos. Mostra intuição fora do padrão. Você já avisou alguém que algo ia dar errado e ninguém te ouviu. Deu errado. Eles se desculparam. Você disse 'tudo bem'. Não tava.",
    },
    {
      name: "Linha de Intuição",
      content:
        "Na borda da sua palma, uma semicurva liga o Monte da Lua ao Monte de Mercúrio. Mostra percepção extrassensorial prática. Você lê pessoas como texto aberto. Sabe quando alguém mente, quando alguém esconde, quando o 'tô bem' não é verdade.",
    },
  ],
  compatibility: [
    {
      pair: "Água + Fogo",
      word: "Vapor",
      description:
        "Paixão que consome. Bonito enquanto evapora. Você derrete, a pessoa queima, e o que sobra é um cheiro que demora a sair da casa.",
    },
    {
      pair: "Água + Terra",
      word: "Raiz",
      description:
        "Base profunda. Cresce devagar, dura pra sempre. A pessoa que você não precisa explicar. A única categoria que você dorme tranquila.",
    },
    {
      pair: "Água + Ar",
      word: "Névoa",
      description:
        "Conversa que desaparece quando o sol nasce. Bonito de longe, vazio de perto. Você sai achando que viveu algo e descobre que só imaginou.",
    },
    {
      pair: "Água + Água",
      word: "Oceano",
      description:
        "Profundidade dobrada. Ou afoga, ou salva. Não existe meio-termo. E vocês dois sabem disso desde o primeiro olhar.",
    },
  ],
  intimacy: {
    title: "Intimidade & Desejo",
    subtitle: "Cinturão de Vênus · Monte da Lua · Linha do Coração",
    quote:
      "Você não dorme com qualquer um. Você dorme com quem consegue entrar na sua cabeça primeiro.",
    body: [
      "Na sua mão tem um Cinturão de Vênus bem visível. Esse sinal entrega hipersensibilidade emocional e sensorial. Você percebe a atenção dividida, o carinho automático, a pressa disfarçada de desejo. E quando percebe, desliga.",
      "Seu Monte de Vênus é firme e sensível, não exagerado. Você precisa de lentidão. De toque que sabe o que tá fazendo. O que alguém faz no seu corpo, fica.",
      "Seu gatilho é conversa. Mas não qualquer conversa. Você precisa que alguém te leia o subtexto. Que entenda o que você não disse. Quando alguém faz isso, seu corpo responde antes de você decidir que ia responder.",
    ],
    cigana_quotes: [
      "Você não quer ser tocada. Quer ser compreendida. E aí sim, tocada. Nessa ordem. Nunca o contrário.",
      "Quem te teve uma vez inteira, nunca mais consegue ter ninguém do mesmo jeito.",
      "",
    ],
    technical: [
      "CINTURÃO DE VÊNUS: PRESENTE, SINAL RARO",
      "MONTE DE VÊNUS: FIRME, SENSÍVEL",
      "PERFIL ÍNTIMO: PROFUNDO + INTUITIVO",
    ],
  },
  stats: {
    lines: 4,
    mounts: 6,
    dominant_planet: "Lua",
    rare_signs: 2,
    rarity_percent: 22,
  },
};

const EARTH: ElementMock = {
  id: "mock-earth-001",
  share_token: "earth-beatriz-abc",
  user_name: "Beatriz",
  title: "Terra",
  lines: {
    heart: {
      axis: "heart",
      variation: "heart_medium_straight",
      symbol: "♀",
      planet: "Vênus",
      tagline: "Como você ama",
    },
    head: {
      axis: "head",
      variation: "head_short_straight",
      symbol: "☿",
      planet: "Mercúrio",
      tagline: "Como você pensa",
    },
    life: {
      axis: "life",
      variation: "life_curved_wide",
      symbol: "☉",
      planet: "Sol",
      tagline: "O que você já viveu",
    },
    fate: {
      axis: "fate",
      variation: "fate_late_start",
      symbol: "♄",
      planet: "Saturno",
      tagline: "Pra onde você vai",
    },
  },
  sections: {
    heart: {
      body_extras: [
        "A linha é firme, constante, sem ilhas. Você consegue distinguir o que te acende do que te sustenta. E escolhe o que sustenta. Porque você aprendeu cedo que casa construída em fogo queima antes do primeiro inverno.",
        "A profundidade é uniforme até o Monte de Saturno. Isso mostra lealdade em camadas. Você não ama em pico e vale. Ama em linha reta, no mesmo nível, todo dia.",
      ],
      cigana_quotes: [
        "Você não ama pouco. Você ama devagar. E quem confunde as duas coisas merece mesmo ser deixado.",
      ],
      technical: [
        "COMPRIMENTO: MÉDIA, ATÉ O INDICADOR",
        "CURVATURA: RETA, MEDIDA",
        "PROFUNDIDADE: FIRME, CONSTANTE",
      ],
      impact_phrase:
        "Você ama devagar e por inteiro. E quem confunde devagar com pouco nunca entendeu nada de você.",
    },
    head: {
      body_extras: [
        "A linha corre horizontal, firme, sem mergulho pro Monte da Lua. Isso é pensamento concreto. Enquanto os outros discutem a teoria, você já escolheu o fornecedor, negociou o preço e mandou o contrato.",
        "A profundidade é bem marcada. Clareza mental sustentada. Sua cabeça não entra em pânico. Ela desacelera, avalia, executa.",
      ],
      cigana_quotes: [
        "Enquanto os outros tão imaginando, você já entregou. E ainda tem gente achando que você é sortuda.",
      ],
      technical: [
        "COMPRIMENTO: CURTA, RETA",
        "DIREÇÃO: HORIZONTAL, SEM QUEDA",
        "PROFUNDIDADE: BEM TRAÇADA, SEM ILHAS",
      ],
      impact_phrase:
        "Você já tinha a resposta no minuto três. Os outros cinquenta e sete minutos foram tortura educada.",
    },
    life: {
      body_extras: [
        "O arco abraça o Monte de Vênus com folga. Isso é vitalidade física que sustenta vitalidade emocional. Você aguenta. Aguenta jornada, aguenta crise, aguenta parente difícil, aguenta projeto impossível.",
        "A linha termina firme, perto do pulso, sem afinar, sem bifurcar. Cada ano te deixa mais nítida, menos disponível pra bobagem.",
      ],
      cigana_quotes: [
        "Você construiu tanto em silêncio que ninguém sabe o tamanho da sua casa por dentro.",
      ],
      technical: [
        "ARCO: LARGO, GENEROSO SOBRE VÊNUS",
        "MONTE DE VÊNUS: FIRME, PRONUNCIADO",
        "TERMINAÇÃO: FORTE, SEM BIFURCAÇÃO",
      ],
      impact_phrase:
        "Você dá sem calcular. Até o dia em que o preço aparece. E aí você corta sem aviso.",
    },
    fate: {
      body_extras: [
        "A linha sobe firme em direção ao Monte de Saturno, sem curva, sem hesitação. Isso é rota escolhida, não rota herdada. Você não faz o que esperavam. Faz o que decidiu.",
        "A terminação em Saturno é firme. Você não vai anunciar o que tá construindo. Vai construir. E um dia os outros vão levantar os olhos e perceber.",
      ],
      cigana_quotes: [
        "Quando você decide, acontece. Sem barulho. Sem discurso. Só acontece.",
      ],
      technical: [
        "INÍCIO: TARDIO, MEIO DA PALMA",
        "DIREÇÃO: FIRME EM DIREÇÃO A SATURNO",
        "TERMINAÇÃO: FORTE, SEM BIFURCAÇÃO",
      ],
      impact_phrase:
        "Você não seguiu destino de ninguém. Criou o próprio. E ninguém pode dizer que te deram de mão beijada.",
    },
  },
  mounts: [
    {
      name: "Monte de Saturno",
      planet_symbol: "♄",
      strength: 88,
      word: "Dominante",
      content:
        "Saturno é o mais forte da sua mão. Na base do dedo médio, a área da disciplina e do peso. Você carrega coisas que não são suas. Decisões dos outros. Problemas dos outros. E carrega como se fossem. Enquanto os outros terceirizam, você absorve.",
      cigana_quote:
        "Você carrega o que não é seu. Sempre carregou. E ninguém percebe o peso porque você nunca deixou cair.",
    },
    {
      name: "Monte de Júpiter",
      planet_symbol: "♃",
      strength: 78,
      word: "Forte",
      content:
        "Júpiter bem marcado, na base do indicador. Ambição silenciosa que não pede microfone. Enquanto os outros contam o que vão fazer, você já tá na terceira fase do que nem contou que começou.",
    },
    {
      name: "Monte de Vênus",
      planet_symbol: "♀",
      strength: 72,
      word: "Forte",
      content:
        "Vênus firme, carnudo, sem exagero. Você precisa de presença real. Não funciona com afeto por mensagem. Precisa do corpo na mesma casa, do cheiro na mesma roupa, da respiração no mesmo sofá.",
      cigana_quote:
        "Você não promete nada que não vai cumprir. E é por isso que quem fica, fica.",
    },
  ],
  crosses: [
    {
      content:
        "A Linha do Coração medida cruzando com uma Linha da Cabeça curta e reta cria um dos padrões mais raros de estabilidade emocional. Você não vive o amor como tempestade. Vive como arquitetura. Primeiro a fundação, depois a parede, depois o teto.",
    },
    {
      content:
        "Linha do Destino tardia atravessando um Monte de Júpiter forte. Isso mostra ambição que ficou guardada até o momento certo. Enquanto os outros gastaram a fome cedo, você chegou na mesa com fome inteira.",
    },
  ],
  rare_signs: [
    {
      name: "Quadrado Protetor",
      content:
        "Tem um quadrado nítido sobre a sua Linha da Vida, mais ou menos no trecho central. Proteção sobre algo que deveria ter te destruído e não destruiu. Não é sorte. É estrutura. Você já tinha construído tanta base antes do tombo que o tombo bateu na base e não chegou em você.",
    },
    {
      name: "Triângulo Central",
      content:
        "No centro da sua palma, formado pela intersecção de três linhas, tem um pequeno triângulo. Um dos sinais mais raros. Mostra equilíbrio simultâneo entre mente, coração e ação. A maioria das pessoas consegue fazer duas dessas três coisas juntas. Você faz as três.",
    },
  ],
  compatibility: [
    {
      pair: "Terra + Fogo",
      word: "Fundação",
      description:
        "Você segura o que o fogo quer queimar. Ele te acende, você o sustenta. Funciona enquanto ele respeitar que sua base não negocia.",
    },
    {
      pair: "Terra + Água",
      word: "Raiz",
      description:
        "Base profunda. Cresce devagar, dura pra sempre. Ninguém entende por fora. Por dentro é a coisa mais sólida que pode existir.",
    },
    {
      pair: "Terra + Ar",
      word: "Poeira",
      description:
        "Bonito no movimento. Ele vem com ideia, você vem com execução. O risco é ele se cansar do concreto antes de você se cansar da teoria.",
    },
    {
      pair: "Terra + Terra",
      word: "Montanha",
      description:
        "Imóvel. Eterno. Previsível no melhor sentido. Sem surpresa, sem drama, sem tempo perdido.",
    },
  ],
  intimacy: {
    title: "Intimidade & Desejo",
    subtitle: "Monte de Vênus · Linha do Coração · Linha do Casamento",
    quote:
      "Você não promete nada que não vai cumprir. E é por isso que quem fica, fica.",
    body: [
      "Seu Monte de Vênus é firme, carnudo, sem excesso. Sensualidade tátil, não performática. Na cama, você não precisa de roteiro. Precisa de alguém que não tenha pressa. Pressa, pra você, mata qualquer desejo antes dele começar.",
      "Você não se entrega por atração crua. Se entrega quando percebe que a outra pessoa é confiável no detalhe. No jeito de tratar o garçom. No jeito de falar da ex. No jeito de cumprir o horário.",
      "Seu gatilho íntimo é a constância. A outra pessoa não precisa ser criativa. Precisa ser consistente. Precisa cumprir pequenas coisas pequenas repetidamente. Isso te desarma mais rápido do que qualquer declaração.",
    ],
    cigana_quotes: [
      "Você não quer ser surpreendida. Você quer ser acreditada. E tem gente que vive a vida inteira sem entender a diferença.",
      "Quando você se entrega, a pessoa recebe uma versão sua que nem a família conhece.",
      "",
    ],
    technical: [
      "MONTE DE VÊNUS: FIRME, CARNUDO, SEM EXCESSO",
      "LINHA DO CASAMENTO: ÚNICA, PROFUNDA",
      "PERFIL ÍNTIMO: CONSTANTE + TÁTIL",
    ],
  },
  stats: {
    lines: 4,
    mounts: 6,
    dominant_planet: "Saturno",
    rare_signs: 2,
    rarity_percent: 31,
  },
};

const AIR: ElementMock = {
  id: "mock-air-001",
  share_token: "air-helena-xyz",
  user_name: "Helena",
  title: "Ar",
  lines: {
    heart: {
      axis: "heart",
      variation: "heart_faint",
      symbol: "♀",
      planet: "Vênus",
      tagline: "Como você ama",
    },
    head: {
      axis: "head",
      variation: "head_long_straight",
      symbol: "☿",
      planet: "Mercúrio",
      tagline: "Como você pensa",
    },
    life: {
      axis: "life",
      variation: "life_long_faint",
      symbol: "☉",
      planet: "Sol",
      tagline: "O que você já viveu",
    },
    fate: {
      axis: "fate",
      variation: "fate_multiple",
      symbol: "♄",
      planet: "Saturno",
      tagline: "Pra onde você vai",
    },
  },
  sections: {
    heart: {
      body_extras: [
        "A linha começa fina e vai diminuindo até quase sumir. Você aprendeu cedo que mostrar emoção é dar munição. Então parou de mostrar. E funcionou tão bem que hoje as pessoas te acham controlada, distante, difícil de ler.",
        "Apesar da fineza, a linha tem direção. Segue em linha reta, sem bifurcação. Você ama com lógica. Não é ausência de sentimento. É sentimento filtrado pela cabeça antes de chegar no peito.",
      ],
      cigana_quotes: [
        "Ninguém te atinge fácil. Mas ninguém te alcança fácil também. E às vezes a diferença entre proteção e solidão é só o quanto tá doendo naquele dia.",
      ],
      technical: [
        "COMPRIMENTO: CURTA, PARA ANTES DO CENTRO",
        "CURVATURA: FINA, QUASE INVISÍVEL",
        "PROFUNDIDADE: FRACA, BLINDADA",
      ],
      impact_phrase:
        "Você guarda tanto que até a linha ficou quieta. Isso não é fraqueza. É blindagem que funcionou bem demais.",
    },
    head: {
      body_extras: [
        "A linha é longa. Atravessa a palma inteira em linha quase reta, horizontal, dominante. Você enxerga consequências a três passos de distância. Planeja antes de agir.",
        "A profundidade é acentuada e uniforme. Clareza mental que não colapsa sob pressão. Mesmo nos piores momentos, sua cabeça continuou funcionando. Foi ela que te tirou.",
      ],
      cigana_quotes: [
        "Sua cabeça já viveu a conversa três vezes antes de você abrir a boca.",
      ],
      technical: [
        "COMPRIMENTO: LONGA, RETA COMO NAVALHA",
        "DIREÇÃO: HORIZONTAL, DOMINANTE",
        "PROFUNDIDADE: ACENTUADA, UNIFORME",
      ],
      impact_phrase:
        "Você ouve, analisa e responde. A resposta quase sempre tá certa. E quase sempre magoa alguém.",
    },
    life: {
      body_extras: [
        "A linha faz um arco largo em torno do Monte de Vênus. Você dá sem calcular. Tempo, atenção, presença, conselho, madrugada no telefone. As pessoas te procuram porque sabem que você vai aparecer.",
        "A profundidade é irregular. Ciclos de exaustão encadeados. Camadas de estresse empilhadas que nunca foram processadas, porque processar exige parar.",
      ],
      cigana_quotes: [
        "Seu corpo tá cansado de pagar contas emocionais que não são suas. E uma hora ele vai parar de pagar sem te consultar.",
      ],
      technical: [
        "ARCO: LARGO, GENEROSO SOBRE VÊNUS",
        "COMPRIMENTO: LONGO, ATÉ O PULSO",
        "PROFUNDIDADE: FINA, IRREGULAR",
      ],
      impact_phrase:
        "O combustível existe. Ele vaza. Não é falta de força. É excesso de portas abertas.",
    },
    fate: {
      body_extras: [
        "Paralela à principal, correndo um pouco à esquerda, tem uma segunda linha mais fraca mas nítida. Três caminhos ao mesmo tempo. Você é a profissional, a criativa, a que escreve, a que ninguém viu ainda.",
        "A terminação da linha principal é em Saturno, firme. Em algum momento as linhas se cruzam e viram uma só, mais grossa, mais definida. Mas esse momento ainda tá à frente.",
      ],
      cigana_quotes: [
        "Você vive vidas paralelas dentro de uma só. E ninguém imagina que a pessoa que chega em casa é diferente da que saiu de manhã.",
      ],
      technical: [
        "INÍCIO: TARDIO, MEIO DA PALMA",
        "DUPLICAÇÃO: TRÊS LINHAS PARALELAS",
        "TERMINAÇÃO: FORTE, SEM BIFURCAÇÃO",
      ],
      impact_phrase:
        "Você vive vidas paralelas dentro de uma só. E a tensão entre elas é exatamente o que te move.",
    },
  },
  mounts: [
    {
      name: "Monte de Mercúrio",
      planet_symbol: "☿",
      strength: 92,
      word: "Dominante",
      content:
        "Mercúrio é o mais forte da sua mão. Na base do mindinho. Você convence sem levantar a voz. Sabe escolher as palavras exatas pra cada situação. Quando quer convencer, convence. Quando quer machucar, machuca. E sabe a diferença.",
      cigana_quote:
        "Você lê as pessoas como eu leio mãos. Sem elas perceberem que tão sendo lidas.",
    },
    {
      name: "Monte da Lua",
      planet_symbol: "☽",
      strength: 82,
      word: "Forte",
      content:
        "Lua marcada, na borda da palma oposta ao polegar. Imaginação fértil, intuição afiada, mundo interno grande demais pra caber na rotina. Sua intuição sobre as pessoas quase nunca erra. O problema é que ninguém acredita em você quando avisa.",
      cigana_quote:
        "Sua imaginação não é hobby. É o sistema operacional da sua mente.",
    },
    {
      name: "Monte de Saturno",
      planet_symbol: "♄",
      strength: 70,
      word: "Forte",
      content:
        "Saturno marcado, na base do dedo médio. Você carrega peso que nem é seu. Decisões dos outros, culpas dos outros, consequências que caíram no seu colo porque você foi a única a manter a cabeça fria quando todo mundo ao redor perdeu a sua.",
    },
  ],
  crosses: [
    {
      content:
        "Linha da Cabeça longa e reta cruzando com uma Linha do Coração fraca cria um dos perfis mais difíceis de ler pra quem tá de fora. Sua cabeça domina seu coração não porque você seja fria, mas porque o coração aprendeu a deixar a cabeça trabalhar primeiro.",
    },
    {
      content:
        "Múltiplas Linhas do Destino atravessando um Mercúrio dominante mostram que a razão pela qual você não escolheu só uma coisa até hoje não é indecisão. É capacidade. Você consegue sustentar três caminhos porque tem ferramenta pra isso.",
    },
  ],
  rare_signs: [
    {
      name: "Cruz Mística",
      content:
        "Entre a Linha do Coração e a Linha da Cabeça, bem no centro da sua palma, tem uma Cruz Mística. Percepção amplificada. Você sente coisas antes de acontecerem, não como premonição mística, mas como leitura rápida de padrões que os outros não leem.",
    },
    {
      name: "Linha de Intuição",
      content:
        "Na borda da palma, do Monte da Lua subindo em direção ao Monte de Mercúrio, tem uma Linha de Intuição. Mostra percepção extrassensorial prática. Você lê pessoas como texto aberto.",
    },
    {
      name: "Anel de Salomão",
      content:
        "Contornando a base do seu indicador tem um semicírculo fino: o Anel de Salomão. Sabedoria natural, não adquirida. As pessoas pedem seus conselhos sem saber direito por quê. Te procuram quando precisam de clareza, não de empatia.",
    },
  ],
  compatibility: [
    {
      pair: "Ar + Fogo",
      word: "Faísca",
      description:
        "Conversa que vira desejo. Rápido, intenso, memorável. Você se apaixona pela mente acesa antes do corpo aparecer.",
    },
    {
      pair: "Ar + Água",
      word: "Névoa",
      description:
        "Vocês sonham juntos, se perdem juntos, esquecem juntos. Bonito enquanto dura.",
    },
    {
      pair: "Ar + Terra",
      word: "Raiz",
      description:
        "Você voa, ela planta. Um ancora o outro. Parece contradição e é, mas é a contradição que funciona quando ninguém tá olhando.",
    },
    {
      pair: "Ar + Ar",
      word: "Tempestade",
      description:
        "Pensamento ao quadrado. Lindo ou ensurdecedor, sem meio-termo. Conversas que viram noites inteiras. E silêncios que viram guerras frias.",
    },
  ],
  intimacy: {
    title: "Intimidade & Desejo",
    subtitle: "Linha da Cabeça · Monte da Lua · Coração sutil",
    quote:
      "Você não se apaixona por rostos. Se apaixona por frases. E quem não entende isso nunca te toca de verdade, por mais que te toque.",
    body: [
      "Sua intimidade começa na cabeça. Muito antes do corpo. A Linha da Cabeça dominante atravessando uma Linha do Coração sutil cria um perfil em que o gatilho real é intelectual. Sem isso, seu corpo fica educado. Participa, cumpre, finge bem. Mas não acende.",
      "Seu Monte da Lua forte amplia tudo. Você tem uma vida imaginária sobre desejo que é maior do que qualquer vida real que já viveu até hoje. Mostra que seu desejo precisa de narrativa pra existir.",
      "Quando você se entrega de verdade, entrega com a cabeça ligada. Você não desliga a mente. Você deixa ela entrar. Quem aguenta esse nível de presença não esquece.",
    ],
    cigana_quotes: [
      "Seu corpo responde depois que sua cabeça permite. E sua cabeça quase nunca permite.",
      "Quando você finalmente se entrega, a pessoa recebe uma versão que não existe em mais lugar nenhum do mundo.",
      "",
    ],
    technical: [
      "MONTE DE VÊNUS: MODERADO, SELETIVO",
      "LINHA DO CASAMENTO: FINA, ÚNICA, TARDIA",
      "PERFIL ÍNTIMO: INTELECTUAL + FANTASIOSO",
    ],
  },
  stats: {
    lines: 4,
    mounts: 6,
    dominant_planet: "Mercúrio",
    rare_signs: 3,
    rarity_percent: 14,
  },
};

const ELEMENT_MOCKS: Record<HandElement, ElementMock> = {
  fire: FIRE,
  water: WATER,
  earth: EARTH,
  air: AIR,
};

function buildSection(
  line: LinePick,
  extras: SectionExtras,
  tier: "free" | "premium",
  name: string,
): ReadingSection {
  const intro = replaceName(
    findBlock(line.axis, line.variation, "intro"),
    name,
  );
  const body = replaceName(
    findBlock(line.axis, line.variation, "body"),
    name,
  );
  return {
    line: line.axis,
    symbol: line.symbol,
    planet: line.planet,
    tier,
    tagline: line.tagline,
    intro,
    body,
    body_extras: extras.body_extras.map((t) => replaceName(t, name)),
    cigana_quotes: extras.cigana_quotes.map((t) => replaceName(t, name)),
    technical: extras.technical,
    impact_phrase: replaceName(extras.impact_phrase, name),
  };
}

export function buildMockReading(
  element: HandElement,
  name?: string,
): Reading {
  const mock = ELEMENT_MOCKS[element];
  const finalName = (name && name.trim()) || mock.user_name;

  const elementBody = replaceName(
    findBlock("element", element, "body"),
    finalName,
  );
  const elementImpact = replaceName(
    findBlock("element", element, "impact"),
    finalName,
  );

  const heart = buildSection(
    mock.lines.heart,
    mock.sections.heart,
    "free",
    finalName,
  );
  const head = buildSection(
    mock.lines.head,
    mock.sections.head,
    "premium",
    finalName,
  );
  const life = buildSection(
    mock.lines.life,
    mock.sections.life,
    "premium",
    finalName,
  );
  const fate = buildSection(
    mock.lines.fate,
    mock.sections.fate,
    "premium",
    finalName,
  );

  const report: ReadingReport = {
    user_name: finalName,
    element: {
      type: element,
      title: mock.title,
      body: elementBody,
      impact: elementImpact,
    },
    sections: [heart, head, life, fate],
    mounts: mock.mounts.map((m) => ({
      ...m,
      content: replaceName(m.content, finalName),
      cigana_quote: m.cigana_quote
        ? replaceName(m.cigana_quote, finalName)
        : undefined,
    })),
    crosses: mock.crosses.map((c) => ({
      content: replaceName(c.content, finalName),
    })),
    rare_signs: mock.rare_signs.map((r) => ({
      name: r.name,
      content: replaceName(r.content, finalName),
    })),
    compatibility: mock.compatibility,
    stats: mock.stats,
    intimacy: {
      ...mock.intimacy,
      quote: replaceName(mock.intimacy.quote, finalName),
      body: mock.intimacy.body.map((t) => replaceName(t, finalName)),
      cigana_quotes: mock.intimacy.cigana_quotes.map((t) =>
        replaceName(t, finalName),
      ),
    },
    share_phrase: elementImpact,
  };

  return {
    id: mock.id,
    tier: "premium",
    share_token: mock.share_token,
    share_expires_at: "2026-05-08T00:00:00.000Z",
    report,
    created_at: "2026-04-08T14:30:00.000Z",
  };
}
