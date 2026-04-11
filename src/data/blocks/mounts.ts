import type { MountBlocks } from "@/types/blocks";
import type { MountKey } from "@/types/hand-attributes";

export const MOUNT_BLOCKS: Record<MountKey, MountBlocks> = {
  jupiter: {
    intro: {
      content: "Monte de Júpiter pronunciado. Na base do indicador. Ambição e liderança.",
      alt: "Júpiter forte. Você quer mais. E mais. Motor que não desliga.",
      alt2: "Monte de Júpiter elevado. Ambição. Autoridade. Fome.",
    },
    body: {
      content:
        "Você quer mais. Sempre quis. As pessoas te seguem sem você pedir. Olham pra você quando a situação complica. Porque você tem a postura de quem vai encontrar saída. Quando entra numa sala, as pessoas sentem. Mesmo em silêncio.",
      alt: "Liderança natural. Não do tipo que grita. Do tipo que organiza sem falar. Assume sem perceber. E quando percebe, já tá todo mundo olhando esperando direção.",
      alt2: "Ambição é seu combustível. Não por dinheiro. Por expansão. Aprender mais, crescer mais, ser mais. Quando atinge um objetivo, já tá mirando o próximo. Isso te move. Também te impede de comemorar.",
    },
  },

  saturn: {
    intro: {
      content: "Saturno forte. Disciplina silenciosa.",
      alt: "Monte de Saturno pronunciado. Estrutura. Resistência.",
      alt2: "Saturno elevado. O monte menos glamoroso. O mais sólido.",
    },
    body: {
      content:
        "Você aguenta o que ninguém aguenta. Não por teimosia. Por propósito. Quando decide que algo importa, segue até o fim. Sem reclamar. Sem postar. Sem esperar reconhecimento.",
      alt: "Disciplina é sua linguagem. Não a que aparece. A que funciona. Rotina, consistência, repetição. Enquanto os outros procuram atalho, você tá no caminho longo que funciona.",
      alt2: "Saturno é o monte do tempo. Você entende tempo melhor que a maioria. Sabe que resultados vêm devagar. Sabe esperar. Sua paciência não é passividade. É estratégia.",
    },
  },

  apollo: {
    intro: {
      content: "Apolo presente. Criatividade e reconhecimento.",
      alt: "Monte de Apolo elevado. Brilho pessoal. Expressão.",
      alt2: "Apolo pronunciado. Onde mora a criatividade que se mostra pro mundo.",
    },
    body: {
      content:
        "Tem algo que você cria que as pessoas param pra olhar. Nem sempre arte. Às vezes é o jeito que arruma um espaço, que monta uma apresentação, que conta uma história. Existe uma estética na forma como você faz as coisas.",
      alt: "Criatividade que transborda. Não no sentido artístico necessariamente. Tudo que toca ganha uma camada que não existia antes. Seu olhar transforma o ordinário.",
      alt2: "Apolo é o monte do brilho. Não do ego. Do brilho autêntico. Aquele que aparece quando você tá fazendo o que ama.",
    },
  },

  mercury: {
    intro: {
      content: "Mercúrio dominante. Comunicação e inteligência verbal.",
      alt: "Monte de Mercúrio pronunciado. Palavras afiadas.",
      alt2: "Mercúrio elevado. A língua é sua ferramenta.",
    },
    body: {
      content:
        "Você convence sem levantar a voz. Sabe escolher as palavras exatas pra cada situação. Quando quer convencer, convence. Quando quer machucar, machuca. Sabe a diferença. Lê as pessoas como eu leio mãos. Sem elas perceberem.",
      alt: "Comunicação é seu superpoder. Não fala muito. Mas quando fala, cada palavra carrega peso. Sabe dosar. Sabe quando falar e quando calar. Os dois têm efeito.",
      alt2: "Mercúrio forte é mente rápida e língua precisa. Processa informação verbal em velocidade acima da média. Lê entrelinhas, percebe tom, detecta mentira. Radar social que nunca desliga.",
    },
  },

  mars: {
    intro: {
      content: "Marte ativo. Coragem que não pede licença.",
      alt: "Monte de Marte pronunciado. Combatividade. Força interna.",
      alt2: "Marte elevado. Coragem de enfrentar o que os outros contornam.",
    },
    body: {
      content:
        "Você enfrenta. Enquanto os outros recuam, você avança. Não é imprudência. É convicção. Quando acredita em algo, vai até o fim. Mesmo que {{sozinha}}. Confia no seu julgamento mais do que no consenso.",
      alt: "Coragem pra você é default. Não precisa pensar pra ser corajosa. Precisa pensar pra ser cautelosa. O oposto da maioria. Isso te colocou em situações incríveis. E em algumas que preferia esquecer.",
      alt2: "Marte forte é fogo no sangue. Você não fica parada esperando acontecer. Vai e faz acontecer. Mesmo quando o plano não tá pronto. O medo tá ali. Você vai mesmo assim.",
    },
  },

  moon: {
    intro: {
      content: "Lua forte. Imaginação e intuição.",
      alt: "Monte da Lua pronunciado. Mundo interior rico.",
      alt2: "Lua elevada. Inconsciente. Sonhos. Coisas que você sabe sem saber como sabe.",
    },
    body: {
      content:
        "Você sonha acordada. E os sonhos fazem sentido depois. Sua imaginação não é fuga. É processamento. Enquanto devaneia, sua mente tá resolvendo problemas em segundo plano.",
      alt: "Intuição forte. Não a mística. A prática. A que te faz saber que algo vai dar errado antes de dar. A que te faz confiar numa pessoa sem motivo lógico. E acertar.",
      alt2: "Lua forte é mundo interior gigante. Pensamentos, cenários, conversas imaginárias, planos que nunca saem da cabeça. Não é loucura. É processamento criativo.",
    },
  },
} as const;
