import type { LineBlocks, TextBlock } from "@/types/blocks";
import type { HeartVariation, HeartModifier } from "@/types/hand-attributes";

export const HEART_BLOCKS: Record<HeartVariation, LineBlocks> = {
  long_straight: {
    opening: {
      content: "Sua Linha do Coração corta a palma inteira sem desvio. Sem curva. Sem hesitação.",
      alt: "Reta. Longa. Atravessa a mão como se tivesse pressa de chegar do outro lado.",
      alt2: "Uma linha que não negocia. Vai de ponta a ponta sem pedir licença.",
    },
    body_past: {
      content:
        "Quando você ama, ama com tudo. Não existe versão parcial de você num relacionamento. Você entra {{inteira}} ou não entra. Sempre foi assim. Desde a primeira vez que confiou em alguém e descobriu que confiança tem preço.",
      alt: "Você nunca amou pela metade. Mesmo quando deveria. A primeira vez que se machucou, não aprendeu a amar menos. Aprendeu a escolher melhor. A intensidade? Ficou igualzinha.",
      alt2: "O amor pra você sempre foi tudo ou nada. Nenhuma zona cinza. Quando estava dentro, estava de corpo e alma. Quando saiu, saiu como se nunca tivesse existido. Só que existiu. E você lembra de tudo.",
    },
    body_present: {
      content:
        "E quando sai, queima o caminho pra não ter volta. Não por maldade. Por autopreservação. Você sabe que se deixar a porta aberta, volta. E voltar pra algo que já acabou é a única coisa que sua linha reta não permite. As pessoas acham que você é {{fria}} quando termina. Você é {{cirúrgica}}. A dor tá lá. Ninguém vê, porque você decidiu que ninguém vai ver.",
      alt: 'Cortar é seu mecanismo de sobrevivência. Quando percebe que acabou, acabou. Sem volta. Sem talvez. Sem "vamos ver". As pessoas não entendem. Chamam de frieza. É clareza. Dolorosa, mas clareza.',
      alt2: "Você termina como faz tudo: com decisão. O problema é que decisões assim custam noites. Ninguém vê as noites. Veem só a porta fechada. E acham que foi fácil.",
    },
  },
  long_curved: {
    opening: {
      content:
        "Sua Linha do Coração é longa e curva. Faz uma trajetória generosa pela palma. Coração que não economiza.",
      alt: "Longa, com curva suave. Coração que abraça antes de avaliar.",
      alt2: "Atravessa a palma inteira, mas fazendo curvas. Como se quisesse tocar todos os cantos antes de parar.",
    },
    body_past: {
      content:
        "Você ama com demonstração. Não fica calculando se já deu demais. Quando gosta, o mundo inteiro sabe. Sua generosidade emocional é sua marca. Também já foi sua fraqueza. Teve gente que recebeu demais e devolveu de menos. Você sabe quem.",
      alt: 'Afeto pra você é ação. Não é falar "eu te amo". É fazer café, lembrar do detalhe, estar ali às 3h da manhã sem ninguém pedir. Você dá sem contar. Conta só depois, quando percebe que deu demais.',
      alt2: "Coração aberto. Aberto demais, às vezes. Você já amou gente que não merecia nem metade do que você ofereceu. A parte difícil não foi descobrir isso. Foi admitir que faria de novo.",
    },
    body_present: {
      content:
        "A curva mostra que você se adapta. Cada pessoa que passou pela sua vida mudou alguma coisa na forma como você ama. Não te endureceu. Te refinou. Você ainda ama com tudo. Mas agora sabe onde termina você e começa a {{outra}} pessoa. Nem sempre soube.",
      alt: "Você aprendeu a amar sem se perder. Levou tempo. Custou gente. Mas agora tem um limite que não existia antes. Não é muro. É porta. Você escolhe quem entra.",
      alt2: "Hoje seu amor tem forma. Antes era rio transbordando. Agora é rio com margem. Ainda fundo. Ainda forte. Mas sabe o caminho.",
    },
  },
  long_deep_curved: {
    opening: {
      content:
        "Longa, funda, e com curva acentuada. Essa linha tem peso. Das mais marcadas que eu já vi.",
      alt: "Profunda e curva. Coração que marca quem toca.",
      alt2: "Essa linha não sussurra. Grita. Profundidade e curvatura juntas.",
    },
    body_past: {
      content:
        "Você não ama. Submerge. O tamanho do que você sente assusta quem tá perto. Assusta você também, às vezes. Mas você não sabe funcionar de outro jeito. Amar parcialmente é como respirar pela metade.",
      alt: "Desde cedo você soube que sentia diferente. Mais fundo, mais tempo, mais detalhado. Enquanto os outros esqueciam, você ainda tava processando. Não é melancolia. É profundidade. Tem diferença.",
      alt2: "Cada relacionamento deixou marca. Não cicatriz. Marca. Tipo entalhe em madeira. Você carrega todos. Não como peso. Como registro.",
    },
    body_present: {
      content:
        "Essa linha mostra alguém que sente em alta definição. Cada toque fica. Cada ausência fica mais. Você não faz amor pela metade. E quando acaba, acaba como se nunca tivesse existido. Só que existiu. Você lembra de cada detalhe. Cada cheiro. Cada silêncio.",
      alt: "Hoje você sabe o tamanho do que sente. E sabe que nem todo mundo aguenta. Por isso escolhe com cuidado. Quem entra, entra sabendo. Ou deveria.",
      alt2: "Sua intensidade é um filtro natural. Gente rasa foge. Gente funda fica. O problema é que gente funda é rara. E entre uma e outra, o silêncio pesa.",
    },
  },
  short_straight: {
    opening: {
      content: "Linha do Coração curta e reta. Objetiva. Sem rodeios.",
      alt: "Curta. Direta. Sua linha do amor não perde tempo com firulas.",
      alt2: "Pouca linha. Muito conteúdo. Curta e reta como sua paciência pro drama.",
    },
    body_past: {
      content:
        "Você não é de grandes declarações. Nunca foi. Seu amor aparece no gesto, não na palavra. Na presença silenciosa, não no discurso. Quem te conhece de verdade sabe ler esses sinais. Quem não conhece, acha que você não se importa.",
      alt: "Amor pra você é prático. Resolver o problema, estar lá quando precisa, não fazer drama quando não precisa. Simples. Só que simples confunde quem precisa de performance.",
      alt2: "Você mostra amor fazendo. Não dizendo. Isso confunde gente que precisa ouvir pra acreditar. Você já cansou de explicar. Agora só fica perto de quem entende sem precisar de legenda.",
    },
    body_present: {
      content:
        'Linha curta não significa pouco amor. Significa amor concentrado. Sem diluir. Você ama poucas pessoas, mas ama de verdade. E "de verdade" pra você tem peso. Não é figura de linguagem.',
      alt: "Poucas pessoas têm acesso ao que você sente. Grupo pequeno. Fechado. Quem tá dentro sabe o que tem. Quem tá fora acha que não tem nada. Os dois estão errados.",
      alt2: "Você seleciona. Não por arrogância. Por capacidade. Seu coração não é pra muita gente. E tá tudo bem.",
    },
  },
  short_curved: {
    opening: {
      content: "Curta, mas com curva. Coração pequeno que abraça apertado.",
      alt: "Pouca extensão, muita curvatura. Amor compacto e quente.",
      alt2: "Sua linha é curta e faz curva. Pouco espaço, muita coisa concentrada ali.",
    },
    body_past: {
      content:
        "Você é de perto. Seu amor funciona na distância de um abraço, não de uma mensagem. Sempre preferiu presença a promessa. Aprendeu cedo que quem promete muito geralmente entrega pouco.",
      alt: "Intimidade pra você é espaço físico. Dividir sofá, cozinhar junto, dormir encostada. O digital nunca substituiu o real. Você não finge que substitui.",
      alt2: "Poucos, perto, de verdade. Essa é sua fórmula. Não é receita de autoajuda. É como você funciona desde sempre.",
    },
    body_present: {
      content:
        "A curva numa linha curta mostra afeto concentrado e seletivo. Você não distribui carinho. Deposita. Em poucas pessoas. E espera que cuidem. Quando não cuidam, retira sem aviso.",
      alt: "Seu amor tem calor. Concentrado. Quem recebe, sente. Quem perde, lembra. Você não volta a oferecer o que já foi recusado. Orgulho? Talvez. Inteligência emocional? Com certeza.",
      alt2: "Você ama como fogueira num quarto pequeno. Quente demais pra quem não aguenta. Perfeito pra quem sabe ficar perto.",
    },
  },
  medium_straight: {
    opening: {
      content: "Linha do Coração média e reta. Equilíbrio entre razão e afeto.",
      alt: "Nem longa, nem curta. Nem curva, nem severa. Equilíbrio raro no amor.",
      alt2: "Sua linha de amor é moderada. Não transborda. Não seca. Flui.",
    },
    body_past: {
      content:
        "Você ama com consciência. Sabe o que sente, sabe por que sente, e sabe quando parar de sentir. Isso não significa que não dói. Significa que a dor não te controla.",
      alt: "Sempre teve um pé no coração e outro na razão. Quando um puxa demais, o outro equilibra. Isso te salvou de muita besteira. Também te impediu de viver umas loucuras que talvez valesse a pena.",
      alt2: "Seu amor é calibrado. Não calculado. Calibrado. Tem diferença. Calculado é frio. Calibrado é preciso. Você sabe quanto dar e quanto guardar.",
    },
    body_present: {
      content:
        "Linha média e reta mostra alguém que funciona bem no amor quando a {{outra}} pessoa também funciona. Você não salva ninguém. Não carrega ninguém. Quer parceria, não projeto. Quando percebe que virou projeto, sai.",
      alt: "Você quer alguém que caminhe do lado. Não atrás, não na frente. Do lado. Parece simples. É a coisa mais difícil de encontrar.",
      alt2: "Relacionamento pra você precisa fazer sentido. Não só emocional. Prático. Cotidiano. Quando o cotidiano não funciona, o emocional não salva. Você sabe disso por experiência.",
    },
  },
  medium_curved: {
    opening: {
      content:
        "Linha média com curvatura. Coração que pensa antes de sentir, mas sente quando decide.",
      alt: "Comprimento moderado, curva presente. Afeto que chega depois da confiança.",
      alt2: "Sua linha tem medida e tem curva. Coração que se abre devagar, mas abre inteiro.",
    },
    body_past: {
      content:
        "Você não se entrega de primeira. Precisa de tempo. De provas. De consistência. Não é desconfiança. É processo. E quando finalmente decide que alguém merece, a entrega é total. Quem esperou sabe que valeu.",
      alt: "Devagar. Sempre foi devagar. Enquanto os outros se apaixonavam em semanas, você levava meses pra admitir que gostava. Não é medo. É critério. E seu critério já te protegeu de muita gente errada.",
      alt2: "Amor pra você é construção. Tijolo por tijolo. Sem pressa. Sem pressão. Quem tenta apressar o processo, perde. Quem respeita o ritmo, ganha algo que não se encontra fácil.",
    },
    body_present: {
      content:
        "Curvatura numa linha média é afeto que se revela aos poucos. Não é fogo. É brasa. Demora pra acender. Demora mais pra apagar. Quando apaga, é porque você decidiu.",
      alt: "Hoje você sabe exatamente o que quer. E o que não quer. A lista do que não quer é mais longa. Não por amargura. Por clareza.",
      alt2: "Você escolhe devagar e ama firme. Quando finalmente abre, a profundidade surpreende. Inclusive você.",
    },
  },
  faint: {
    opening: {
      content: "Sua Linha do Coração é tênue. Suave. Quase sussurrada na palma.",
      alt: "Fraca. Não ausente. Fraca. Como voz que fala baixo mas diz coisas pesadas.",
      alt2: "Linha fina, quase invisível. Mas tá lá. Sempre esteve.",
    },
    body_past: {
      content:
        "Você protege o que sente. Sempre protegeu. Não é que não sinta. É que aprendeu cedo que mostrar o que sente é dar munição. E você não distribui munição. Guarda, protege, e só mostra pra quem provou que merece.",
      alt: "Tem gente que acha que você não sente. Tá errada. Você sente tudo. Só que pra dentro. O que chega na superfície é a versão editada. A versão completa, ninguém viu. Talvez nem você.",
      alt2: "Emoção pra você é território privado. Não é vergonha. É território. Seu. E você não deixa qualquer um entrar.",
    },
    body_present: {
      content:
        "Linha tênue não é coração fraco. É coração blindado. A blindagem não nasceu com você. Foi construída. Cada vez que confiou e não deveria. Cada vez que abriu e se machucou. A linha ficou mais fina porque você decidiu sentir com mais cuidado.",
      alt: "Hoje seu amor tem filtro. Não o que esconde. O que seleciona. Passa pouca gente. Mas quem passa encontra algo que não esperava. Porque por trás da linha fina tem um oceano que você não mostra pra ninguém.",
      alt2: "Você construiu um sistema de proteção eficiente. Funciona. Ninguém entra sem convite. O problema é que às vezes você esquece de convidar. E a solidão que vem disso não é por falta de gente. É por excesso de filtro.",
    },
  },
} as const;

export const HEART_MODIFIERS: Record<HeartModifier, TextBlock> = {
  fork_end: {
    content:
      "Bifurcação no final da linha. Conflito antigo: liberdade ou entrega total. Você quer os dois. Já tentou viver os dois. Não funcionou, né?",
    alt: "Tem uma divisão no final. Dois caminhos emocionais que puxam pra direções opostas. Você quer estabilidade e quer liberdade. E não aceita que tenha que escolher.",
    alt2: "Sua linha se divide perto do final. Indecisão emocional cristalizada na mão. Você quer mais de uma coisa. E geralmente consegue. Até não conseguir.",
  },
  island: {
    content:
      "Tem uma ilha aqui. Período de confusão emocional. Já passou, mas ficou marcado. Não precisa me dizer o que foi. Eu já sei que doeu.",
    alt: "Uma ilha na Linha do Coração. Período onde o amor virou labirinto. Você entrou, se perdeu, eventualmente saiu. Mas não saiu igual.",
    alt2: "Ilha. Marca de turbulência num período específico. Relação tóxica, perda, traição. Pode ter sido qualquer uma. Você sabe qual foi.",
  },
  break: {
    content:
      "Tem uma interrupção na linha. Algo cortou fundo. Você sabe o quê. A linha continuou depois. Mais funda, inclusive. Mas o corte ficou.",
    alt: "Uma pausa. Sua linha parou e recomeçou. Isso é ruptura. Não término normal. Ruptura. O tipo que muda como você funciona no amor dali pra frente.",
    alt2: "Interrupção. Algo partiu a linha em duas fases: antes e depois. O depois é diferente. Mais {{segura}}. Mais {{certa}} do que aceita.",
  },
  ends_index: {
    content:
      "Sua linha termina no Monte de Júpiter. Você escolhe quem ama com a cabeça. Não por frieza. Por padrão. Busca alguém que admira, não só que deseja. Quando o respeito acaba, você vai embora antes da paixão acabar.",
    alt: "Terminação no indicador. Ambição no amor. Você quer alguém à altura. Não em status. Em substância. Se não te desafia intelectualmente, perde a graça rápido.",
    alt2: "Júpiter. Sua linha aponta pra liderança até no amor. Parceria de igual pra igual. Não cuida, não salva, não tolera ser cuidada quando não pediu.",
  },
  ends_middle: {
    content:
      "Sua linha termina no Monte de Saturno. Segurança antes de paixão. Você precisa de base sólida antes de se entregar. Não é falta de desejo. É prioridade.",
    alt: "Terminação em Saturno. Estabilidade é sua linguagem de amor. Sem chão firme, seu coração não arrisca. Você já tentou sem chão. Sabe no que dá.",
    alt2: "Saturno. Sua linha termina no lugar da disciplina. Amor pra você precisa de estrutura. Não de jaula. De estrutura. Rotina, plano, futuro. Sem isso, paixão é só adrenalina.",
  },
  deep: {
    content:
      "A profundidade dessa linha mostra alguém que sente em alta definição. Cada toque fica. Cada ausência fica mais. Quando ama, imprime. Quando para, a marca continua lá.",
    alt: "Linha funda. Emoção que deixa rastro. Você não esquece. Não é que não queira. Não consegue. Cada pessoa que importou deixou sulco que não fecha.",
    alt2: "Profundidade marcada. Seu coração funciona como argila molhada: tudo que toca fica impresso.",
  },
} as const;
