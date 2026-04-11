import type { LineBlocks } from "@/types/blocks";
import type { LifeVariation } from "@/types/hand-attributes";

export const LIFE_BLOCKS: Record<LifeVariation | "_fallback", LineBlocks> = {
  long_deep: {
    opening: {
      content: "Profunda e longa. Resiliência que assusta quem te subestima.",
      alt: "Linha da Vida longa e marcada. Vitalidade que não negocia.",
      alt2: "Funda, longa, sem interrupção. Força vital de quem já atravessou muito.",
    },
    body_past: {
      content:
        "Você se recupera de coisas que derrubariam outras pessoas por meses. Não porque não sinta. Porque seu corpo e sua mente têm um mecanismo de reconstrução que funciona quase sozinho. Você levanta. Sempre. Às vezes no dia seguinte. Às vezes na mesma hora.",
      alt: "Vitalidade forte desde criança. Adoecia e no dia seguinte tava correndo. Levava tombo e levantava antes de chorar. Esse padrão nunca mudou.",
      alt2: "Coisas que derrubariam outros te deixam de pé. Machucada, cansada, mas de pé. Sempre de pé. Porque ficar no chão nunca foi opção.",
    },
    body_present: {
      content:
        '"Como {{ela}} tá bem?" As pessoas se impressionam. Não tá. Mas funciona mesmo não tando. A linha faz um arco largo. Generosa. Você tem muito pra dar. Tempo, presença, energia. Dá sem calcular. Ninguém te agradeceu pela maioria das vezes que recomeçou.',
      alt: "Ninguém imagina o peso do que você carrega. Porque você não mostra. Não por orgulho. Porque mostrar significaria parar. E parar não é opção quando tem gente dependendo de você.",
      alt2: "Sua vitalidade é sua armadura e seu motor. Te protege e te move. O custo é que você nunca descansa de verdade. Mesmo quando para, tá processando. Mesmo quando dorme, tá se reconstruindo.",
    },
  },

  long_faint: {
    opening: {
      content: "Longa, mas tênue. Vida longa com energia que precisa ser administrada.",
      alt: "Extensão grande, profundidade fraca. Maratona, não sprint.",
      alt2: "Linha longa e suave. Duração sem explosão.",
    },
    body_past: {
      content:
        "Você não tem energia pra desperdiçar. Nunca teve. Aprendeu cedo a escolher onde investir. Enquanto os outros gastam em tudo, você economiza pro que importa. Não é preguiça. É gestão.",
      alt: "Sua energia é finita e você sabe. Isso te fez sábia. Enquanto os outros se esgotam em besteira, você guarda pro essencial. Parece que faz pouco. Faz exatamente o necessário.",
      alt2: "Vitalidade moderada. Você funciona bem quando respeita seu ritmo. Quando força, paga. E já pagou vezes suficientes pra aprender.",
    },
    body_present: {
      content:
        "Linha longa garante longevidade. A leveza pede cuidado. Seu corpo funciona como conta corrente: gasta mais do que entra, fica no vermelho. No vermelho, tudo piora. Sono, humor, saúde, decisões.",
      alt: "Hoje você sabe: quando descansa, rende mais. Quando força, quebra. O difícil é convencer o mundo que descanso não é falta de ambição.",
      alt2: "Seu corpo te avisa antes de quebrar. O problema é que você já ignorou o aviso vezes demais. Tá aprendendo a ouvir. Devagar. Mas tá.",
    },
  },

  short_deep: {
    opening: {
      content: "Curta, mas funda. Vida que se concentra em poucos anos decisivos.",
      alt: "Linha curta com profundidade marcada. Qualidade, não quantidade.",
      alt2: "Pouca extensão, muita marca.",
    },
    body_past: {
      content:
        "Sua energia vem em rajadas. Intensa, arrebatadora, e depois precisa recarregar. Você não funciona em modo constante. Funciona em modo explosão. As melhores coisas da sua vida aconteceram em períodos curtos e intensos.",
      alt: "Ciclos. Sua vida funciona em ciclos claros. Meses de energia intensa seguidos de semanas de recolhimento. Você já tentou viver em linha reta. Não funciona.",
      alt2: "Cada fase sua tem peso. Cada ano conta. Você não desperdiça tempo. Porque sente, de alguma forma, que o tempo é precioso demais.",
    },
    body_present: {
      content:
        "A profundidade compensa a extensão. O que você vive, vive fundo. Cada experiência te marca. Nada é raso pra você.",
      alt: "Hoje sua densidade é sua identidade. Gente que te conhece sabe que estar perto é uma experiência.",
      alt2: "Você comprime mais vida em menos tempo do que a maioria. Não é pressa. É densidade.",
    },
  },

  short_faint: {
    opening: {
      content: "Curta e tênue. Energia que pede cuidado.",
      alt: "Linha da Vida discreta. Presença suave.",
      alt2: "Curta e fina. Sinal de que seu corpo pede mais atenção do que você dá.",
    },
    body_past: {
      content:
        "Você sempre funcionou no limite. Não por escolha. Sua energia nunca foi abundante. Aprendeu a fazer muito com pouco. Virou skill. Só que skill tem custo. Quando ultrapassa o limite, cai mais rápido.",
      alt: "Saúde exigiu atenção desde cedo. Talvez não doença grave. Talvez cansaço crônico, imunidade baixa, corpo que responde devagar. Compensou com disciplina. Ou teimosia.",
      alt2: "Energia limitada. Corpo que pede mais do que você oferece. A relação entre vocês sempre foi de negociação. Ele pede descanso. Você empurra mais um pouco. Ele cobra depois.",
    },
    body_present: {
      content:
        "Linha curta e fraca não é destino. É estado atual. Linhas mudam. A sua pode se aprofundar se você cuidar do que precisa ser cuidado. Sono, alimentação, movimento, descanso real.",
      alt: "Hoje você sabe que não pode funcionar no modo dos outros. Seu modo é mais lento, mais cuidadoso. E tá tudo bem.",
      alt2: "Cuidar de si não é egoísmo. Suas mãos mostram que você precisa disso mais do que a média.",
    },
  },

  curved_wide: {
    opening: {
      content: "Arco largo. Generosa. Sua Linha da Vida abraça a palma.",
      alt: "Curva ampla sobre o Monte de Vênus. Vida que se entrega ao redor.",
      alt2: "Arco generoso. Você ocupa muito espaço na vida dos outros.",
    },
    body_past: {
      content:
        "Você é generosa. Não de dinheiro. De presença. De tempo. De energia. Quando alguém precisa, você aparece. Sem pedir nada. Já recomeçou mais vezes do que a maioria teria coragem. Ninguém te agradeceu por nenhuma delas.",
      alt: "Arco largo é coração grande e braço comprido. Abraça antes de perguntar se pode. Ajuda antes de pedir retorno. Percebe que deu demais só depois.",
      alt2: "Generosidade é seu padrão. Não é virtude que pratica. É como funciona. Dar é natural. Receber é que é difícil. Porque receber te deixa vulnerável.",
    },
    body_present: {
      content:
        "Arco largo mostra vitalidade que se expande pros outros. Muito pra dar. Dá sem calcular. O risco é se esvaziar. O desafio é aprender que guardar pra si não é egoísmo. É manutenção.",
      alt: "Sua vida transborda pros outros. Mãe, amiga, porto seguro, a que resolve. Todos esses papéis. O que falta: alguém que cuida de você.",
      alt2: "Generosidade sem limite é cilada. Suas mãos mostram que você dá até o limite. E depois do limite também. Aprender a parar antes de se esvaziar é o próximo passo.",
    },
  },

  curved_tight: {
    opening: {
      content: "Arco apertado. Vida contida. Reservada.",
      alt: "Curva fechada. Espaço vital pequeno e protegido.",
      alt2: "Arco curto e fechado. Você não se espalha. Se concentra.",
    },
    body_past: {
      content:
        "Vida reservada. Poucos amigos. Poucos lugares. Poucos confortos, mas os mesmos. Você não precisa de muito. Nunca precisou. Enquanto os outros buscam novidade, você aprofunda o que já tem. Lealdade é seu idioma. Rotina é seu abrigo.",
      alt: "Caseira. No sentido profundo. Não é que não goste de sair. Voltar pra casa é sempre melhor do que ir pra qualquer lugar.",
      alt2: "Introversão não é timidez. É escolha. Menos gente, mais profundidade. Menos lugares, mais pertencimento.",
    },
    body_present: {
      content:
        "Arco apertado mostra energia vital que fica perto. Não se dissipa. Se concentra num círculo pequeno. Dentro desse círculo, a intensidade é máxima.",
      alt: "Hoje sua vida reservada é seu maior luxo. Enquanto os outros se espalham tentando estar em todo lugar, você tá exatamente onde quer. Com quem quer.",
      alt2: "Arco fechado é vida escolhida. Cada pessoa, cada compromisso, cada hábito passou pelo seu filtro. O que tá dentro tá ali porque merece.",
    },
  },

  broken_restart: {
    opening: {
      content: "Tem uma pausa na Linha da Vida. Depois ela recomeça. Mais funda que antes.",
      alt: "Linha interrompida. Mas olha o que vem depois: mais forte.",
      alt2: "Quebra e recomeço. Duas fases. A segunda é mais marcada.",
    },
    body_past: {
      content:
        "Algo te derrubou. Fisicamente ou emocionalmente. Faz uns anos. Você sabe do que eu tô falando. A linha não parou. Continuou. Mais funda depois disso, inclusive. O que não te matou te deu uma vitalidade que não existia antes.",
      alt: "Recomeço. Não é metáfora. É literal na sua mão. Uma fase acabou. Outra começou. A segunda versão de você é mais forte. Custou caro. Mas custou.",
      alt2: "Essa marca aqui? Faz uns anos. Você sabe. A linha parou e voltou com mais força. A vida te testou e você passou. Não sem dor. Com dor. Mas passou.",
    },
    body_present: {
      content:
        "A linha recomeça mais funda. Reconstrução real. Não superação de livro de autoajuda. Reconstrução. Do tipo que muda osso, postura, voz. Você não é a mesma pessoa de antes da pausa. E não quer ser.",
      alt: "Hoje a segunda fase é mais forte que a primeira. Você sabe. Sente no corpo. Na segurança das decisões. Na clareza do que aceita e do que não aceita mais.",
      alt2: "Cada recomeço te deu uma camada a mais. Não de armadura. De pele. Mais grossa, mais {{preparada}}.",
    },
  },

  chained: {
    opening: {
      content: "Correntes. Ondulações miúdas na Linha da Vida. Corpo pedindo atenção.",
      alt: "Linha encadeada. Parece corrente. Saúde que oscila.",
      alt2: "Ondulações contínuas. Vitalidade que vai e volta. Como maré.",
    },
    body_past: {
      content:
        "Saúde instável em algum período. Corpo pedindo atenção que talvez não tenha recebido. Não necessariamente doença grave. Às vezes cansaço crônico, imunidade frágil, corpo que responde mais devagar do que a mente exige.",
      alt: "Correntes são períodos de energia oscilante. Semanas boas seguidas de dias onde o corpo não coopera. Você conhece esse ritmo.",
      alt2: "Seu corpo tem padrão de onda. Picos e vales. Você já tentou ignorar os vales. O resultado foi pior. Tá aprendendo a surfar em vez de lutar contra a maré.",
    },
    body_present: {
      content:
        "Correntes não são sentença. São sinal. Seu corpo fala uma linguagem que você provavelmente ignora por costume. Dor que vira costumeira. Cansaço que vira normal. Nada disso é normal.",
      alt: "Hoje as correntes te pedem uma coisa: escuta. O corpo sabe antes da mente. Sempre soube.",
      alt2: "Você forçou mais do que devia. Por mais tempo do que devia. Seu corpo tá te cobrando a conta. Não com punição. Com informação.",
    },
  },
  _fallback: {
    opening: {
      content: "Sua Linha da Vida tem características que fogem dos padrões convencionais.",
      alt: "O que vi aqui não se encaixa numa única definição de vitalidade.",
      alt2: "Essa linha guarda mais do que a maioria das que eu já li.",
    },
    body_past: {
      content:
        "Você passou por coisas que mudaram sua relação com energia e resistência. Não saiu {{igual}}. Saiu diferente. Mais forte em alguns lugares. Mais cuidadosa em outros.",
      alt: "Sua história com o próprio corpo e sua vitalidade é mais complexa do que parece de fora. Você sabe cada capítulo.",
      alt2: "Atravessou fases que testaram sua resistência de formas que não se repetem. Cada uma deixou algo.",
    },
    body_present: {
      content:
        "O que sua linha da vida mostra hoje é alguém que aprendeu a gerenciar energia de um jeito que só faz sentido pra você.",
      alt: "Você não desperdiça mais como antes. Escolhe onde investe. Isso é experiência, não frieza.",
      alt2: "Sua relação com a própria vitalidade amadureceu. O que parecia limitação virou filtro.",
    },
  },
} as const;
