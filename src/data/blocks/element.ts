import type { TextBlock } from "@/types/blocks";
import type { HandElement } from "@/types/report";

// ---------------------------------------------------------------------------
// ELEMENT_BRIDGE — 12 pares direcionais (primary → secondary)
// Fogo→Agua diferente de Agua→Fogo. 3 variacoes por par.
// Voz da cigana: segunda pessoa, zero travessoes, zero palavras proibidas.
// ---------------------------------------------------------------------------

type ElementBridgeRecord = Record<HandElement, Partial<Record<HandElement, TextBlock>>>;

export const ELEMENT_BRIDGE: ElementBridgeRecord = {
  fire: {
    water: {
      content:
        "Mas tem agua tambem, {{name}}. Voce sente mais do que deixa aparecer. O fogo esconde, a agua guarda. Juntos, explodem.",
      alt: "Tem uma corrente fria sob o fogo. Agua secundaria. Isso explica por que voce para antes de queimar o que ama. So as vezes.",
      alt2: "Fogo com traco de Agua. Voce age com forca, mas sente a consequencia depois, sozinha. E isso nao e fraqueza.",
    },
    earth: {
      content:
        "Terra secundaria. Voce tem mais paciencia do que aparenta. Age rapido, mas nao abandona o que construiu. Isso e raro em maos de Fogo.",
      alt: "Fogo que conhece o peso. Voce queima e planta ao mesmo tempo. A maioria faz so um dos dois.",
      alt2: "Tem raiz aqui, {{name}}. Fogo com Terra. Voce avanca, mas nao solta o que importa. Sabe onde voltar.",
    },
    air: {
      content:
        "Ar secundario. Sua acao tem pensamento. Voce decide rapido, mas nao aleatoriamente. Ha um calculo que os outros nao veem.",
      alt: "Fogo que pensa antes de arder. Ar nos dedos. Voce discute ideias com a mesma intensidade que toma decisoes.",
      alt2: "Fogo e Ar juntos, {{name}}. Voce persuade enquanto age. Nao e sobre ter razao. E sobre nao parar.",
    },
  },
  water: {
    fire: {
      content:
        "Fogo secundario. Ha uma urgencia aqui que voce controla mal. Sente fundo e age impulsivamente. A combinacao cansa.",
      alt: "Agua com fogo dentro. Voce e calma por fora e intensa por dentro. Quem te conhece de verdade sabe.",
      alt2: "Tem chama aqui, {{name}}. Agua dominante, Fogo como sombra. Voce explode quando menos se espera. E passa rapido. Mas passa.",
    },
    earth: {
      content:
        "Terra secundaria. Voce nao so sente. Voce constroi com o que sente. Isso te diferencia de quase toda Agua que ja li.",
      alt: "Agua que nao perde o chao. Terra nos dedos. Sua sensibilidade tem estrutura. Nao e so sentir, e fazer.",
      alt2: "Agua com raiz, {{name}}. Voce suporta mais do que parece. A sensibilidade nao te afunda porque tem Terra embaixo.",
    },
    air: {
      content:
        "Ar secundario. Sua intuiticao tem vocabulario. Voce nomeia o que sente com precisao que poucos tem.",
      alt: "Agua que pensa o que sente. Ar no fundo. Voce analisa as proprias emocoes enquanto as vive. E exaustivo.",
      alt2: "Agua e Ar, {{name}}. Voce e sensivel e articulada. Isso e poder. Tambem e responsabilidade sobre o que fala.",
    },
  },
  earth: {
    fire: {
      content:
        "Fogo secundario. Voce tem urgencias que esconde bem. Por fora, firmeza. Por dentro, uma impaciencia que poucos veem.",
      alt: "Terra com fogo no fundo. Voce constroi devagar e decide rapido quando precisa. A combinacao e mais eficaz do que parece.",
      alt2: "Tem chama aqui, {{name}}. Terra dominante, Fogo como impulso. Quando voce decide ir, vai sem avisar.",
    },
    water: {
      content:
        "Agua secundaria. Voce constroe e sente ao mesmo tempo. A maioria ou faz um ou faz o outro. Voce faz os dois.",
      alt: "Terra com profundidade. Agua nos dedos. Voce absorve mais do que mostra. E guarda mais do que processa.",
      alt2: "Terra e Agua, {{name}}. Voce e confiavel e sensivel. Isso atrai pessoas que precisam de amparo. Nem sempre e reciproco.",
    },
    air: {
      content:
        "Ar secundario. Voce pensa antes de agir, mais do que a maioria das Terras. Isso te protege de erros que os outros cometem.",
      alt: "Terra que questiona. Ar no fundo. Voce nao aceita instrucao sem entender o motivo. Isso atrasa e aprimora.",
      alt2: "Terra e Ar, {{name}}. Voce e solida e curiosa. Constroi com proposito. Nao faz coisa sem sentido.",
    },
  },
  air: {
    fire: {
      content:
        "Fogo secundario. Voce nao so pensa. Voce age sobre o que pensa, mais rapido do que a maioria dos Ares. Isso assusta quem nao te conhece.",
      alt: "Ar com velocidade. Fogo no fundo. Sua mente decide e seu corpo segue sem hesitar. A combinacao e rara.",
      alt2: "Ar e Fogo, {{name}}. Voce convence e age. Nao fica so na teoria. Isso te diferencia de quase todo Ar que ja vi.",
    },
    water: {
      content:
        "Agua secundaria. Sua logica tem emocao. Voce entende as pessoas nao so pela razao, mas por algo que nao consegue nomear.",
      alt: "Ar que sente. Agua nos dedos. Voce analisa e intuiu ao mesmo tempo. Soa contraditorio. Nao e.",
      alt2: "Ar e Agua, {{name}}. Voce e inteligente e empatica. Isso te faz ouvir o que os outros nao conseguem esconder.",
    },
    earth: {
      content:
        "Terra secundaria. Voce tem mais persistencia do que o Ar costuma ter. Sua mente nao so explora, ela termina o que comeca.",
      alt: "Ar com raiz. Terra no fundo. Voce tem ideias e tambem tem o que e preciso pra colocar elas no mundo.",
      alt2: "Ar e Terra, {{name}}. Voce pensa e produz. Nao e so teoria. Ha resultado no final. Isso e mais do que a maioria dos Ares entrega.",
    },
  },
};

// ---------------------------------------------------------------------------
// ELEMENT_EXCLUSIVITY_MIXED — 12 strings pra maos mistas
// Percentagens ficticias coerentes (4% a 12%). Brand voice: cigana direta.
// ---------------------------------------------------------------------------

type ElementExclusivityMixedRecord = Record<HandElement, Partial<Record<HandElement, string>>>;

export const ELEMENT_EXCLUSIVITY_MIXED: ElementExclusivityMixedRecord = {
  fire: {
    water: "Apenas 7% das maos que eu ja li tem Fogo com traco de Agua.",
    earth: "Apenas 9% das maos que eu ja li tem Fogo com traco de Terra.",
    air: "Apenas 8% das maos que eu ja li tem Fogo com traco de Ar.",
  },
  water: {
    fire: "Apenas 6% das maos que eu ja li tem Agua com traco de Fogo.",
    earth: "Apenas 11% das maos que eu ja li tem Agua com traco de Terra.",
    air: "Apenas 10% das maos que eu ja li tem Agua com traco de Ar.",
  },
  earth: {
    fire: "Apenas 5% das maos que eu ja li tem Terra com traco de Fogo.",
    water: "Apenas 12% das maos que eu ja li tem Terra com traco de Agua.",
    air: "Apenas 8% das maos que eu ja li tem Terra com traco de Ar.",
  },
  air: {
    fire: "Apenas 4% das maos que eu ja li tem Ar com traco de Fogo.",
    water: "Apenas 9% das maos que eu ja li tem Ar com traco de Agua.",
    earth: "Apenas 11% das maos que eu ja li tem Ar com traco de Terra.",
  },
};

export const ELEMENT_IMPACT: Record<HandElement, TextBlock> = {
  fire: {
    content: "Suas mãos queimam, {{name}}. Eu sei antes de olhar.",
    alt: "{{name}}. Fogo. Senti antes de ver.",
    alt2: "Suas mãos já tinham falado quando você entrou, {{name}}.",
  },
  water: {
    content: "Suas mãos transbordam, {{name}}. Cuidado com o que vou dizer.",
    alt: "{{name}}. Água. Tudo que você sente, suas mãos já choraram.",
    alt2: "Eu preciso ir devagar com você, {{name}}. Suas mãos sentem tudo.",
  },
  earth: {
    content: "Suas mãos sustentam, {{name}}. Pesadas de propósito.",
    alt: "{{name}}. Terra. Suas mãos constroem o que os outros só planejam.",
    alt2: "Firmes. Grossas. Seguras. Suas mãos não tremem, {{name}}.",
  },
  air: {
    content: "Suas mãos pensam, {{name}}. E não param.",
    alt: "{{name}}. Ar. Sua mente já leu metade do relatório antes de eu começar.",
    alt2: "Rápidas. Inquietas. Suas mãos se movem como sua cabeça, {{name}}.",
  },
} as const;

export const ELEMENT_INTRO: Record<HandElement, TextBlock> = {
  fire: {
    content:
      "Palma quadrada. Dedos curtos. Mao de Fogo. Voce age antes de pensar, e o mundo gira na sua direcao por causa disso.",
    alt: "Palma larga. Dedos que nao perdem tempo. Fogo puro. Isso significa que voce nao espera. Nunca esperou.",
    alt2: "Quadrada, compacta, sem enrolacao. Mao de Fogo. Quem tem essa mao nao pede licenca pra entrar.",
  },
  water: {
    content:
      "Palma longa. Dedos longos e flexíveis. Mao de Agua. Voce sente o que os outros nem registram, e isso e sua potencia e seu peso.",
    alt: "Mao longa, dedos que parecem dancar. Agua na forma. Tudo te atravessa. Tudo fica.",
    alt2: "Palma fina, comprida, dedos articulados. Mao de Agua. Sua sensibilidade nao e fraqueza. E radar.",
  },
  earth: {
    content:
      "Palma grande e quadrada. Dedos proporcionais. Mao de Terra. Voce constroi em silencio o que os outros so planejam.",
    alt: "Palma larga, firme, dedos solidos. Terra pura. Suas raizes sao fundas. Quando decide ficar, fica.",
    alt2: "Mao que parece feita pra segurar peso. Terra. As pessoas confiam em voce sem saber por que.",
  },
  air: {
    content:
      "Palma quadrada. Dedos longos. Mao de Ar. Sua cabeca trabalha em camadas que os outros nem percebem.",
    alt: "Palma compacta, dedos compridos e articulados. Ar. Voce entende rapido. Rapido demais, as vezes.",
    alt2: "Dedos que gesticulam. Palma quadrada. Mente de Ar. Voce ja esta cinco passos na frente. O problema e que la e solitario.",
  },
} as const;

export const ELEMENT_BODY: Record<HandElement, TextBlock> = {
  fire: {
    content:
      "Você decide antes de pensar. Age antes de planejar. Se arrepende devagar, porque no fundo sabe que faria tudo de novo. Sua energia é a primeira coisa que as pessoas notam quando você entra numa sala. A última que esquecem quando você sai. Medo de errar? Nenhum. Medo de ficar parada. Esse sim. O tédio te destrói mais rápido que qualquer erro.",
    alt: "Você não espera. Nunca esperou. Enquanto o mundo ainda tá pensando, você já fez, errou, e fez de novo. Seu corpo não sabe ficar quieto. Sua presença enche o espaço todo. Não é barulho. É calor. Quem te conhece sabe que não adianta pedir calma. Calma, pra você, é só o intervalo entre duas decisões.",
    alt2: "Ação primeiro. Reflexão depois. Às vezes nem isso. Você funciona por instinto, e seu instinto acerta mais do que deveria. As pessoas gravitam na sua direção sem entender por quê. Simples: você tem uma urgência de viver que contagia. Parar te sufoca. Rotina te mata. Você precisa de movimento, de risco, de algo pra conquistar. Sem isso, murcha.",
  },
  water: {
    content:
      "Você sente tudo mais forte. O toque, o olhar, a ausência. Sua intuição fala mais alto que qualquer argumento. E quase nunca erra. Você absorve o ambiente inteiro quando entra num lugar. A tensão dos outros vira sua tensão. A tristeza dos outros pesa no seu corpo. Não é fraqueza. É um radar que nunca desliga. E às vezes você queria que desligasse.",
    alt: "Tudo te atravessa. Uma música, um cheiro, o jeito que alguém olhou pra você três dias atrás. Você guarda tudo. Não porque escolhe. Porque não consegue não guardar. As pessoas te procuram quando precisam ser ouvidas, porque você escuta com o corpo inteiro. Só que ninguém pergunta quem escuta você.",
    alt2: "Sua sensibilidade não é delicadeza. É potência. Você percebe o que os outros nem registram: a mudança de tom, o silêncio que dura meio segundo a mais, o sorriso que não chega nos olhos. Isso te protege. Também te exaure. Quando ama, ama submersa. Quando sofre, afunda. Mas sempre volta à superfície. Sempre.",
  },
  earth: {
    content:
      "Você constrói em silêncio. Destrói em silêncio também. Ninguém te vê trabalhando, mas todo mundo vê o resultado. Sua palavra vale mais que contrato. Quando promete, entrega. Quando não promete, é porque sabe que não pode. Você não impressiona de primeira. Impressiona de segunda, terceira, décima vez. Porque cada vez que alguém olha de novo, tem mais coisa construída ali.",
    alt: "Paciência não é sua virtude. É sua arma. Você aguenta o que os outros não aguentam, porque enxerga o que tá sendo construído enquanto todo mundo só vê a obra parada. Suas raízes são fundas. Quando decide ficar, fica. Quando decide ir embora, arranca as raízes e leva a terra junto.",
    alt2: "Confiança. É isso que sua mão transmite antes de qualquer leitura. As pessoas confiam em você sem saber por quê. Talvez seja a firmeza. Talvez seja o jeito que você não promete o que não pode cumprir. Você não brilha. Você sustenta. E quem já precisou de sustentação sabe o valor disso.",
  },
  air: {
    content:
      "Você pensa em duas direções. Sempre. Sua cabeça é sua melhor arma e seu pior inimigo. Conversa é oxigênio pra você. Trocar ideia, debater, provocar. Ficar em silêncio por muito tempo te deixa ansiosa. Você precisa de estímulo mental constante. Gente interessante, problemas complexos, coisas pra descobrir. Sem isso, sua cabeça vira contra você mesma.",
    alt: "Curiosidade. Não a boba. A que não te deixa dormir porque você tá conectando dois assuntos que ninguém mais conectou. Você entende rápido. Rápido demais, às vezes. Explica uma vez e já cansou. Se a pessoa não acompanha, você segue sem {{ela}}. Não é arrogância. É ritmo.",
    alt2: "Sua mente trabalha em camadas. Enquanto conversa sobre uma coisa, já tá processando outras três. As pessoas acham que você tá distraída. Você tá cinco passos na frente. O problema é que cinco passos na frente é um lugar solitário. Ninguém entende o que você tá vendo até chegar lá. E quando chegam, você já foi.",
  },
} as const;
