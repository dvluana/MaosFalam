import type { LineBlocks } from "@/types/blocks";
import type { FateVariation } from "@/types/hand-attributes";

export const FATE_BLOCKS: Record<FateVariation, LineBlocks> = {
  present_deep: {
    opening: {
      content: "Linha do Destino forte e clara. Direção que não vacila.",
      alt: "Destino marcado. Fundo. Reto. Propósito que pulsa.",
      alt2: "Linha firme subindo pela palma. Destino que não pede opinião.",
    },
    body_past: {
      content:
        "Você sabe pra onde vai. Talvez não saiba como. Talvez não saiba quando. Mas a direção tá definida. Propósito claro. Não plano. Propósito. Planos mudam. Propósito permanece.",
      alt: "Desde cedo tinha um norte. Mesmo quando tudo era confuso, algo dentro de você apontava pra frente. Seguiu. Nem sempre pelo caminho mais fácil.",
      alt2: "Destino forte não significa vida fácil. Significa vida com sentido. Mesmo nos piores momentos, você sentiu que tava indo pra algum lugar.",
    },
    body_present: {
      content:
        "Você não seguiu o caminho que esperavam. Por isso tá indo pra lugares que eles nem sabem que existem.",
      alt: "Hoje sua direção tá mais clara que nunca. Não porque as dúvidas sumiram. Porque aprendeu a andar com elas.",
      alt2: "A linha termina forte em Saturno. Sem hesitação. Destino que chega tarde mas chega certo.",
    },
  },

  present_faint: {
    opening: {
      content: "Linha do Destino fraca. Presente, mas suave.",
      alt: "Destino fraco não é ausência. É caminho que se desenha devagar.",
      alt2: "Linha tênue. Direção incerta. Mas lá.",
    },
    body_past: {
      content:
        "Sua direção nunca foi óbvia. Enquanto os outros tinham certeza do que queriam ser, você ainda tava descobrindo. Não por indecisão. Por complexidade. Você não cabe numa direção só.",
      alt: "Caminho confuso por fora. Coerente por dentro. Escolhas que pareciam aleatórias. Olhando pra trás, cada uma te trouxe até aqui.",
      alt2: "Destino suave é destino em construção. Veio em fragmentos que você tá juntando aos poucos.",
    },
    body_present: {
      content:
        "Você sente que tá chegando perto de algo. Não sabe do quê exatamente. Mas sente. Linha fraca não significa falta de destino. Significa que o destino ainda tá se revelando.",
      alt: "A direção vai ficando mais clara com cada decisão. Por camadas. Cada camada te aproxima de algo que não consegue nomear ainda.",
      alt2: "Destino fraco é liberdade disfarçada. Sem linha forte te puxando, você pode ir pra qualquer lugar. O difícil é escolher. O possível é infinito.",
    },
  },

  broken: {
    opening: {
      content: "Quebrada. Uma linha que parou e recomeçou. Mudança de rumo.",
      alt: "Destino interrompido. Reconstruído. Duas fases. Duas direções.",
      alt2: "Sua linha do destino tem um corte. Antes e depois.",
    },
    body_past: {
      content:
        "Mudança de rumo. Não desvio. Recomeço. Algo que mudou a direção da sua vida completamente. Escolha ou circunstância. Não importa. Você tá num caminho que não existia antes desse corte.",
      alt: "A primeira fase acabou. Carreira, relação, cidade, identidade. Algo que te definia simplesmente parou. No lugar surgiu outra coisa.",
      alt2: "Você mudou de direção. Radicalmente. A maioria fica no caminho errado por inércia. Você cortou e recomeçou. A segunda linha é mais forte que a primeira.",
    },
    body_present: {
      content:
        "A segunda metade é mais forte. Eu vejo claro. A linha volta com mais profundidade. O novo caminho tem mais propósito que o antigo.",
      alt: "Hoje você tá no segundo ato. O primeiro foi ensaio. O segundo é pra valer.",
      alt2: "Recomeço é o seu tema. E cada recomeço foi mais {{certa}} do que o anterior.",
    },
  },

  multiple: {
    opening: {
      content: "Múltiplas linhas de destino. Caminhos paralelos.",
      alt: "Duas, talvez três linhas de destino. Vidas paralelas na mesma palma.",
      alt2: "Linhas múltiplas subindo. Não é confusão. É abundância.",
    },
    body_past: {
      content:
        "Você sempre fez mais de uma coisa. Não por falta de foco. Por excesso de capacidade. Enquanto os outros escolhem entre A e B, você faz A, B, e começa C.",
      alt: "Caminhos paralelos. Carreira e projeto pessoal. Trabalho e arte. Família e ambição. Você não aceita que precisa escolher um.",
      alt2: "Múltiplos destinos na mesma mão. Raro. Você não nasceu pra uma coisa só. Nasceu pra várias. O mundo tenta te encaixar numa. Não cabe.",
    },
    body_present: {
      content:
        'Os caminhos paralelos são sua identidade. Quando te perguntam "o que você faz?", nenhuma resposta é completa.',
      alt: "A multiplicidade é sua força e sua exaustão. Fazer tudo é possível. Descansar de tudo é o difícil.",
      alt2: "Os caminhos vão convergir em algum momento. Não agora. Mas quando convergirem, o resultado vai ser algo que só alguém com seus caminhos poderia criar.",
    },
  },

  late_start: {
    opening: {
      content: "Começa no meio da palma. Destino tardio.",
      alt: "Sua linha não começa no pulso. Começa mais acima.",
      alt2: "Início tardio. Não é atraso. É preparação que levou mais tempo.",
    },
    body_past: {
      content:
        "Cada coisa errada te levou pra direção certa. Cada emprego que não deu certo. Cada relação que terminou. Cada mudança que pareceu retrocesso. Era preparação.",
      alt: 'Enquanto os outros já tinham encontrado "sua coisa" aos 25, você ainda tava procurando. Não por preguiça. Por precisão. Precisava de mais dados. Mais experiências. Mais erros.',
      alt2: "Destino tardio é destino refinado. Chegou com mais clareza. Menos ilusão.",
    },
    body_present: {
      content:
        "Linha que começa tarde sobe firme. Sem dúvida. Direção que vem com maturidade. Certeza precoce se dissolve. Direção madura se solidifica.",
      alt: 'Hoje você sabe que o "atraso" era necessário. Nada do que veio antes foi perdido. Tudo alimentou o que tá vindo agora.',
      alt2: "Tarde mas certo. Resumo da sua Linha do Destino. E da sua vida.",
    },
  },

  absent: {
    opening: {
      content: "Sem Linha do Destino visível. Antes que se preocupe: não é mau sinal.",
      alt: "Destino ausente. Não tem linha. Mais interessante do que parece.",
      alt2: "Sua palma não tem Linha do Destino. Calma. Ouve o que isso significa.",
    },
    body_past: {
      content:
        "Isso não é falta de direção. É liberdade. Você não veio com roteiro. Veio com improviso. Cada escolha é sua. Cada caminho é inventado. Ninguém te empurra numa direção porque não tem direção pré-escrita. O que existe é vontade. E vontade forte cria o próprio destino.",
      alt: "Sem destino fixo. Sem limite fixo. Pode ser qualquer coisa. Ir pra qualquer lugar. O paradoxo é que liberdade total assusta. Você conhece esse medo.",
      alt2: "Ausência de destino na mão não é ausência de destino na vida. É destino em construção. Escrito por você. Em tempo real.",
    },
    body_present: {
      content:
        "Você não segue caminho. Abre caminho. E quem abre caminho não tem mapa. Tem coragem.",
      alt: "Hoje a ausência te dá uma vantagem: flexibilidade total. Muda quando quer. Pra onde quer. Sem sentir que tá traindo algum plano.",
      alt2: "Destino ausente é tela em branco. Assustador pra quem precisa de roteiro. Libertador pra quem sabe pintar.",
    },
  },
} as const;
