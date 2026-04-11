import type { TextBlock } from "@/types/blocks";
import type { HandElement } from "@/types/report";

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
    content: "Fogo. Palma quadrada. Dedos curtos. Isso é Fogo.",
    alt: "Palma larga. Dedos que não perdem tempo. Fogo puro.",
    alt2: "Quadrada, compacta, sem enrolação. Mão de Fogo.",
  },
  water: {
    content: "Água. Palma longa. Dedos longos e flexíveis. Isso é Água.",
    alt: "Mão longa, dedos que parecem dançar. Água na forma.",
    alt2: "Palma fina, comprida, dedos articulados. Água.",
  },
  earth: {
    content: "Terra. Palma grande e quadrada. Dedos proporcionais. Isso é Terra.",
    alt: "Palma larga, firme, dedos sólidos. Terra.",
    alt2: "Mão que parece feita pra segurar peso. Terra pura.",
  },
  air: {
    content: "Ar. Palma quadrada. Dedos longos. Isso é Ar.",
    alt: "Palma compacta, dedos compridos e articulados. Ar.",
    alt2: "Dedos que gesticulam. Palma quadrada. Mente de Ar.",
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
