import type { TextBlock } from "@/types/blocks";

export interface CompatBlock {
  readonly pair: string;
  readonly word: string;
  readonly body: TextBlock;
}

export const COMPAT_BLOCKS: Record<string, CompatBlock> = {
  fire_fire: {
    pair: "Fogo + Fogo",
    word: "Incêndio",
    body: {
      content:
        "Incêndio. Lindo enquanto dura. E não dura. Dois motores no mesmo carro, puxando pro mesmo lado até um dos dois queimar.",
      alt: "Fogo com Fogo. Paixão imediata. Destruição garantida. Bonito de longe. Insuportável de perto. Ninguém cede. Então explode.",
      alt2: "Dois Fogos. Energia que enche o espaço inteiro. Enquanto tão juntos, o mundo para. Quando acaba, o mundo demora pra voltar ao normal.",
    },
  },
  fire_water: {
    pair: "Fogo + Água",
    word: "Vapor",
    body: {
      content:
        "Vapor. Paixão que consome. Bonito enquanto evapora. Intenso, dramático, curto. Daqueles que a gente lembra pra sempre mas não repete.",
      alt: "Fogo e Água. Um apaga o outro ou cria nuvem. A tensão é magnética. A incompatibilidade também. Funciona no quarto. Na cozinha, menos.",
      alt2: "Fogo com Água. Ele ferve, ela congela. Ou o contrário. Depende do dia. A paixão é real. A convivência é improvável. Ninguém esquece.",
    },
  },
  fire_earth: {
    pair: "Fogo + Terra",
    word: "Fundação",
    body: {
      content:
        "Fundação. Impossível de largar. Construção silenciosa que cresce enquanto ninguém percebe. Pouco fogo visível, muito calor embaixo.",
      alt: "Fogo e Terra. Um aquece, o outro sustenta. Não é combinação óbvia. Mas é das mais duradouras. Se o Fogo aceitar ir devagar. Se a Terra aceitar se aquecer.",
      alt2: "Fogo com Terra. Demora pra pegar. Mas quando pega, não apaga. Construção lenta, sólida, e quente por dentro.",
    },
  },
  fire_air: {
    pair: "Fogo + Ar",
    word: "Faísca",
    body: {
      content:
        "Faísca. Conversa que vira desejo. Você se apaixona pela mente antes do corpo. E quando o corpo chega, já tá tarde demais pra fingir indiferença.",
      alt: "Fogo e Ar. O Ar alimenta o Fogo. Literalmente. Conversa vira debate, debate vira tensão, tensão vira outra coisa. Estimulante. Viciante.",
      alt2: "Fogo com Ar. Intelectual e passional. Quer discutir filosofia e depois ficar em silêncio juntos. Poucos entendem. Os que entendem ficam.",
    },
  },
  water_water: {
    pair: "Água + Água",
    word: "Mar profundo",
    body: {
      content: "Mar profundo. Entendem sem falar. Também se afogam sem perceber.",
      alt: "Água com Água. Profundidade que se multiplica. Entendem as pausas, os olhares, os silêncios. O risco é se perder dentro do outro e esquecer onde termina um e começa o outro.",
      alt2: "Dois Águas. Fusão emocional. Telepatia afetiva. Sabem o que o outro sente antes de falar. Bonito e sufocante. Porque quando os dois afundam, ninguém puxa ninguém pra cima.",
    },
  },
  water_earth: {
    pair: "Água + Terra",
    word: "Rio e margem",
    body: {
      content: "Rio e margem. Um dá forma, o outro dá direção. Juntos, paisagem.",
      alt: "Água e Terra. Complemento quase perfeito. Terra segura, Água nutre. O problema é quando a Água quer fluir e a Terra quer ficar. Mas quando negociam, criam algo que dura.",
      alt2: "Água com Terra. Estabilidade emocional. Terra dá estrutura, Água dá profundidade. Juntos, constroem algo que nenhum dos dois construiria {{sozinha}}.",
    },
  },
  water_air: {
    pair: "Água + Ar",
    word: "Nuvem",
    body: {
      content:
        "Nuvem. Bonito de longe. Instável de perto. Conversam em frequências diferentes. Mas quando sintonizam, é mágico.",
      alt: "Água e Ar. Um sente, o outro pensa. Água quer profundidade, Ar quer leveza. Encontrar o meio é o desafio.",
      alt2: "Água com Ar. Ela quer mergulhar, ele quer voar. Ou o contrário. Ninguém entende o ritmo do outro. Mas a curiosidade mantém.",
    },
  },
  earth_earth: {
    pair: "Terra + Terra",
    word: "Raiz dupla",
    body: {
      content: "Raiz dupla. Inabalável. Também inflexível. Quando discordam, ninguém cede.",
      alt: "Terra com Terra. Fortaleza. Nada derruba. Também nada muda. Segurança máxima. Espontaneidade mínima. Se os dois aceitarem que rotina é amor, funciona pra sempre.",
      alt2: "Dois Terras. Construção mútua. Tijolo por tijolo. Sem pressa, sem drama, sem surpresa. A melhor história às vezes é a que não tem plot twist.",
    },
  },
  earth_air: {
    pair: "Terra + Ar",
    word: "Contraste",
    body: {
      content:
        "Contraste. Terra quer raiz. Ar quer voo. Funciona quando um admira o que não tem no outro. Quebra quando tenta mudar o outro.",
      alt: "Terra e Ar. Prático e teórico. Concreto e abstrato. Conversam sobre tudo e concordam em nada. Mas a diferença atrai. E quando respeita, ensina.",
      alt2: "Terra com Ar. Um planeja, o outro executa. Ou o contrário. Quando cada um ocupa seu lugar, é parceria real. Quando invade o território do outro, é guerra silenciosa.",
    },
  },
  air_air: {
    pair: "Ar + Ar",
    word: "Ventania",
    body: {
      content:
        "Ventania. Conversam por horas. Ideias que se alimentam, se provocam, se multiplicam. Terminar uma discussão é impossível. Terminar a relação também.",
      alt: "Ar com Ar. Mente encontra mente. Conexão intelectual tão forte que confundem com amor. Às vezes é. Às vezes é só estímulo. A diferença fica clara quando o debate acaba e sobra silêncio. Se o silêncio for confortável, é amor.",
      alt2: "Dois Ares. Liberdade em dobro. Nenhum prende o outro. Nenhum exige. A leveza é real. O que falta é o que os dois evitam: mergulhar.",
    },
  },
} as const;
