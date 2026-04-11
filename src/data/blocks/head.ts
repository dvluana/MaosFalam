import type { LineBlocks, TextBlock } from "@/types/blocks";
import type { HeadVariation, HeadModifier } from "@/types/hand-attributes";

export const HEAD_BLOCKS: Record<HeadVariation, LineBlocks> = {
  long_straight: {
    opening: {
      content: "Sua Linha da Cabeça é longa e reta. Pensamento direto. Sem desvios.",
      alt: "Reta e longa. Sua mente vai em linha reta até o fim do problema.",
      alt2: "Longa, reta, sem rodeio. Mente que funciona como bisturi.",
    },
    body_past: {
      content:
        "Você pensa com clareza. Sempre pensou. Enquanto os outros se perdem em possibilidades, você já descartou nove e ficou com a certa. Não é intuição. É lógica. Rápida, limpa, sem enfeite.",
      alt: "Sua cabeça sempre foi seu porto seguro. Quando o emocional bagunçava tudo, a mente reorganizava. Desde cedo você percebeu que pensar direito te protegia mais que sentir demais.",
      alt2: "Raciocínio linear. Ponto A ao ponto B sem escala. As pessoas te acham objetiva demais. Você acha que elas demoram demais.",
    },
    body_present: {
      content:
        "A mente reta tem um custo: você enxerga a resposta antes dos outros e não entende por que eles não veem. Isso te isola. Não socialmente. Intelectualmente. Você tá sempre dois passos na frente. Cansada de esperar.",
      alt: "Hoje sua clareza mental é sua ferramenta principal. No trabalho, nas relações, nas decisões. Você confia mais na sua cabeça do que em qualquer conselho. E geralmente tá certa. Nas raras vezes que erra, erra {{sozinha}}.",
      alt2: "Sua mente não para. Mas vai em linha reta. Diferente de quem pensa em espiral. Você resolve, descarta, segue. O efeito colateral da eficiência é impaciência. Com os outros. E consigo.",
    },
  },
  long_curved: {
    opening: {
      content: "Sua Linha da Cabeça curva em direção à Lua. Mente criativa com raiz.",
      alt: "Longa, com curva pro Monte da Lua. Imaginação que se alimenta de tudo.",
      alt2: "Curva suave mergulhando na direção da Lua. Mente que pensa em imagens.",
    },
    body_past: {
      content:
        "Criativa com estrutura. Você imagina coisas que os outros não imaginam, mas consegue transformar em algo concreto. Não é {{sonhadora}} solta. É {{sonhadora}} que executa. Na escola, provavelmente odiava matemática mas entendia física. Porque física tem narrativa. Números sozinhos não.",
      alt: "Sua mente sempre funcionou por conexão. Uma coisa leva a outra que leva a outra que leva a um insight que ninguém mais teria. Não é genialidade. É a forma como seus pensamentos se organizam. Em rede, não em fila.",
      alt2: "Criatividade nunca te faltou. O que às vezes falta é paciência pra executar o que imaginou. A ideia vem pronta na cabeça. Perfeita. Aí a realidade demora pra alcançar. Isso te frustra.",
    },
    body_present: {
      content:
        "Sua mente funciona em imagens, conexões, metáforas. Você entende conceitos abstratos antes de entender instruções literais. A linha é longa. Passa do centro da palma e continua mergulhando. Todo mundo olha pro pixel. Você vê o quadro completo. Isso é solidão e superpoder.",
      alt: "Hoje essa mente criativa é sua maior vantagem. O desafio não é ter ideias. É escolher qual executar. Porque vêm muitas. Ao mesmo tempo. Competindo entre si.",
      alt2: "Mente visual. Narrativa. Você não processa informação como dado. Processa como história. Tudo tem começo, meio e fim na sua cabeça. Inclusive pessoas.",
    },
  },
  long_deep_curved: {
    opening: {
      content:
        "Longa, funda, e curva. Sua mente é um labirinto que você mesma às vezes se perde dentro.",
      alt: "Profunda e curva. Mente que não desliga. Nem de noite.",
      alt2: "Linha comprida, funda, curvada. Mente que processa camadas que a maioria nem sabe que existem.",
    },
    body_past: {
      content:
        "Você sempre pensou demais. Desde criança. Perguntas que ninguém fazia, conexões que ninguém via, angústias que ninguém entendia. Sua mente não aceita a superfície das coisas. Precisa ir embaixo. Sempre.",
      alt: "Mente que não para nunca. De dia processa. De noite reprocessa. Você já tentou desligar. Meditação, exercício, rotina. Ajuda um pouco. Resolve de verdade? Não. Porque o problema não é a mente. É o tamanho dela.",
      alt2: "Desde cedo você percebeu que pensava diferente. Mais fundo. Mais lento às vezes, porque ia em camadas que os outros pulavam. Na escola era a que fazia as perguntas que a professora não sabia responder.",
    },
    body_present: {
      content:
        "Profundidade uniforme, sem ilhas, sem correntes. Sua cabeça não colapsa nos piores momentos. Nos piores momentos, foi a cabeça que te tirou. Vai continuar te tirando.",
      alt: "Hoje essa profundidade é sua ferramenta e seu peso. Te permite ver o que ninguém vê. Te obriga a processar o que ninguém processa. A solidão intelectual é real.",
      alt2: "Não é {{sonhadora}} solta. É {{sonhadora}} que executa. Quase ninguém faz os dois. Você faz. E é exatamente por isso que sua cabeça não para.",
    },
  },
  short_straight: {
    opening: {
      content: "Curta e reta. Prática. Sem rodeios. Sua mente não perde tempo.",
      alt: "Linha da Cabeça curta e direta. Objetividade que corta atalho.",
      alt2: "Pouca linha, muito pragmatismo. Mente que resolve, não divaga.",
    },
    body_past: {
      content:
        "Você nunca foi de filosofar. Problema apareceu, resolve. Dúvida surgiu, decide. Enquanto os outros ainda tão listando prós e contras, você já agiu. Nem sempre certo. Mas agiu.",
      alt: "Sua cabeça funciona como interruptor. Liga e desliga. Sim ou não. Sem talvez. Isso te fez rápida a vida inteira. Também te fez impaciente com gente indecisa.",
      alt2: "Pensamento prático desde sempre. Não é que não pense fundo. É que pensa fundo em 30 segundos e segue. O processo é rápido. O resultado é sólido. O meio é invisível.",
    },
    body_present: {
      content:
        "Mente curta e reta é eficiência. Você processa rápido, decide rápido, e não revisita. O que foi, foi. Energia mental gasta em arrependimento é energia jogada fora. E você não joga nada fora.",
      alt: "Hoje sua objetividade é vantagem. No trabalho, nas relações. Enquanto os outros tão paralisados pela análise, você já resolveu e tá no próximo problema.",
      alt2: 'O risco da mente curta é perder nuance. Às vezes a resposta não é sim ou não. É depende. E "depende" te irrita.',
    },
  },
  short_curved: {
    opening: {
      content: "Curta, com curva. Pensamento rápido e intuitivo.",
      alt: "Pouca extensão, bastante curvatura. Resolve no feeling.",
      alt2: "Linha curta e curva. Raciocínio guiado mais por instinto que por planilha.",
    },
    body_past: {
      content:
        'Você resolve pela intuição. Não sabe explicar como chegou na resposta. Mas chega. E geralmente tá certa. Na escola, chutava e acertava. Na vida, "sentiu" e deu certo. O problema é quando pedem justificativa.',
      alt: "Seu pensamento é rápido e emocional. Não no sentido de irracional. No sentido de que processa informação pelo corpo, não pela planilha. Sente a resposta antes de calcular.",
      alt2: "Mente que funciona por radar. Entra num lugar e já sabe se vai dar certo. Conhece uma pessoa e já sabe se confia. Tudo em segundos. Sem Excel.",
    },
    body_present: {
      content:
        "A curva compensa a brevidade com percepção. Onde falta extensão, sobra radar. Você não analisa tudo. Mas o que analisa, analisa com uma lente que mistura razão e gut feeling.",
      alt: "Hoje sua intuição é seu ativo mais valioso. Você sabe. Não sabe explicar. Mas sabe. E já parou de pedir desculpa por isso.",
      alt2: "Mente intuitiva em mundo que valoriza dados. Você já aprendeu a traduzir sua intuição em linguagem que os outros entendem. Mas entre nós: a intuição chegou antes do dado. Sempre.",
    },
  },
  medium_straight: {
    opening: {
      content: "Linha da Cabeça média e reta. Equilíbrio entre análise e ação.",
      alt: "Nem longa, nem curta. Reta. Pensa o suficiente e age no tempo certo.",
      alt2: "Comprimento moderado, sem curva. Pensamento equilibrado.",
    },
    body_past: {
      content:
        "Você pensa o necessário. Nem mais, nem menos. Não paralisa na análise. Também não age sem pensar. O meio-termo te serve bem. Sempre serviu.",
      alt: "Sua mente encontrou um ritmo. Pensa, decide, age, avalia. Nessa ordem. Sem pular etapa.",
      alt2: "Equilíbrio mental. Não é que não se preocupe. Se preocupa na medida certa. O suficiente pra resolver. Não o suficiente pra perder o sono. Na maioria das vezes.",
    },
    body_present: {
      content:
        "Mente média e reta é consistência. Funciona em qualquer cenário. Pressão, calma, caos, rotina. Não oscila.",
      alt: "Hoje sua estabilidade mental te diferencia. Enquanto os outros oscilam, você mantém o prumo. Isso atrai gente que precisa de âncora. Afasta gente que precisa de montanha-russa.",
      alt2: "Consistência é subestimada. Todo mundo quer ser genial. Você quer ser confiável. E confiável ganha de genial no longo prazo.",
    },
  },
  medium_curved: {
    opening: {
      content: "Média e curva. Mente que equilibra lógica com imaginação.",
      alt: "Comprimento moderado, curva presente. Dança entre o prático e o criativo.",
      alt2: "Sua linha tem medida e curva. Razão e sensibilidade dividindo espaço.",
    },
    body_past: {
      content:
        "Você transita entre dois mundos: o prático e o imaginativo. Quando precisa resolver, resolve. Quando precisa criar, cria. A maioria mora num ou no outro. Você visita os dois. Com fluência.",
      alt: "Mente híbrida. Metade engenheira, metade artista. Planeja com criatividade. Cria com método. Isso confunde quem tenta te encaixar. Você não cabe.",
      alt2: "Sempre teve facilidade pra coisas diferentes. O lógico e o abstrato. O técnico e o humano. Não é que seja boa em tudo. É que transita entre registros com naturalidade.",
    },
    body_present: {
      content:
        "Mente híbrida é exatamente o que funciona hoje. Gente que só analisa não inova. Gente que só imagina não entrega. Você faz os dois. O resultado é diferente de tudo que os outros fazem.",
      alt: "Sua mente funciona em modo duplo. E aprendeu a usar cada modo na hora certa. Reunião de trabalho: modo prático. Projeto pessoal: modo criativo. Crise: os dois.",
      alt2: "Curva moderada é flexibilidade mental. Você se adapta ao problema. Muda de abordagem sem perceber. Enquanto os outros insistem no mesmo método, você já tentou três e ficou com o que funcionou.",
    },
  },
  faint: {
    opening: {
      content: "Linha da Cabeça tênue. Mente que sussurra em vez de gritar.",
      alt: "Linha fraca. Pensamento em volume baixo. Mas funciona.",
      alt2: "Tênue. Quase invisível. Mente discreta, não fraca.",
    },
    body_past: {
      content:
        "Você não impõe seu pensamento. Nunca impôs. Observa, processa, guarda pra si. Quando fala, fala pouco. Mas cada palavra carrega o peso de tudo que processou em silêncio. As pessoas subestimam. Até você abrir a boca no momento certo.",
      alt: "Mente silenciosa. Não vazia. Silenciosa. Processa em modo stealth. Ninguém sabe o que tá pensando até você decidir contar.",
      alt2: "Sua cabeça funciona em segundo plano. Como software rodando sem interface. Os resultados aparecem. O processo, ninguém vê.",
    },
    body_present: {
      content:
        "Linha tênue é mente que escolhe suas batalhas. Não gasta energia mental com o que não importa. Reserva pra quando precisa de verdade. Aí surpreende todo mundo.",
      alt: "Hoje sua discrição é estratégica. Você não mostra o jogo. Não por manipulação. Por economia. Pra quê gastar pensamento em voz alta se o silêncio resolve melhor?",
      alt2: "Mente discreta em mundo barulhento. Enquanto os outros disputam quem fala mais alto, você observa. Quando o silêncio pesa e alguém precisa falar algo que faça sentido, olham pra você.",
    },
  },
} as const;

export const HEAD_MODIFIERS: Record<HeadModifier, TextBlock> = {
  fork_moon: {
    content:
      "Bifurcação no Monte da Lua. Duas mentes: uma prática, outra que sonha. Você vive tentando conciliar as duas. Às vezes a prática ganha. Às vezes o sonho escapa. E quando escapa, cria coisas que ninguém esperava.",
    alt: "Sua linha se divide perto da Lua. Mente dupla. Uma que paga as contas e outra que imagina mundos. As duas são você.",
    alt2: "Bifurcação lunar. Uma metade resolve, a outra inventa. O conflito é constante. Mas é exatamente desse conflito que saem suas melhores ideias.",
  },
  touches_life: {
    content:
      "A Cabeça toca a Vida. Mente e corpo conectados na raiz. Suas decisões mentais afetam seu corpo. Estresse vira dor. Ansiedade vira insônia. Tudo tá ligado.",
    alt: "Linha da Cabeça encostando na Linha da Vida. Quando sua cabeça tá mal, seu corpo avisa. Quando seu corpo tá mal, sua mente desacelera. Um sistema só.",
    alt2: "As duas linhas se tocam. Raro. Mente e vitalidade funcionam como circuito fechado. Quando os dois tão bem, você é imbatível. Quando um vai mal, o outro sente na hora.",
  },
  island: {
    content:
      "Ilha na Linha da Cabeça. Período de confusão mental. Decisões erradas por exaustão ou pressão. Já passou. Mas deixou um aprendizado: nunca mais decide cansada.",
    alt: "Ilha. Nevoeiro. Sua mente perdeu a clareza por um tempo. Estresse, burnout, sobrecarga. Não importa a causa. Você saiu e sua mente voltou mais afiada.",
    alt2: "Uma ilha na linha do pensamento. Período onde nada fazia sentido. Onde você duvidou da própria capacidade. Passou. A cicatriz mental é real. E te ensinou a respeitar seus limites.",
  },
  break: {
    content:
      "Interrupção na Linha da Cabeça. Algo mudou sua forma de pensar. Radicalmente. A pessoa que você era antes dessa pausa não pensava como você pensa agora.",
    alt: "Uma pausa na linha. Ruptura cognitiva. Evento, descoberta, ou perda. Algo que fez sua mente reiniciar. O novo sistema operacional é melhor. Mas o reboot foi violento.",
    alt2: "Sua linha da mente tem um corte. Depois do corte, a linha continua diferente. Mais firme ou mais suave, depende. Mas diferente. Você pensa de um jeito que não pensava antes de... você sabe antes do quê.",
  },
} as const;
