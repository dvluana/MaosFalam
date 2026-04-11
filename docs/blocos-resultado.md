# MÃOSFALAM — Blocos de Texto v2

## ~515 textos na voz da cigana (corrigido anti-IA)

Marcadores: `{{name}}`, `{{inteira}}`, `{{fria}}`, `{{cirúrgica}}`, `{{sonhadora}}`, `{{sozinha}}`, `{{preparada}}`, `{{outra}}`, `{{ela}}`, `{{dela}}`, `{{uma}}`, `{{ligada}}`, `{{quieta}}`, `{{devastada}}`, `{{vista}}`, `{{presa}}`, `{{segura}}`, `{{certa}}`, `{{perdida}}`

### Correções aplicadas vs v1:

- Paralelismos "Quando X, Y. Quando Z, W." quebrados (estruturas assimétricas)
- Ritmo variado entre content/alt/alt2 (denso, seco, vagante)
- "Não é X. É Y." reduzido drasticamente (afirmações diretas)
- "ao mesmo tempo" eliminado quase por completo
- Closes genéricos ("mais raro do que imagina") substituídos por cortes específicos
- Vocabulário "intensidade/profundidade/resiliência" trocado por imagens concretas

---

# 0. REPORT OPENING & EPILOGUE (6 textos)

## report_opening

- **content:** Senta, {{name}}. Eu vou começar pelo começo. Tem muita coisa pra dizer, e a gente não tem pressa.
- **alt:** {{name}}. Fica quieta. Eu vou falar e você vai ouvir. Depois você decide o que faz com o que eu disser.
- **alt2:** Pronta, {{name}}? Porque eu já vi. E eu vi bastante.

## epilogue

- **content:** Foi isso que suas mãos me contaram. Agora é com você.
- **alt:** Eu disse o que vi. O que você faz com isso é escolha sua. Sempre foi.
- **alt2:** Suas mãos já falaram. Agora é a sua vez.

---

# 0.1 SECTION META

```typescript
export const SECTION_META = {
  prologue: {
    number: null,
    title: null,
    label: null,
    icon: null,
    accent: "gold",
    tier: "free",
  },
  heart: {
    number: "01",
    title: "Como você ama",
    label: "♀ Linha do Coração · Vênus",
    icon: "♀",
    accent: "rose",
    tier: "free",
  },
  head: {
    number: "02",
    title: "O que não te deixa dormir",
    label: "☿ Linha da Cabeça · Mercúrio",
    icon: "☿",
    accent: "violet",
    tier: "premium",
  },
  life: {
    number: "03",
    title: "O que você já sobreviveu",
    label: "☉ Linha da Vida · Sol",
    icon: "☉",
    accent: "gold",
    tier: "premium",
  },
  venus: {
    number: "04",
    title: "Quando a porta fecha",
    label: "♀ Monte de Vênus · Cinturão de Vênus",
    icon: "♀",
    accent: "rose",
    tier: "premium",
  },
  mounts: {
    number: "05",
    title: "Como o mundo te vê",
    label: "Montes da Mão",
    icon: null,
    accent: "gold",
    tier: "premium",
  },
  fate: {
    number: "06",
    title: "Pra onde você tá indo",
    label: "♄ Linha do Destino · Saturno",
    icon: "♄",
    accent: "violet",
    tier: "premium",
  },
  crossings: {
    number: "07",
    title: "Onde tudo se encontra",
    label: "Cruzamentos",
    icon: null,
    accent: "gold",
    tier: "premium",
  },
  compatibility: {
    number: "08",
    title: "Com quem suas mãos conversam",
    label: "Compatibilidade por Elemento",
    icon: null,
    accent: "rose",
    tier: "premium",
  },
  rare_signs: {
    number: "09",
    title: "O que quase ninguém tem",
    label: "Sinais Raros",
    icon: null,
    accent: "gold",
    tier: "premium",
  },
} as const;
```

### Retrato da Mão

```typescript
interface HandPortrait {
  dominant_mount: string;
  lines_detected: string;
  mounts_mapped: string;
  rare_signs_found: string;
  exclusivity: string;
}
```

| Elemento | % exclusividade |
| -------- | --------------- |
| Fogo     | 18%             |
| Água     | 22%             |
| Terra    | 35%             |
| Ar       | 25%             |

---

# 1. IMPACT PHRASES (8 fixos)

| Key                     | Frase                                                             |
| ----------------------- | ----------------------------------------------------------------- |
| `fire_heart_straight`   | Você carrega mais do que mostra. Quem olha de fora não faz ideia. |
| `water_heart_curved`    | Suas mãos guardam o que você nunca disse em voz alta.             |
| `earth_fate_deep`       | Tudo o que você construiu em silêncio tá escrito aqui.            |
| `air_head_long`         | Sua mente nunca descansa. Suas mãos confirmam.                    |
| `fire_venus_pronounced` | Quem te conhece de verdade sabe. O resto imagina.                 |
| `water_life_broken`     | Você recomeçou. Suas mãos recomeçaram junto.                      |
| `earth_rare_signs`      | Tem algo na sua mão que quase ninguém tem. Eu vi.                 |
| `air_fate_absent`       | Sem destino fixo. Direção que ninguém entende ainda.              |

---

# 2. TRANSITIONS (10 fixos)

| Key                   | Frase                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `prologue_to_heart`   | Agora que eu sei quem você é... preciso ver como você ama.                                     |
| `heart_to_paywall`    | Isso é como você ama. Agora eu preciso te contar por que sua cabeça não deixa.                 |
| `paywall_to_head`     | Continuando... sua cabeça tem muito a dizer.                                                   |
| `head_to_life`        | Sua mente eu já vi. Agora preciso olhar o que ficou marcado no caminho.                        |
| `life_to_venus`       | Você sobreviveu a tudo isso. Agora... essa parte eu falo baixo.                                |
| `venus_to_mounts`     | Agora que eu sei como você se entrega... preciso te mostrar como o mundo te vê.                |
| `mounts_to_fate`      | Falta uma coisa. Pra onde tudo isso tá te levando.                                             |
| `fate_to_crossings`   | Até aqui eu li pedaço por pedaço. Agora vou te mostrar o que acontece quando tudo se encontra. |
| `crossings_to_compat` | Já li suas linhas. Já mapeei seus montes. Falta saber com quem suas mãos conversam melhor.     |
| `compat_to_rare`      | Quase terminei. Mas tem uma última coisa.                                                      |

---

# 3. ELEMENT (Prólogo) — 36 textos

## fire

### impact

- **content:** Suas mãos queimam, {{name}}. Eu sei antes de olhar.
- **alt:** {{name}}. Fogo. Senti antes de ver.
- **alt2:** Suas mãos já tinham falado quando você entrou, {{name}}.

### intro

- **content:** Fogo. Palma quadrada. Dedos curtos. Isso é Fogo.
- **alt:** Palma larga. Dedos que não perdem tempo. Fogo puro.
- **alt2:** Quadrada, compacta, sem enrolação. Mão de Fogo.

### body

- **content:** Você decide antes de pensar. Age antes de planejar. Se arrepende devagar, porque no fundo sabe que faria tudo de novo. Sua energia é a primeira coisa que as pessoas notam quando você entra numa sala. A última que esquecem quando você sai. Medo de errar? Nenhum. Medo de ficar parada. Esse sim. O tédio te destrói mais rápido que qualquer erro.
- **alt:** Você não espera. Nunca esperou. Enquanto o mundo ainda tá pensando, você já fez, errou, e fez de novo. Seu corpo não sabe ficar quieto. Sua presença enche o espaço todo. Não é barulho. É calor. Quem te conhece sabe que não adianta pedir calma. Calma, pra você, é só o intervalo entre duas decisões.
- **alt2:** Ação primeiro. Reflexão depois. Às vezes nem isso. Você funciona por instinto, e seu instinto acerta mais do que deveria. As pessoas gravitam na sua direção sem entender por quê. Simples: você tem uma urgência de viver que contagia. Parar te sufoca. Rotina te mata. Você precisa de movimento, de risco, de algo pra conquistar. Sem isso, murcha.

---

## water

### impact

- **content:** Suas mãos transbordam, {{name}}. Cuidado com o que vou dizer.
- **alt:** {{name}}. Água. Tudo que você sente, suas mãos já choraram.
- **alt2:** Eu preciso ir devagar com você, {{name}}. Suas mãos sentem tudo.

### intro

- **content:** Água. Palma longa. Dedos longos e flexíveis. Isso é Água.
- **alt:** Mão longa, dedos que parecem dançar. Água na forma.
- **alt2:** Palma fina, comprida, dedos articulados. Água.

### body

- **content:** Você sente tudo mais forte. O toque, o olhar, a ausência. Sua intuição fala mais alto que qualquer argumento. E quase nunca erra. Você absorve o ambiente inteiro quando entra num lugar. A tensão dos outros vira sua tensão. A tristeza dos outros pesa no seu corpo. Não é fraqueza. É um radar que nunca desliga. E às vezes você queria que desligasse.
- **alt:** Tudo te atravessa. Uma música, um cheiro, o jeito que alguém olhou pra você três dias atrás. Você guarda tudo. Não porque escolhe. Porque não consegue não guardar. As pessoas te procuram quando precisam ser ouvidas, porque você escuta com o corpo inteiro. Só que ninguém pergunta quem escuta você.
- **alt2:** Sua sensibilidade não é delicadeza. É potência. Você percebe o que os outros nem registram: a mudança de tom, o silêncio que dura meio segundo a mais, o sorriso que não chega nos olhos. Isso te protege. Também te exaure. Quando ama, ama submersa. Quando sofre, afunda. Mas sempre volta à superfície. Sempre.

---

## earth

### impact

- **content:** Suas mãos sustentam, {{name}}. Pesadas de propósito.
- **alt:** {{name}}. Terra. Suas mãos constroem o que os outros só planejam.
- **alt2:** Firmes. Grossas. Seguras. Suas mãos não tremem, {{name}}.

### intro

- **content:** Terra. Palma grande e quadrada. Dedos proporcionais. Isso é Terra.
- **alt:** Palma larga, firme, dedos sólidos. Terra.
- **alt2:** Mão que parece feita pra segurar peso. Terra pura.

### body

- **content:** Você constrói em silêncio. Destrói em silêncio também. Ninguém te vê trabalhando, mas todo mundo vê o resultado. Sua palavra vale mais que contrato. Quando promete, entrega. Quando não promete, é porque sabe que não pode. Você não impressiona de primeira. Impressiona de segunda, terceira, décima vez. Porque cada vez que alguém olha de novo, tem mais coisa construída ali.
- **alt:** Paciência não é sua virtude. É sua arma. Você aguenta o que os outros não aguentam, porque enxerga o que tá sendo construído enquanto todo mundo só vê a obra parada. Suas raízes são fundas. Quando decide ficar, fica. Quando decide ir embora, arranca as raízes e leva a terra junto.
- **alt2:** Confiança. É isso que sua mão transmite antes de qualquer leitura. As pessoas confiam em você sem saber por quê. Talvez seja a firmeza. Talvez seja o jeito que você não promete o que não pode cumprir. Você não brilha. Você sustenta. E quem já precisou de sustentação sabe o valor disso.

---

## air

### impact

- **content:** Suas mãos pensam, {{name}}. E não param.
- **alt:** {{name}}. Ar. Sua mente já leu metade do relatório antes de eu começar.
- **alt2:** Rápidas. Inquietas. Suas mãos se movem como sua cabeça, {{name}}.

### intro

- **content:** Ar. Palma quadrada. Dedos longos. Isso é Ar.
- **alt:** Palma compacta, dedos compridos e articulados. Ar.
- **alt2:** Dedos que gesticulam. Palma quadrada. Mente de Ar.

### body

- **content:** Você pensa em duas direções. Sempre. Sua cabeça é sua melhor arma e seu pior inimigo. Conversa é oxigênio pra você. Trocar ideia, debater, provocar. Ficar em silêncio por muito tempo te deixa ansiosa. Você precisa de estímulo mental constante. Gente interessante, problemas complexos, coisas pra descobrir. Sem isso, sua cabeça vira contra você mesma.
- **alt:** Curiosidade. Não a boba. A que não te deixa dormir porque você tá conectando dois assuntos que ninguém mais conectou. Você entende rápido. Rápido demais, às vezes. Explica uma vez e já cansou. Se a pessoa não acompanha, você segue sem {{ela}}. Não é arrogância. É ritmo.
- **alt2:** Sua mente trabalha em camadas. Enquanto conversa sobre uma coisa, já tá processando outras três. As pessoas acham que você tá distraída. Você tá cinco passos na frente. O problema é que cinco passos na frente é um lugar solitário. Ninguém entende o que você tá vendo até chegar lá. E quando chegam, você já foi.

---

# 4. HEART (Cap 01) — 90 textos

## long_straight

**opening:**

- **content:** Sua Linha do Coração corta a palma inteira sem desvio. Sem curva. Sem hesitação.
- **alt:** Reta. Longa. Atravessa a mão como se tivesse pressa de chegar do outro lado.
- **alt2:** Uma linha que não negocia. Vai de ponta a ponta sem pedir licença.

**body_past:**

- **content:** Quando você ama, ama com tudo. Não existe versão parcial de você num relacionamento. Você entra {{inteira}} ou não entra. Sempre foi assim. Desde a primeira vez que confiou em alguém e descobriu que confiança tem preço.
- **alt:** Você nunca amou pela metade. Mesmo quando deveria. A primeira vez que se machucou, não aprendeu a amar menos. Aprendeu a escolher melhor. A intensidade? Ficou igualzinha.
- **alt2:** O amor pra você sempre foi tudo ou nada. Nenhuma zona cinza. Quando estava dentro, estava de corpo e alma. Quando saiu, saiu como se nunca tivesse existido. Só que existiu. E você lembra de tudo.

**body_present:**

- **content:** E quando sai, queima o caminho pra não ter volta. Não por maldade. Por autopreservação. Você sabe que se deixar a porta aberta, volta. E voltar pra algo que já acabou é a única coisa que sua linha reta não permite. As pessoas acham que você é {{fria}} quando termina. Você é {{cirúrgica}}. A dor tá lá. Ninguém vê, porque você decidiu que ninguém vai ver.
- **alt:** Cortar é seu mecanismo de sobrevivência. Quando percebe que acabou, acabou. Sem volta. Sem talvez. Sem "vamos ver". As pessoas não entendem. Chamam de frieza. É clareza. Dolorosa, mas clareza.
- **alt2:** Você termina como faz tudo: com decisão. O problema é que decisões assim custam noites. Ninguém vê as noites. Veem só a porta fechada. E acham que foi fácil.

## long_curved

**opening:**

- **content:** Sua Linha do Coração é longa e curva. Faz uma trajetória generosa pela palma. Coração que não economiza.
- **alt:** Longa, com curva suave. Coração que abraça antes de avaliar.
- **alt2:** Atravessa a palma inteira, mas fazendo curvas. Como se quisesse tocar todos os cantos antes de parar.

**body_past:**

- **content:** Você ama com demonstração. Não fica calculando se já deu demais. Quando gosta, o mundo inteiro sabe. Sua generosidade emocional é sua marca. Também já foi sua fraqueza. Teve gente que recebeu demais e devolveu de menos. Você sabe quem.
- **alt:** Afeto pra você é ação. Não é falar "eu te amo". É fazer café, lembrar do detalhe, estar ali às 3h da manhã sem ninguém pedir. Você dá sem contar. Conta só depois, quando percebe que deu demais.
- **alt2:** Coração aberto. Aberto demais, às vezes. Você já amou gente que não merecia nem metade do que você ofereceu. A parte difícil não foi descobrir isso. Foi admitir que faria de novo.

**body_present:**

- **content:** A curva mostra que você se adapta. Cada pessoa que passou pela sua vida mudou alguma coisa na forma como você ama. Não te endureceu. Te refinou. Você ainda ama com tudo. Mas agora sabe onde termina você e começa a {{outra}} pessoa. Nem sempre soube.
- **alt:** Você aprendeu a amar sem se perder. Levou tempo. Custou gente. Mas agora tem um limite que não existia antes. Não é muro. É porta. Você escolhe quem entra.
- **alt2:** Hoje seu amor tem forma. Antes era rio transbordando. Agora é rio com margem. Ainda fundo. Ainda forte. Mas sabe o caminho.

## long_deep_curved

**opening:**

- **content:** Longa, funda, e com curva acentuada. Essa linha tem peso. Das mais marcadas que eu já vi.
- **alt:** Profunda e curva. Coração que marca quem toca.
- **alt2:** Essa linha não sussurra. Grita. Profundidade e curvatura juntas.

**body_past:**

- **content:** Você não ama. Submerge. O tamanho do que você sente assusta quem tá perto. Assusta você também, às vezes. Mas você não sabe funcionar de outro jeito. Amar parcialmente é como respirar pela metade.
- **alt:** Desde cedo você soube que sentia diferente. Mais fundo, mais tempo, mais detalhado. Enquanto os outros esqueciam, você ainda tava processando. Não é melancolia. É profundidade. Tem diferença.
- **alt2:** Cada relacionamento deixou marca. Não cicatriz. Marca. Tipo entalhe em madeira. Você carrega todos. Não como peso. Como registro.

**body_present:**

- **content:** Essa linha mostra alguém que sente em alta definição. Cada toque fica. Cada ausência fica mais. Você não faz amor pela metade. E quando acaba, acaba como se nunca tivesse existido. Só que existiu. Você lembra de cada detalhe. Cada cheiro. Cada silêncio.
- **alt:** Hoje você sabe o tamanho do que sente. E sabe que nem todo mundo aguenta. Por isso escolhe com cuidado. Quem entra, entra sabendo. Ou deveria.
- **alt2:** Sua intensidade é um filtro natural. Gente rasa foge. Gente funda fica. O problema é que gente funda é rara. E entre uma e outra, o silêncio pesa.

## short_straight

**opening:**

- **content:** Linha do Coração curta e reta. Objetiva. Sem rodeios.
- **alt:** Curta. Direta. Sua linha do amor não perde tempo com firulas.
- **alt2:** Pouca linha. Muito conteúdo. Curta e reta como sua paciência pro drama.

**body_past:**

- **content:** Você não é de grandes declarações. Nunca foi. Seu amor aparece no gesto, não na palavra. Na presença silenciosa, não no discurso. Quem te conhece de verdade sabe ler esses sinais. Quem não conhece, acha que você não se importa.
- **alt:** Amor pra você é prático. Resolver o problema, estar lá quando precisa, não fazer drama quando não precisa. Simples. Só que simples confunde quem precisa de performance.
- **alt2:** Você mostra amor fazendo. Não dizendo. Isso confunde gente que precisa ouvir pra acreditar. Você já cansou de explicar. Agora só fica perto de quem entende sem precisar de legenda.

**body_present:**

- **content:** Linha curta não significa pouco amor. Significa amor concentrado. Sem diluir. Você ama poucas pessoas, mas ama de verdade. E "de verdade" pra você tem peso. Não é figura de linguagem.
- **alt:** Poucas pessoas têm acesso ao que você sente. Grupo pequeno. Fechado. Quem tá dentro sabe o que tem. Quem tá fora acha que não tem nada. Os dois estão errados.
- **alt2:** Você seleciona. Não por arrogância. Por capacidade. Seu coração não é pra muita gente. E tá tudo bem.

## short_curved

**opening:**

- **content:** Curta, mas com curva. Coração pequeno que abraça apertado.
- **alt:** Pouca extensão, muita curvatura. Amor compacto e quente.
- **alt2:** Sua linha é curta e faz curva. Pouco espaço, muita coisa concentrada ali.

**body_past:**

- **content:** Você é de perto. Seu amor funciona na distância de um abraço, não de uma mensagem. Sempre preferiu presença a promessa. Aprendeu cedo que quem promete muito geralmente entrega pouco.
- **alt:** Intimidade pra você é espaço físico. Dividir sofá, cozinhar junto, dormir encostada. O digital nunca substituiu o real. Você não finge que substitui.
- **alt2:** Poucos, perto, de verdade. Essa é sua fórmula. Não é receita de autoajuda. É como você funciona desde sempre.

**body_present:**

- **content:** A curva numa linha curta mostra afeto concentrado e seletivo. Você não distribui carinho. Deposita. Em poucas pessoas. E espera que cuidem. Quando não cuidam, retira sem aviso.
- **alt:** Seu amor tem calor. Concentrado. Quem recebe, sente. Quem perde, lembra. Você não volta a oferecer o que já foi recusado. Orgulho? Talvez. Inteligência emocional? Com certeza.
- **alt2:** Você ama como fogueira num quarto pequeno. Quente demais pra quem não aguenta. Perfeito pra quem sabe ficar perto.

## medium_straight

**opening:**

- **content:** Linha do Coração média e reta. Equilíbrio entre razão e afeto.
- **alt:** Nem longa, nem curta. Nem curva, nem severa. Equilíbrio raro no amor.
- **alt2:** Sua linha de amor é moderada. Não transborda. Não seca. Flui.

**body_past:**

- **content:** Você ama com consciência. Sabe o que sente, sabe por que sente, e sabe quando parar de sentir. Isso não significa que não dói. Significa que a dor não te controla.
- **alt:** Sempre teve um pé no coração e outro na razão. Quando um puxa demais, o outro equilibra. Isso te salvou de muita besteira. Também te impediu de viver umas loucuras que talvez valesse a pena.
- **alt2:** Seu amor é calibrado. Não calculado. Calibrado. Tem diferença. Calculado é frio. Calibrado é preciso. Você sabe quanto dar e quanto guardar.

**body_present:**

- **content:** Linha média e reta mostra alguém que funciona bem no amor quando a {{outra}} pessoa também funciona. Você não salva ninguém. Não carrega ninguém. Quer parceria, não projeto. Quando percebe que virou projeto, sai.
- **alt:** Você quer alguém que caminhe do lado. Não atrás, não na frente. Do lado. Parece simples. É a coisa mais difícil de encontrar.
- **alt2:** Relacionamento pra você precisa fazer sentido. Não só emocional. Prático. Cotidiano. Quando o cotidiano não funciona, o emocional não salva. Você sabe disso por experiência.

## medium_curved

**opening:**

- **content:** Linha média com curvatura. Coração que pensa antes de sentir, mas sente quando decide.
- **alt:** Comprimento moderado, curva presente. Afeto que chega depois da confiança.
- **alt2:** Sua linha tem medida e tem curva. Coração que se abre devagar, mas abre inteiro.

**body_past:**

- **content:** Você não se entrega de primeira. Precisa de tempo. De provas. De consistência. Não é desconfiança. É processo. E quando finalmente decide que alguém merece, a entrega é total. Quem esperou sabe que valeu.
- **alt:** Devagar. Sempre foi devagar. Enquanto os outros se apaixonavam em semanas, você levava meses pra admitir que gostava. Não é medo. É critério. E seu critério já te protegeu de muita gente errada.
- **alt2:** Amor pra você é construção. Tijolo por tijolo. Sem pressa. Sem pressão. Quem tenta apressar o processo, perde. Quem respeita o ritmo, ganha algo que não se encontra fácil.

**body_present:**

- **content:** Curvatura numa linha média é afeto que se revela aos poucos. Não é fogo. É brasa. Demora pra acender. Demora mais pra apagar. Quando apaga, é porque você decidiu.
- **alt:** Hoje você sabe exatamente o que quer. E o que não quer. A lista do que não quer é mais longa. Não por amargura. Por clareza.
- **alt2:** Você escolhe devagar e ama firme. Quando finalmente abre, a profundidade surpreende. Inclusive você.

## faint

**opening:**

- **content:** Sua Linha do Coração é tênue. Suave. Quase sussurrada na palma.
- **alt:** Fraca. Não ausente. Fraca. Como voz que fala baixo mas diz coisas pesadas.
- **alt2:** Linha fina, quase invisível. Mas tá lá. Sempre esteve.

**body_past:**

- **content:** Você protege o que sente. Sempre protegeu. Não é que não sinta. É que aprendeu cedo que mostrar o que sente é dar munição. E você não distribui munição. Guarda, protege, e só mostra pra quem provou que merece.
- **alt:** Tem gente que acha que você não sente. Tá errada. Você sente tudo. Só que pra dentro. O que chega na superfície é a versão editada. A versão completa, ninguém viu. Talvez nem você.
- **alt2:** Emoção pra você é território privado. Não é vergonha. É território. Seu. E você não deixa qualquer um entrar.

**body_present:**

- **content:** Linha tênue não é coração fraco. É coração blindado. A blindagem não nasceu com você. Foi construída. Cada vez que confiou e não deveria. Cada vez que abriu e se machucou. A linha ficou mais fina porque você decidiu sentir com mais cuidado.
- **alt:** Hoje seu amor tem filtro. Não o que esconde. O que seleciona. Passa pouca gente. Mas quem passa encontra algo que não esperava. Porque por trás da linha fina tem um oceano que você não mostra pra ninguém.
- **alt2:** Você construiu um sistema de proteção eficiente. Funciona. Ninguém entra sem convite. O problema é que às vezes você esquece de convidar. E a solidão que vem disso não é por falta de gente. É por excesso de filtro.

---

## Modificadores do Coração (6 × 3 = 18)

### fork_end

- **content:** Bifurcação no final da linha. Conflito antigo: liberdade ou entrega total. Você quer os dois. Já tentou viver os dois. Não funcionou, né?
- **alt:** Tem uma divisão no final. Dois caminhos emocionais que puxam pra direções opostas. Você quer estabilidade e quer liberdade. E não aceita que tenha que escolher.
- **alt2:** Sua linha se divide perto do final. Indecisão emocional cristalizada na mão. Você quer mais de uma coisa. E geralmente consegue. Até não conseguir.

### island

- **content:** Tem uma ilha aqui. Período de confusão emocional. Já passou, mas ficou marcado. Não precisa me dizer o que foi. Eu já sei que doeu.
- **alt:** Uma ilha na Linha do Coração. Período onde o amor virou labirinto. Você entrou, se perdeu, eventualmente saiu. Mas não saiu igual.
- **alt2:** Ilha. Marca de turbulência num período específico. Relação tóxica, perda, traição. Pode ter sido qualquer uma. Você sabe qual foi.

### break

- **content:** Tem uma interrupção na linha. Algo cortou fundo. Você sabe o quê. A linha continuou depois. Mais funda, inclusive. Mas o corte ficou.
- **alt:** Uma pausa. Sua linha parou e recomeçou. Isso é ruptura. Não término normal. Ruptura. O tipo que muda como você funciona no amor dali pra frente.
- **alt2:** Interrupção. Algo partiu a linha em duas fases: antes e depois. O depois é diferente. Mais {{segura}}. Mais {{certa}} do que aceita.

### ends_index

- **content:** Sua linha termina no Monte de Júpiter. Você escolhe quem ama com a cabeça. Não por frieza. Por padrão. Busca alguém que admira, não só que deseja. Quando o respeito acaba, você vai embora antes da paixão acabar.
- **alt:** Terminação no indicador. Ambição no amor. Você quer alguém à altura. Não em status. Em substância. Se não te desafia intelectualmente, perde a graça rápido.
- **alt2:** Júpiter. Sua linha aponta pra liderança até no amor. Parceria de igual pra igual. Não cuida, não salva, não tolera ser cuidada quando não pediu.

### ends_middle

- **content:** Sua linha termina no Monte de Saturno. Segurança antes de paixão. Você precisa de base sólida antes de se entregar. Não é falta de desejo. É prioridade.
- **alt:** Terminação em Saturno. Estabilidade é sua linguagem de amor. Sem chão firme, seu coração não arrisca. Você já tentou sem chão. Sabe no que dá.
- **alt2:** Saturno. Sua linha termina no lugar da disciplina. Amor pra você precisa de estrutura. Não de jaula. De estrutura. Rotina, plano, futuro. Sem isso, paixão é só adrenalina.

### deep

- **content:** A profundidade dessa linha mostra alguém que sente em alta definição. Cada toque fica. Cada ausência fica mais. Quando ama, imprime. Quando para, a marca continua lá.
- **alt:** Linha funda. Emoção que deixa rastro. Você não esquece. Não é que não queira. Não consegue. Cada pessoa que importou deixou sulco que não fecha.
- **alt2:** Profundidade marcada. Seu coração funciona como argila molhada: tudo que toca fica impresso.

---

# 5. HEAD (Cap 02) — 84 textos

## long_straight

**opening:**

- **content:** Sua Linha da Cabeça é longa e reta. Pensamento direto. Sem desvios.
- **alt:** Reta e longa. Sua mente vai em linha reta até o fim do problema.
- **alt2:** Longa, reta, sem rodeio. Mente que funciona como bisturi.

**body_past:**

- **content:** Você pensa com clareza. Sempre pensou. Enquanto os outros se perdem em possibilidades, você já descartou nove e ficou com a certa. Não é intuição. É lógica. Rápida, limpa, sem enfeite.
- **alt:** Sua cabeça sempre foi seu porto seguro. Quando o emocional bagunçava tudo, a mente reorganizava. Desde cedo você percebeu que pensar direito te protegia mais que sentir demais.
- **alt2:** Raciocínio linear. Ponto A ao ponto B sem escala. As pessoas te acham objetiva demais. Você acha que elas demoram demais.

**body_present:**

- **content:** A mente reta tem um custo: você enxerga a resposta antes dos outros e não entende por que eles não veem. Isso te isola. Não socialmente. Intelectualmente. Você tá sempre dois passos na frente. Cansada de esperar.
- **alt:** Hoje sua clareza mental é sua ferramenta principal. No trabalho, nas relações, nas decisões. Você confia mais na sua cabeça do que em qualquer conselho. E geralmente tá certa. Nas raras vezes que erra, erra {{sozinha}}.
- **alt2:** Sua mente não para. Mas vai em linha reta. Diferente de quem pensa em espiral. Você resolve, descarta, segue. O efeito colateral da eficiência é impaciência. Com os outros. E consigo.

## long_curved

**opening:**

- **content:** Sua Linha da Cabeça curva em direção à Lua. Mente criativa com raiz.
- **alt:** Longa, com curva pro Monte da Lua. Imaginação que se alimenta de tudo.
- **alt2:** Curva suave mergulhando na direção da Lua. Mente que pensa em imagens.

**body_past:**

- **content:** Criativa com estrutura. Você imagina coisas que os outros não imaginam, mas consegue transformar em algo concreto. Não é {{sonhadora}} solta. É {{sonhadora}} que executa. Na escola, provavelmente odiava matemática mas entendia física. Porque física tem narrativa. Números sozinhos não.
- **alt:** Sua mente sempre funcionou por conexão. Uma coisa leva a outra que leva a outra que leva a um insight que ninguém mais teria. Não é genialidade. É a forma como seus pensamentos se organizam. Em rede, não em fila.
- **alt2:** Criatividade nunca te faltou. O que às vezes falta é paciência pra executar o que imaginou. A ideia vem pronta na cabeça. Perfeita. Aí a realidade demora pra alcançar. Isso te frustra.

**body_present:**

- **content:** Sua mente funciona em imagens, conexões, metáforas. Você entende conceitos abstratos antes de entender instruções literais. A linha é longa. Passa do centro da palma e continua mergulhando. Todo mundo olha pro pixel. Você vê o quadro completo. Isso é solidão e superpoder.
- **alt:** Hoje essa mente criativa é sua maior vantagem. O desafio não é ter ideias. É escolher qual executar. Porque vêm muitas. Ao mesmo tempo. Competindo entre si.
- **alt2:** Mente visual. Narrativa. Você não processa informação como dado. Processa como história. Tudo tem começo, meio e fim na sua cabeça. Inclusive pessoas.

## long_deep_curved

**opening:**

- **content:** Longa, funda, e curva. Sua mente é um labirinto que você mesma às vezes se perde dentro.
- **alt:** Profunda e curva. Mente que não desliga. Nem de noite.
- **alt2:** Linha comprida, funda, curvada. Mente que processa camadas que a maioria nem sabe que existem.

**body_past:**

- **content:** Você sempre pensou demais. Desde criança. Perguntas que ninguém fazia, conexões que ninguém via, angústias que ninguém entendia. Sua mente não aceita a superfície das coisas. Precisa ir embaixo. Sempre.
- **alt:** Mente que não para nunca. De dia processa. De noite reprocessa. Você já tentou desligar. Meditação, exercício, rotina. Ajuda um pouco. Resolve de verdade? Não. Porque o problema não é a mente. É o tamanho dela.
- **alt2:** Desde cedo você percebeu que pensava diferente. Mais fundo. Mais lento às vezes, porque ia em camadas que os outros pulavam. Na escola era a que fazia as perguntas que a professora não sabia responder.

**body_present:**

- **content:** Profundidade uniforme, sem ilhas, sem correntes. Sua cabeça não colapsa nos piores momentos. Nos piores momentos, foi a cabeça que te tirou. Vai continuar te tirando.
- **alt:** Hoje essa profundidade é sua ferramenta e seu peso. Te permite ver o que ninguém vê. Te obriga a processar o que ninguém processa. A solidão intelectual é real.
- **alt2:** Não é {{sonhadora}} solta. É {{sonhadora}} que executa. Quase ninguém faz os dois. Você faz. E é exatamente por isso que sua cabeça não para.

## short_straight

**opening:**

- **content:** Curta e reta. Prática. Sem rodeios. Sua mente não perde tempo.
- **alt:** Linha da Cabeça curta e direta. Objetividade que corta atalho.
- **alt2:** Pouca linha, muito pragmatismo. Mente que resolve, não divaga.

**body_past:**

- **content:** Você nunca foi de filosofar. Problema apareceu, resolve. Dúvida surgiu, decide. Enquanto os outros ainda tão listando prós e contras, você já agiu. Nem sempre certo. Mas agiu.
- **alt:** Sua cabeça funciona como interruptor. Liga e desliga. Sim ou não. Sem talvez. Isso te fez rápida a vida inteira. Também te fez impaciente com gente indecisa.
- **alt2:** Pensamento prático desde sempre. Não é que não pense fundo. É que pensa fundo em 30 segundos e segue. O processo é rápido. O resultado é sólido. O meio é invisível.

**body_present:**

- **content:** Mente curta e reta é eficiência. Você processa rápido, decide rápido, e não revisita. O que foi, foi. Energia mental gasta em arrependimento é energia jogada fora. E você não joga nada fora.
- **alt:** Hoje sua objetividade é vantagem. No trabalho, nas relações. Enquanto os outros tão paralisados pela análise, você já resolveu e tá no próximo problema.
- **alt2:** O risco da mente curta é perder nuance. Às vezes a resposta não é sim ou não. É depende. E "depende" te irrita.

## short_curved

**opening:**

- **content:** Curta, com curva. Pensamento rápido e intuitivo.
- **alt:** Pouca extensão, bastante curvatura. Resolve no feeling.
- **alt2:** Linha curta e curva. Raciocínio guiado mais por instinto que por planilha.

**body_past:**

- **content:** Você resolve pela intuição. Não sabe explicar como chegou na resposta. Mas chega. E geralmente tá certa. Na escola, chutava e acertava. Na vida, "sentiu" e deu certo. O problema é quando pedem justificativa.
- **alt:** Seu pensamento é rápido e emocional. Não no sentido de irracional. No sentido de que processa informação pelo corpo, não pela planilha. Sente a resposta antes de calcular.
- **alt2:** Mente que funciona por radar. Entra num lugar e já sabe se vai dar certo. Conhece uma pessoa e já sabe se confia. Tudo em segundos. Sem Excel.

**body_present:**

- **content:** A curva compensa a brevidade com percepção. Onde falta extensão, sobra radar. Você não analisa tudo. Mas o que analisa, analisa com uma lente que mistura razão e gut feeling.
- **alt:** Hoje sua intuição é seu ativo mais valioso. Você sabe. Não sabe explicar. Mas sabe. E já parou de pedir desculpa por isso.
- **alt2:** Mente intuitiva em mundo que valoriza dados. Você já aprendeu a traduzir sua intuição em linguagem que os outros entendem. Mas entre nós: a intuição chegou antes do dado. Sempre.

## medium_straight

**opening:**

- **content:** Linha da Cabeça média e reta. Equilíbrio entre análise e ação.
- **alt:** Nem longa, nem curta. Reta. Pensa o suficiente e age no tempo certo.
- **alt2:** Comprimento moderado, sem curva. Pensamento equilibrado.

**body_past:**

- **content:** Você pensa o necessário. Nem mais, nem menos. Não paralisa na análise. Também não age sem pensar. O meio-termo te serve bem. Sempre serviu.
- **alt:** Sua mente encontrou um ritmo. Pensa, decide, age, avalia. Nessa ordem. Sem pular etapa.
- **alt2:** Equilíbrio mental. Não é que não se preocupe. Se preocupa na medida certa. O suficiente pra resolver. Não o suficiente pra perder o sono. Na maioria das vezes.

**body_present:**

- **content:** Mente média e reta é consistência. Funciona em qualquer cenário. Pressão, calma, caos, rotina. Não oscila.
- **alt:** Hoje sua estabilidade mental te diferencia. Enquanto os outros oscilam, você mantém o prumo. Isso atrai gente que precisa de âncora. Afasta gente que precisa de montanha-russa.
- **alt2:** Consistência é subestimada. Todo mundo quer ser genial. Você quer ser confiável. E confiável ganha de genial no longo prazo.

## medium_curved

**opening:**

- **content:** Média e curva. Mente que equilibra lógica com imaginação.
- **alt:** Comprimento moderado, curva presente. Dança entre o prático e o criativo.
- **alt2:** Sua linha tem medida e curva. Razão e sensibilidade dividindo espaço.

**body_past:**

- **content:** Você transita entre dois mundos: o prático e o imaginativo. Quando precisa resolver, resolve. Quando precisa criar, cria. A maioria mora num ou no outro. Você visita os dois. Com fluência.
- **alt:** Mente híbrida. Metade engenheira, metade artista. Planeja com criatividade. Cria com método. Isso confunde quem tenta te encaixar. Você não cabe.
- **alt2:** Sempre teve facilidade pra coisas diferentes. O lógico e o abstrato. O técnico e o humano. Não é que seja boa em tudo. É que transita entre registros com naturalidade.

**body_present:**

- **content:** Mente híbrida é exatamente o que funciona hoje. Gente que só analisa não inova. Gente que só imagina não entrega. Você faz os dois. O resultado é diferente de tudo que os outros fazem.
- **alt:** Sua mente funciona em modo duplo. E aprendeu a usar cada modo na hora certa. Reunião de trabalho: modo prático. Projeto pessoal: modo criativo. Crise: os dois.
- **alt2:** Curva moderada é flexibilidade mental. Você se adapta ao problema. Muda de abordagem sem perceber. Enquanto os outros insistem no mesmo método, você já tentou três e ficou com o que funcionou.

## faint

**opening:**

- **content:** Linha da Cabeça tênue. Mente que sussurra em vez de gritar.
- **alt:** Linha fraca. Pensamento em volume baixo. Mas funciona.
- **alt2:** Tênue. Quase invisível. Mente discreta, não fraca.

**body_past:**

- **content:** Você não impõe seu pensamento. Nunca impôs. Observa, processa, guarda pra si. Quando fala, fala pouco. Mas cada palavra carrega o peso de tudo que processou em silêncio. As pessoas subestimam. Até você abrir a boca no momento certo.
- **alt:** Mente silenciosa. Não vazia. Silenciosa. Processa em modo stealth. Ninguém sabe o que tá pensando até você decidir contar.
- **alt2:** Sua cabeça funciona em segundo plano. Como software rodando sem interface. Os resultados aparecem. O processo, ninguém vê.

**body_present:**

- **content:** Linha tênue é mente que escolhe suas batalhas. Não gasta energia mental com o que não importa. Reserva pra quando precisa de verdade. Aí surpreende todo mundo.
- **alt:** Hoje sua discrição é estratégica. Você não mostra o jogo. Não por manipulação. Por economia. Pra quê gastar pensamento em voz alta se o silêncio resolve melhor?
- **alt2:** Mente discreta em mundo barulhento. Enquanto os outros disputam quem fala mais alto, você observa. Quando o silêncio pesa e alguém precisa falar algo que faça sentido, olham pra você.

---

## Modificadores da Cabeça (4 × 3 = 12)

### fork_moon

- **content:** Bifurcação no Monte da Lua. Duas mentes: uma prática, outra que sonha. Você vive tentando conciliar as duas. Às vezes a prática ganha. Às vezes o sonho escapa. E quando escapa, cria coisas que ninguém esperava.
- **alt:** Sua linha se divide perto da Lua. Mente dupla. Uma que paga as contas e outra que imagina mundos. As duas são você.
- **alt2:** Bifurcação lunar. Uma metade resolve, a outra inventa. O conflito é constante. Mas é exatamente desse conflito que saem suas melhores ideias.

### touches_life

- **content:** A Cabeça toca a Vida. Mente e corpo conectados na raiz. Suas decisões mentais afetam seu corpo. Estresse vira dor. Ansiedade vira insônia. Tudo tá ligado.
- **alt:** Linha da Cabeça encostando na Linha da Vida. Quando sua cabeça tá mal, seu corpo avisa. Quando seu corpo tá mal, sua mente desacelera. Um sistema só.
- **alt2:** As duas linhas se tocam. Raro. Mente e vitalidade funcionam como circuito fechado. Quando os dois tão bem, você é imbatível. Quando um vai mal, o outro sente na hora.

### island

- **content:** Ilha na Linha da Cabeça. Período de confusão mental. Decisões erradas por exaustão ou pressão. Já passou. Mas deixou um aprendizado: nunca mais decide cansada.
- **alt:** Ilha. Nevoeiro. Sua mente perdeu a clareza por um tempo. Estresse, burnout, sobrecarga. Não importa a causa. Você saiu e sua mente voltou mais afiada.
- **alt2:** Uma ilha na linha do pensamento. Período onde nada fazia sentido. Onde você duvidou da própria capacidade. Passou. A cicatriz mental é real. E te ensinou a respeitar seus limites.

### break

- **content:** Interrupção na Linha da Cabeça. Algo mudou sua forma de pensar. Radicalmente. A pessoa que você era antes dessa pausa não pensava como você pensa agora.
- **alt:** Uma pausa na linha. Ruptura cognitiva. Evento, descoberta, ou perda. Algo que fez sua mente reiniciar. O novo sistema operacional é melhor. Mas o reboot foi violento.
- **alt2:** Sua linha da mente tem um corte. Depois do corte, a linha continua diferente. Mais firme ou mais suave, depende. Mas diferente. Você pensa de um jeito que não pensava antes de... você sabe antes do quê.

---

# 6. LIFE (Cap 03) — 72 textos

### long_deep

**opening:**

- **content:** Profunda e longa. Resiliência que assusta quem te subestima.
- **alt:** Linha da Vida longa e marcada. Vitalidade que não negocia.
- **alt2:** Funda, longa, sem interrupção. Força vital de quem já atravessou muito.

**body_past:**

- **content:** Você se recupera de coisas que derrubariam outras pessoas por meses. Não porque não sinta. Porque seu corpo e sua mente têm um mecanismo de reconstrução que funciona quase sozinho. Você levanta. Sempre. Às vezes no dia seguinte. Às vezes na mesma hora.
- **alt:** Vitalidade forte desde criança. Adoecia e no dia seguinte tava correndo. Levava tombo e levantava antes de chorar. Esse padrão nunca mudou.
- **alt2:** Coisas que derrubariam outros te deixam de pé. Machucada, cansada, mas de pé. Sempre de pé. Porque ficar no chão nunca foi opção.

**body_present:**

- **content:** "Como {{ela}} tá bem?" As pessoas se impressionam. Não tá. Mas funciona mesmo não tando. A linha faz um arco largo. Generosa. Você tem muito pra dar. Tempo, presença, energia. Dá sem calcular. Ninguém te agradeceu pela maioria das vezes que recomeçou.
- **alt:** Ninguém imagina o peso do que você carrega. Porque você não mostra. Não por orgulho. Porque mostrar significaria parar. E parar não é opção quando tem gente dependendo de você.
- **alt2:** Sua vitalidade é sua armadura e seu motor. Te protege e te move. O custo é que você nunca descansa de verdade. Mesmo quando para, tá processando. Mesmo quando dorme, tá se reconstruindo.

### long_faint

**opening:**

- **content:** Longa, mas tênue. Vida longa com energia que precisa ser administrada.
- **alt:** Extensão grande, profundidade fraca. Maratona, não sprint.
- **alt2:** Linha longa e suave. Duração sem explosão.

**body_past:**

- **content:** Você não tem energia pra desperdiçar. Nunca teve. Aprendeu cedo a escolher onde investir. Enquanto os outros gastam em tudo, você economiza pro que importa. Não é preguiça. É gestão.
- **alt:** Sua energia é finita e você sabe. Isso te fez sábia. Enquanto os outros se esgotam em besteira, você guarda pro essencial. Parece que faz pouco. Faz exatamente o necessário.
- **alt2:** Vitalidade moderada. Você funciona bem quando respeita seu ritmo. Quando força, paga. E já pagou vezes suficientes pra aprender.

**body_present:**

- **content:** Linha longa garante longevidade. A leveza pede cuidado. Seu corpo funciona como conta corrente: gasta mais do que entra, fica no vermelho. No vermelho, tudo piora. Sono, humor, saúde, decisões.
- **alt:** Hoje você sabe: quando descansa, rende mais. Quando força, quebra. O difícil é convencer o mundo que descanso não é falta de ambição.
- **alt2:** Seu corpo te avisa antes de quebrar. O problema é que você já ignorou o aviso vezes demais. Tá aprendendo a ouvir. Devagar. Mas tá.

### short_deep

**opening:**

- **content:** Curta, mas funda. Vida que se concentra em poucos anos decisivos.
- **alt:** Linha curta com profundidade marcada. Qualidade, não quantidade.
- **alt2:** Pouca extensão, muita marca.

**body_past:**

- **content:** Sua energia vem em rajadas. Intensa, arrebatadora, e depois precisa recarregar. Você não funciona em modo constante. Funciona em modo explosão. As melhores coisas da sua vida aconteceram em períodos curtos e intensos.
- **alt:** Ciclos. Sua vida funciona em ciclos claros. Meses de energia intensa seguidos de semanas de recolhimento. Você já tentou viver em linha reta. Não funciona.
- **alt2:** Cada fase sua tem peso. Cada ano conta. Você não desperdiça tempo. Porque sente, de alguma forma, que o tempo é precioso demais.

**body_present:**

- **content:** A profundidade compensa a extensão. O que você vive, vive fundo. Cada experiência te marca. Nada é raso pra você.
- **alt:** Hoje sua densidade é sua identidade. Gente que te conhece sabe que estar perto é uma experiência.
- **alt2:** Você comprime mais vida em menos tempo do que a maioria. Não é pressa. É densidade.

### short_faint

**opening:**

- **content:** Curta e tênue. Energia que pede cuidado.
- **alt:** Linha da Vida discreta. Presença suave.
- **alt2:** Curta e fina. Sinal de que seu corpo pede mais atenção do que você dá.

**body_past:**

- **content:** Você sempre funcionou no limite. Não por escolha. Sua energia nunca foi abundante. Aprendeu a fazer muito com pouco. Virou skill. Só que skill tem custo. Quando ultrapassa o limite, cai mais rápido.
- **alt:** Saúde exigiu atenção desde cedo. Talvez não doença grave. Talvez cansaço crônico, imunidade baixa, corpo que responde devagar. Compensou com disciplina. Ou teimosia.
- **alt2:** Energia limitada. Corpo que pede mais do que você oferece. A relação entre vocês sempre foi de negociação. Ele pede descanso. Você empurra mais um pouco. Ele cobra depois.

**body_present:**

- **content:** Linha curta e fraca não é destino. É estado atual. Linhas mudam. A sua pode se aprofundar se você cuidar do que precisa ser cuidado. Sono, alimentação, movimento, descanso real.
- **alt:** Hoje você sabe que não pode funcionar no modo dos outros. Seu modo é mais lento, mais cuidadoso. E tá tudo bem.
- **alt2:** Cuidar de si não é egoísmo. Suas mãos mostram que você precisa disso mais do que a média.

### curved_wide

**opening:**

- **content:** Arco largo. Generosa. Sua Linha da Vida abraça a palma.
- **alt:** Curva ampla sobre o Monte de Vênus. Vida que se entrega ao redor.
- **alt2:** Arco generoso. Você ocupa muito espaço na vida dos outros.

**body_past:**

- **content:** Você é generosa. Não de dinheiro. De presença. De tempo. De energia. Quando alguém precisa, você aparece. Sem pedir nada. Já recomeçou mais vezes do que a maioria teria coragem. Ninguém te agradeceu por nenhuma delas.
- **alt:** Arco largo é coração grande e braço comprido. Abraça antes de perguntar se pode. Ajuda antes de pedir retorno. Percebe que deu demais só depois.
- **alt2:** Generosidade é seu padrão. Não é virtude que pratica. É como funciona. Dar é natural. Receber é que é difícil. Porque receber te deixa vulnerável.

**body_present:**

- **content:** Arco largo mostra vitalidade que se expande pros outros. Muito pra dar. Dá sem calcular. O risco é se esvaziar. O desafio é aprender que guardar pra si não é egoísmo. É manutenção.
- **alt:** Sua vida transborda pros outros. Mãe, amiga, porto seguro, a que resolve. Todos esses papéis. O que falta: alguém que cuida de você.
- **alt2:** Generosidade sem limite é cilada. Suas mãos mostram que você dá até o limite. E depois do limite também. Aprender a parar antes de se esvaziar é o próximo passo.

### curved_tight

**opening:**

- **content:** Arco apertado. Vida contida. Reservada.
- **alt:** Curva fechada. Espaço vital pequeno e protegido.
- **alt2:** Arco curto e fechado. Você não se espalha. Se concentra.

**body_past:**

- **content:** Vida reservada. Poucos amigos. Poucos lugares. Poucos confortos, mas os mesmos. Você não precisa de muito. Nunca precisou. Enquanto os outros buscam novidade, você aprofunda o que já tem. Lealdade é seu idioma. Rotina é seu abrigo.
- **alt:** Caseira. No sentido profundo. Não é que não goste de sair. Voltar pra casa é sempre melhor do que ir pra qualquer lugar.
- **alt2:** Introversão não é timidez. É escolha. Menos gente, mais profundidade. Menos lugares, mais pertencimento.

**body_present:**

- **content:** Arco apertado mostra energia vital que fica perto. Não se dissipa. Se concentra num círculo pequeno. Dentro desse círculo, a intensidade é máxima.
- **alt:** Hoje sua vida reservada é seu maior luxo. Enquanto os outros se espalham tentando estar em todo lugar, você tá exatamente onde quer. Com quem quer.
- **alt2:** Arco fechado é vida escolhida. Cada pessoa, cada compromisso, cada hábito passou pelo seu filtro. O que tá dentro tá ali porque merece.

### broken_restart

**opening:**

- **content:** Tem uma pausa na Linha da Vida. Depois ela recomeça. Mais funda que antes.
- **alt:** Linha interrompida. Mas olha o que vem depois: mais forte.
- **alt2:** Quebra e recomeço. Duas fases. A segunda é mais marcada.

**body_past:**

- **content:** Algo te derrubou. Fisicamente ou emocionalmente. Faz uns anos. Você sabe do que eu tô falando. A linha não parou. Continuou. Mais funda depois disso, inclusive. O que não te matou te deu uma vitalidade que não existia antes.
- **alt:** Recomeço. Não é metáfora. É literal na sua mão. Uma fase acabou. Outra começou. A segunda versão de você é mais forte. Custou caro. Mas custou.
- **alt2:** Essa marca aqui? Faz uns anos. Você sabe. A linha parou e voltou com mais força. A vida te testou e você passou. Não sem dor. Com dor. Mas passou.

**body_present:**

- **content:** A linha recomeça mais funda. Reconstrução real. Não superação de livro de autoajuda. Reconstrução. Do tipo que muda osso, postura, voz. Você não é a mesma pessoa de antes da pausa. E não quer ser.
- **alt:** Hoje a segunda fase é mais forte que a primeira. Você sabe. Sente no corpo. Na segurança das decisões. Na clareza do que aceita e do que não aceita mais.
- **alt2:** Cada recomeço te deu uma camada a mais. Não de armadura. De pele. Mais grossa, mais {{preparada}}.

### chained

**opening:**

- **content:** Correntes. Ondulações miúdas na Linha da Vida. Corpo pedindo atenção.
- **alt:** Linha encadeada. Parece corrente. Saúde que oscila.
- **alt2:** Ondulações contínuas. Vitalidade que vai e volta. Como maré.

**body_past:**

- **content:** Saúde instável em algum período. Corpo pedindo atenção que talvez não tenha recebido. Não necessariamente doença grave. Às vezes cansaço crônico, imunidade frágil, corpo que responde mais devagar do que a mente exige.
- **alt:** Correntes são períodos de energia oscilante. Semanas boas seguidas de dias onde o corpo não coopera. Você conhece esse ritmo.
- **alt2:** Seu corpo tem padrão de onda. Picos e vales. Você já tentou ignorar os vales. O resultado foi pior. Tá aprendendo a surfar em vez de lutar contra a maré.

**body_present:**

- **content:** Correntes não são sentença. São sinal. Seu corpo fala uma linguagem que você provavelmente ignora por costume. Dor que vira costumeira. Cansaço que vira normal. Nada disso é normal.
- **alt:** Hoje as correntes te pedem uma coisa: escuta. O corpo sabe antes da mente. Sempre soube.
- **alt2:** Você forçou mais do que devia. Por mais tempo do que devia. Seu corpo tá te cobrando a conta. Não com punição. Com informação.

---

# 7. VENUS (Cap 04) — 18 textos

### venus_opening

- **content:** Essa parte eu falo baixo. Porque o que sua mão mostra aqui, quase ninguém sabe. Você não é de muitos. Mas quando é de alguém, essa pessoa não vai esquecer. Nem que tente.
- **alt:** Agora a gente muda de volume. Porque o que vem agora é entre nós. Quando a porta fecha, você é outra pessoa. Não pior. Não melhor. Mais real.
- **alt2:** Intimidade. A palavra já pesa. Pra você pesa mais. Porque você não entrega seu corpo como entrega um abraço. Tem camadas antes. Filtros. Testes silenciosos. Quem passou, sabe.

### venus_body_pronounced

- **content:** Seu Monte de Vênus é pronunciado e firme. Presença física forte. Corpo que precisa de presença real pra se entregar. Quando se abre, quem já esteve ali sabe. Seu gatilho não é físico. É mental. Precisa ser {{vista}} pela inteligência antes de ser tocada. Aí, e só aí, o corpo responde.
- **alt:** Vênus pronunciado. Sensualidade que não precisa performar. Não é sobre aparecer. É sobre a energia que você emana quando se sente {{segura}}. E quando se sente {{segura}}, o que sai é avassalador.
- **alt2:** Monte firme e elevado. Corpo que sabe o que quer. Não aceita menos. Não finge pra agradar. Percebe atenção dividida, carinho performático, pressa disfarçada de desejo. Quando percebe, desliga. Sem aviso.

### venus_body_flat

- **content:** Monte de Vênus discreto. Intimidade pra você é mais mental que física. Não que o corpo não importe. Importa. Mas vem depois. Muito depois. Primeiro a conversa. A confiança. O olhar que diz "eu entendo quem você é". Sem isso, seu corpo não responde. E você não força.
- **alt:** Monte plano. Discreta. Sua intimidade é espaço silencioso. Sem espetáculo. Sem urgência. Quem não sabe ler silêncio não entra.
- **alt2:** Vênus discreto é seletividade elevada. Seu corpo precisa de condições específicas. Segurança emocional. Respeito intelectual. Tempo. Sem pressa. Sem pressão.

### cinturao_present

- **content:** Cinturão de Vênus na sua mão. Semicírculo sutil acima do Coração. Hipersensibilidade emocional e sensorial. Você sente suas emoções com força. E as dos outros também. Não funciona com alguém distraído.
- **alt:** Cinturão de Vênus. Raro. Sensibilidade na pele, nos olhos, nas mãos. Tudo te afeta mais. Toque bom é melhor. Toque errado é insuportável. Percebe nuances que os outros nem registram.
- **alt2:** O Cinturão. Sente em outro nível. Não é exagero. Suas terminações são mais atentas. Seu radar emocional é mais fino. Por isso precisa de presença real. Meia-boca é pior que ausência.

### venus_closing

- **content:** Você não quer ser querida. Quer ser lida. Quase ninguém sabe a diferença. Quem sabe, fica. Quem não sabe, se perde. E você deixa se perder sem culpa.
- **alt:** No fim, sua intimidade se resume a presença. Não de corpo. De atenção. Quando alguém te dá atenção real, inteira, sem celular, sem pressa, você se abre como não se abre pra mais ninguém. É raro. Mas quando acontece, é tudo.
- **alt2:** Nem sempre foi assim. Teve época em que se entregava mais fácil. Suas mãos mostram que isso mudou. Você aprendeu. Da pior forma, mas aprendeu.

---

# 8. MOUNTS (Cap 05) — 36 textos

### jupiter

**intro:**

- **content:** Monte de Júpiter pronunciado. Na base do indicador. Ambição e liderança.
- **alt:** Júpiter forte. Você quer mais. E mais. Motor que não desliga.
- **alt2:** Monte de Júpiter elevado. Ambição. Autoridade. Fome.

**body:**

- **content:** Você quer mais. Sempre quis. As pessoas te seguem sem você pedir. Olham pra você quando a situação complica. Porque você tem a postura de quem vai encontrar saída. Quando entra numa sala, as pessoas sentem. Mesmo em silêncio.
- **alt:** Liderança natural. Não do tipo que grita. Do tipo que organiza sem falar. Assume sem perceber. E quando percebe, já tá todo mundo olhando esperando direção.
- **alt2:** Ambição é seu combustível. Não por dinheiro. Por expansão. Aprender mais, crescer mais, ser mais. Quando atinge um objetivo, já tá mirando o próximo. Isso te move. Também te impede de comemorar.

### saturn

**intro:**

- **content:** Saturno forte. Disciplina silenciosa.
- **alt:** Monte de Saturno pronunciado. Estrutura. Resistência.
- **alt2:** Saturno elevado. O monte menos glamoroso. O mais sólido.

**body:**

- **content:** Você aguenta o que ninguém aguenta. Não por teimosia. Por propósito. Quando decide que algo importa, segue até o fim. Sem reclamar. Sem postar. Sem esperar reconhecimento.
- **alt:** Disciplina é sua linguagem. Não a que aparece. A que funciona. Rotina, consistência, repetição. Enquanto os outros procuram atalho, você tá no caminho longo que funciona.
- **alt2:** Saturno é o monte do tempo. Você entende tempo melhor que a maioria. Sabe que resultados vêm devagar. Sabe esperar. Sua paciência não é passividade. É estratégia.

### apollo

**intro:**

- **content:** Apolo presente. Criatividade e reconhecimento.
- **alt:** Monte de Apolo elevado. Brilho pessoal. Expressão.
- **alt2:** Apolo pronunciado. Onde mora a criatividade que se mostra pro mundo.

**body:**

- **content:** Tem algo que você cria que as pessoas param pra olhar. Nem sempre arte. Às vezes é o jeito que arruma um espaço, que monta uma apresentação, que conta uma história. Existe uma estética na forma como você faz as coisas.
- **alt:** Criatividade que transborda. Não no sentido artístico necessariamente. Tudo que toca ganha uma camada que não existia antes. Seu olhar transforma o ordinário.
- **alt2:** Apolo é o monte do brilho. Não do ego. Do brilho autêntico. Aquele que aparece quando você tá fazendo o que ama.

### mercury

**intro:**

- **content:** Mercúrio dominante. Comunicação e inteligência verbal.
- **alt:** Monte de Mercúrio pronunciado. Palavras afiadas.
- **alt2:** Mercúrio elevado. A língua é sua ferramenta.

**body:**

- **content:** Você convence sem levantar a voz. Sabe escolher as palavras exatas pra cada situação. Quando quer convencer, convence. Quando quer machucar, machuca. Sabe a diferença. Lê as pessoas como eu leio mãos. Sem elas perceberem.
- **alt:** Comunicação é seu superpoder. Não fala muito. Mas quando fala, cada palavra carrega peso. Sabe dosar. Sabe quando falar e quando calar. Os dois têm efeito.
- **alt2:** Mercúrio forte é mente rápida e língua precisa. Processa informação verbal em velocidade acima da média. Lê entrelinhas, percebe tom, detecta mentira. Radar social que nunca desliga.

### mars

**intro:**

- **content:** Marte ativo. Coragem que não pede licença.
- **alt:** Monte de Marte pronunciado. Combatividade. Força interna.
- **alt2:** Marte elevado. Coragem de enfrentar o que os outros contornam.

**body:**

- **content:** Você enfrenta. Enquanto os outros recuam, você avança. Não é imprudência. É convicção. Quando acredita em algo, vai até o fim. Mesmo que {{sozinha}}. Confia no seu julgamento mais do que no consenso.
- **alt:** Coragem pra você é default. Não precisa pensar pra ser corajosa. Precisa pensar pra ser cautelosa. O oposto da maioria. Isso te colocou em situações incríveis. E em algumas que preferia esquecer.
- **alt2:** Marte forte é fogo no sangue. Você não fica parada esperando acontecer. Vai e faz acontecer. Mesmo quando o plano não tá pronto. O medo tá ali. Você vai mesmo assim.

### moon

**intro:**

- **content:** Lua forte. Imaginação e intuição.
- **alt:** Monte da Lua pronunciado. Mundo interior rico.
- **alt2:** Lua elevada. Inconsciente. Sonhos. Coisas que você sabe sem saber como sabe.

**body:**

- **content:** Você sonha acordada. E os sonhos fazem sentido depois. Sua imaginação não é fuga. É processamento. Enquanto devaneia, sua mente tá resolvendo problemas em segundo plano.
- **alt:** Intuição forte. Não a mística. A prática. A que te faz saber que algo vai dar errado antes de dar. A que te faz confiar numa pessoa sem motivo lógico. E acertar.
- **alt2:** Lua forte é mundo interior gigante. Pensamentos, cenários, conversas imaginárias, planos que nunca saem da cabeça. Não é loucura. É processamento criativo.

---

# 9. FATE (Cap 06) — 54 textos

### present_deep

**opening:**

- **content:** Linha do Destino forte e clara. Direção que não vacila.
- **alt:** Destino marcado. Fundo. Reto. Propósito que pulsa.
- **alt2:** Linha firme subindo pela palma. Destino que não pede opinião.

**body_past:**

- **content:** Você sabe pra onde vai. Talvez não saiba como. Talvez não saiba quando. Mas a direção tá definida. Propósito claro. Não plano. Propósito. Planos mudam. Propósito permanece.
- **alt:** Desde cedo tinha um norte. Mesmo quando tudo era confuso, algo dentro de você apontava pra frente. Seguiu. Nem sempre pelo caminho mais fácil.
- **alt2:** Destino forte não significa vida fácil. Significa vida com sentido. Mesmo nos piores momentos, você sentiu que tava indo pra algum lugar.

**body_present:**

- **content:** Você não seguiu o caminho que esperavam. Por isso tá indo pra lugares que eles nem sabem que existem.
- **alt:** Hoje sua direção tá mais clara que nunca. Não porque as dúvidas sumiram. Porque aprendeu a andar com elas.
- **alt2:** A linha termina forte em Saturno. Sem hesitação. Destino que chega tarde mas chega certo.

### present_faint

**opening:**

- **content:** Linha do Destino fraca. Presente, mas suave.
- **alt:** Destino fraco não é ausência. É caminho que se desenha devagar.
- **alt2:** Linha tênue. Direção incerta. Mas lá.

**body_past:**

- **content:** Sua direção nunca foi óbvia. Enquanto os outros tinham certeza do que queriam ser, você ainda tava descobrindo. Não por indecisão. Por complexidade. Você não cabe numa direção só.
- **alt:** Caminho confuso por fora. Coerente por dentro. Escolhas que pareciam aleatórias. Olhando pra trás, cada uma te trouxe até aqui.
- **alt2:** Destino suave é destino em construção. Veio em fragmentos que você tá juntando aos poucos.

**body_present:**

- **content:** Você sente que tá chegando perto de algo. Não sabe do quê exatamente. Mas sente. Linha fraca não significa falta de destino. Significa que o destino ainda tá se revelando.
- **alt:** A direção vai ficando mais clara com cada decisão. Por camadas. Cada camada te aproxima de algo que não consegue nomear ainda.
- **alt2:** Destino fraco é liberdade disfarçada. Sem linha forte te puxando, você pode ir pra qualquer lugar. O difícil é escolher. O possível é infinito.

### broken

**opening:**

- **content:** Quebrada. Uma linha que parou e recomeçou. Mudança de rumo.
- **alt:** Destino interrompido. Reconstruído. Duas fases. Duas direções.
- **alt2:** Sua linha do destino tem um corte. Antes e depois.

**body_past:**

- **content:** Mudança de rumo. Não desvio. Recomeço. Algo que mudou a direção da sua vida completamente. Escolha ou circunstância. Não importa. Você tá num caminho que não existia antes desse corte.
- **alt:** A primeira fase acabou. Carreira, relação, cidade, identidade. Algo que te definia simplesmente parou. No lugar surgiu outra coisa.
- **alt2:** Você mudou de direção. Radicalmente. A maioria fica no caminho errado por inércia. Você cortou e recomeçou. A segunda linha é mais forte que a primeira.

**body_present:**

- **content:** A segunda metade é mais forte. Eu vejo claro. A linha volta com mais profundidade. O novo caminho tem mais propósito que o antigo.
- **alt:** Hoje você tá no segundo ato. O primeiro foi ensaio. O segundo é pra valer.
- **alt2:** Recomeço é o seu tema. E cada recomeço foi mais {{certa}} do que o anterior.

### multiple

**opening:**

- **content:** Múltiplas linhas de destino. Caminhos paralelos.
- **alt:** Duas, talvez três linhas de destino. Vidas paralelas na mesma palma.
- **alt2:** Linhas múltiplas subindo. Não é confusão. É abundância.

**body_past:**

- **content:** Você sempre fez mais de uma coisa. Não por falta de foco. Por excesso de capacidade. Enquanto os outros escolhem entre A e B, você faz A, B, e começa C.
- **alt:** Caminhos paralelos. Carreira e projeto pessoal. Trabalho e arte. Família e ambição. Você não aceita que precisa escolher um.
- **alt2:** Múltiplos destinos na mesma mão. Raro. Você não nasceu pra uma coisa só. Nasceu pra várias. O mundo tenta te encaixar numa. Não cabe.

**body_present:**

- **content:** Os caminhos paralelos são sua identidade. Quando te perguntam "o que você faz?", nenhuma resposta é completa.
- **alt:** A multiplicidade é sua força e sua exaustão. Fazer tudo é possível. Descansar de tudo é o difícil.
- **alt2:** Os caminhos vão convergir em algum momento. Não agora. Mas quando convergirem, o resultado vai ser algo que só alguém com seus caminhos poderia criar.

### late_start

**opening:**

- **content:** Começa no meio da palma. Destino tardio.
- **alt:** Sua linha não começa no pulso. Começa mais acima.
- **alt2:** Início tardio. Não é atraso. É preparação que levou mais tempo.

**body_past:**

- **content:** Cada coisa errada te levou pra direção certa. Cada emprego que não deu certo. Cada relação que terminou. Cada mudança que pareceu retrocesso. Era preparação.
- **alt:** Enquanto os outros já tinham encontrado "sua coisa" aos 25, você ainda tava procurando. Não por preguiça. Por precisão. Precisava de mais dados. Mais experiências. Mais erros.
- **alt2:** Destino tardio é destino refinado. Chegou com mais clareza. Menos ilusão.

**body_present:**

- **content:** Linha que começa tarde sobe firme. Sem dúvida. Direção que vem com maturidade. Certeza precoce se dissolve. Direção madura se solidifica.
- **alt:** Hoje você sabe que o "atraso" era necessário. Nada do que veio antes foi perdido. Tudo alimentou o que tá vindo agora.
- **alt2:** Tarde mas certo. Resumo da sua Linha do Destino. E da sua vida.

### absent

**opening:**

- **content:** Sem Linha do Destino visível. Antes que se preocupe: não é mau sinal.
- **alt:** Destino ausente. Não tem linha. Mais interessante do que parece.
- **alt2:** Sua palma não tem Linha do Destino. Calma. Ouve o que isso significa.

**body_past:**

- **content:** Isso não é falta de direção. É liberdade. Você não veio com roteiro. Veio com improviso. Cada escolha é sua. Cada caminho é inventado. Ninguém te empurra numa direção porque não tem direção pré-escrita. O que existe é vontade. E vontade forte cria o próprio destino.
- **alt:** Sem destino fixo. Sem limite fixo. Pode ser qualquer coisa. Ir pra qualquer lugar. O paradoxo é que liberdade total assusta. Você conhece esse medo.
- **alt2:** Ausência de destino na mão não é ausência de destino na vida. É destino em construção. Escrito por você. Em tempo real.

**body_present:**

- **content:** Você não segue caminho. Abre caminho. E quem abre caminho não tem mapa. Tem coragem.
- **alt:** Hoje a ausência te dá uma vantagem: flexibilidade total. Muda quando quer. Pra onde quer. Sem sentir que tá traindo algum plano.
- **alt2:** Destino ausente é tela em branco. Assustador pra quem precisa de roteiro. Libertador pra quem sabe pintar.

---

# 10. CROSSINGS (Cap 07) — 24 textos

### heart_straight_x_head_long

- **content:** Coração reto cruzando com cabeça longa. Sua cabeça decide rápido. Seu coração acompanha pela mesma lógica, só que com peso emocional em cima. Te faz eficiente em cortar vínculos. E {{devastada}} na madrugada seguinte.
- **alt:** Mente longa e coração reto. Dois sistemas eficientes operando juntos. Resolve rápido no amor e na razão. O custo é que a velocidade não deixa tempo pra processar. O que não processa de dia, processa de noite.
- **alt2:** Esse cruzamento é dos mais difíceis de carregar. A cabeça puxa pra frente. O coração acompanha sem reclamar. Até que reclama. Às 3h da manhã.

### heart_curved_x_head_short

- **content:** Coração curvo com cabeça curta. Sente muito e pensa rápido. Instinto emocional. Reage antes de analisar. Geralmente a reação tá certa. Quando não tá, o estrago é proporcional à velocidade.
- **alt:** Coração generoso, mente objetiva. Dá com o coração e corta com a cabeça. Às vezes na mesma hora. As pessoas não entendem como pode ser tão calorosa e tão decisiva.
- **alt2:** Esse cruzamento cria alguém que sente demais e age rápido demais. Às vezes na ordem certa. Às vezes não.

### life_wide_x_venus_pronounced

- **content:** Vida com arco largo e Vênus pronunciado. Generosidade em dobro. Entrega energia e presença física sem calcular. Ninguém devolve na mesma proporção. Poucas pessoas sabem receber a quantidade que você oferece.
- **alt:** Arco generoso encontra monte de presença. Dá demais. De tudo. Tempo, corpo, atenção. O problema não é dar. É não sobrar nada pra si.
- **alt2:** Duas marcas de generosidade na mesma mão. Raro e perigoso. Raro porque poucas pessoas têm. Perigoso porque quem dá tanto atrai quem só sabe receber.

### fate_deep_x_jupiter

- **content:** Destino forte com Júpiter pronunciado. Ambição com direção. Não só quer mais. Sabe exatamente onde quer chegar. Vai chegar. A questão não é se. É quando.
- **alt:** Propósito e liderança na mesma mão. Nasceu pra construir algo grande. Tá no caminho. Mesmo que pareça longe.
- **alt2:** Júpiter e Destino juntos. Combustível e GPS. Motor forte e direção clara. Combinação que cria gente que faz história.

### head_moon_x_moon_pronounced

- **content:** Cabeça mergulhando na Lua e Monte da Lua pronunciado. Imaginação potencializada. Sua mente vive em dois mundos. O real e o possível. Às vezes o possível parece mais real.
- **alt:** Dupla dose de Lua. Criatividade que não para. Sonhos que viram planos que viram realidade. Quando funciona, é genialidade. Quando não, é exaustão.
- **alt2:** Lua em dobro. Sua mente é portal. Entra e sai de mundos internos com facilidade que assustaria a maioria. Pra você é terça-feira.

### heart_deep_x_venus_cinturao

- **content:** Coração profundo com Cinturão de Vênus. Sentir é sua segunda pele. Não só ama com força. Sente o amor dos outros como se fosse seu. O prazer. A dor. Tudo. Isso te faz amante incomparável e esponja emocional.
- **alt:** Profundidade emocional encontra hipersensibilidade. Sente tudo em alta definição e surround. Bonito quando é bom. Insuportável quando é ruim.
- **alt2:** Esse cruzamento cria alguém que não consegue separar amor de fusão. Quando ama, absorve. O desafio é amar sem desaparecer dentro do outro.

### life_broken_x_fate_late

- **content:** Vida quebrada e Destino tardio. Duas linhas que concordam: a primeira metade foi ensaio. A segunda é pra valer. Tudo que quebrou antes tava preparando o terreno.
- **alt:** Recomeço na Vida e início tardio no Destino. Mesma mensagem: o melhor tá vindo. Tarde. Mas certo.
- **alt2:** Quebra e recomeço. Atraso e clareza. Sua mão conta história de segunda chance. E a segunda chance é melhor que a primeira.

### head_touches_life_x_earth

- **content:** Cabeça tocando a Vida em mão de Terra. Corpo, mente e elemento combinam: {{uma}} pessoa integrada. O que pensa, faz. O que faz, sente. O que sente, pensa. Circuito fechado. Eficiente. Confiável.
- **alt:** Terra com mente e vida conectadas. Grounding total. Vive no corpo. Pensa com o corpo. Decide com o corpo. Intelectualização é perda de tempo. A resposta tá na prática.
- **alt2:** Elemento Terra. Cabeça e Vida unidas. Alguém que não separa vida pessoal de profissional, corpo de mente, teoria de prática. Tudo é uma coisa só. Sólida.

---

# 11. COMPATIBILITY (Cap 08) — 30 textos

### fire_fire

- **content:** Incêndio. Lindo enquanto dura. E não dura. Dois motores no mesmo carro, puxando pro mesmo lado até um dos dois queimar.
- **alt:** Fogo com Fogo. Paixão imediata. Destruição garantida. Bonito de longe. Insuportável de perto. Ninguém cede. Então explode.
- **alt2:** Dois Fogos. Energia que enche o espaço inteiro. Enquanto tão juntos, o mundo para. Quando acaba, o mundo demora pra voltar ao normal.

### fire_water

- **content:** Vapor. Paixão que consome. Bonito enquanto evapora. Intenso, dramático, curto. Daqueles que a gente lembra pra sempre mas não repete.
- **alt:** Fogo e Água. Um apaga o outro ou cria nuvem. A tensão é magnética. A incompatibilidade também. Funciona no quarto. Na cozinha, menos.
- **alt2:** Fogo com Água. Ele ferve, ela congela. Ou o contrário. Depende do dia. A paixão é real. A convivência é improvável. Ninguém esquece.

### fire_earth

- **content:** Fundação. Impossível de largar. Construção silenciosa que cresce enquanto ninguém percebe. Pouco fogo visível, muito calor embaixo.
- **alt:** Fogo e Terra. Um aquece, o outro sustenta. Não é combinação óbvia. Mas é das mais duradouras. Se o Fogo aceitar ir devagar. Se a Terra aceitar se aquecer.
- **alt2:** Fogo com Terra. Demora pra pegar. Mas quando pega, não apaga. Construção lenta, sólida, e quente por dentro.

### fire_air

- **content:** Faísca. Conversa que vira desejo. Você se apaixona pela mente antes do corpo. E quando o corpo chega, já tá tarde demais pra fingir indiferença.
- **alt:** Fogo e Ar. O Ar alimenta o Fogo. Literalmente. Conversa vira debate, debate vira tensão, tensão vira outra coisa. Estimulante. Viciante.
- **alt2:** Fogo com Ar. Intelectual e passional. Quer discutir filosofia e depois ficar em silêncio juntos. Poucos entendem. Os que entendem ficam.

### water_water

- **content:** Mar profundo. Entendem sem falar. Também se afogam sem perceber.
- **alt:** Água com Água. Profundidade que se multiplica. Entendem as pausas, os olhares, os silêncios. O risco é se perder dentro do outro e esquecer onde termina um e começa o outro.
- **alt2:** Dois Águas. Fusão emocional. Telepatia afetiva. Sabem o que o outro sente antes de falar. Bonito e sufocante. Porque quando os dois afundam, ninguém puxa ninguém pra cima.

### water_earth

- **content:** Rio e margem. Um dá forma, o outro dá direção. Juntos, paisagem.
- **alt:** Água e Terra. Complemento quase perfeito. Terra segura, Água nutre. O problema é quando a Água quer fluir e a Terra quer ficar. Mas quando negociam, criam algo que dura.
- **alt2:** Água com Terra. Estabilidade emocional. Terra dá estrutura, Água dá profundidade. Juntos, constroem algo que nenhum dos dois construiria {{sozinha}}.

### water_air

- **content:** Nuvem. Bonito de longe. Instável de perto. Conversam em frequências diferentes. Mas quando sintonizam, é mágico.
- **alt:** Água e Ar. Um sente, o outro pensa. Água quer profundidade, Ar quer leveza. Encontrar o meio é o desafio.
- **alt2:** Água com Ar. Ela quer mergulhar, ele quer voar. Ou o contrário. Ninguém entende o ritmo do outro. Mas a curiosidade mantém.

### earth_earth

- **content:** Raiz dupla. Inabalável. Também inflexível. Quando discordam, ninguém cede.
- **alt:** Terra com Terra. Fortaleza. Nada derruba. Também nada muda. Segurança máxima. Espontaneidade mínima. Se os dois aceitarem que rotina é amor, funciona pra sempre.
- **alt2:** Dois Terras. Construção mútua. Tijolo por tijolo. Sem pressa, sem drama, sem surpresa. A melhor história às vezes é a que não tem plot twist.

### earth_air

- **content:** Contraste. Terra quer raiz. Ar quer voo. Funciona quando um admira o que não tem no outro. Quebra quando tenta mudar o outro.
- **alt:** Terra e Ar. Prático e teórico. Concreto e abstrato. Conversam sobre tudo e concordam em nada. Mas a diferença atrai. E quando respeita, ensina.
- **alt2:** Terra com Ar. Um planeja, o outro executa. Ou o contrário. Quando cada um ocupa seu lugar, é parceria real. Quando invade o território do outro, é guerra silenciosa.

### air_air

- **content:** Ventania. Conversam por horas. Ideias que se alimentam, se provocam, se multiplicam. Terminar uma discussão é impossível. Terminar a relação também.
- **alt:** Ar com Ar. Mente encontra mente. Conexão intelectual tão forte que confundem com amor. Às vezes é. Às vezes é só estímulo. A diferença fica clara quando o debate acaba e sobra silêncio. Se o silêncio for confortável, é amor.
- **alt2:** Dois Ares. Liberdade em dobro. Nenhum prende o outro. Nenhum exige. A leveza é real. O que falta é o que os dois evitam: mergulhar.

---

# 12. RARE SIGNS (Cap 09) — 18 textos

### star_jupiter

- **content:** Estrela no Monte de Júpiter. Um dos sinais mais positivos que existem. Sucesso que parece sorte mas é competência acumulada. Algo que você vem construindo vai dar resultado. Quando der, vão dizer "que sorte". Não é sorte. Você sabe.
- **alt:** Estrela em Júpiter. Reconhecimento vindo. Você plantou. Regou. Esperou. Tá quase.
- **alt2:** Estrela no monte da ambição. Raro. O esforço vai ser recompensado de uma forma que vai surpreender até você.

### mystic_cross

- **content:** No centro da palma, entre Coração e Cabeça, tem uma Cruz Mística. Aparece em poucas mãos. Intuição fora do padrão. Você sente coisas antes de acontecerem. Padrões que os outros não veem, você vê. Quando diz "eu sabia", não é arrogância. É verdade.
- **alt:** Cruz Mística. Rara. Marca de quem percebe o que tá por trás da superfície. Não adivinha. Lê. Sempre soube fazer isso.
- **alt2:** A Cruz Mística. Radar. Intuição que funciona como sexto sentido. Entra num lugar e já sabe. Conhece alguém e já sabe. Nem sempre consegue explicar.

### ring_solomon

- **content:** Anel de Salomão. Semicírculo na base do indicador. Capacidade de ler pessoas. Não é empatia comum. É raio-x. Você vê intenção por trás de ação. Motivação por trás de discurso. Impossível de enganar.
- **alt:** Anel de Salomão. Sabedoria social. Entende gente melhor do que gente entende gente. Não porque estudou. Porque nasceu com isso.
- **alt2:** Salomão na sua mão. Julgamento que assusta. Avalia uma pessoa em segundos. Quase nunca erra.

### sun_line

- **content:** Linha do Sol. Brilho pessoal. Ilumina ambientes sem forçar. Tem gente que entra num lugar e muda a energia. Você é essa gente. Nem sempre percebe.
- **alt:** Linha do Sol. Carisma natural. Não é performance. É emissão. Atrai oportunidades, pessoas, situações. Sem esforço consciente.
- **alt2:** Sol na mão. Reconhecimento que vem naturalmente. Não precisa se promover. O que faz se promove sozinho.

### intuition_line

- **content:** Linha de Intuição. Rara. Pressentimentos que se confirmam. Sempre. Você já duvidou de si mesma. Parou de duvidar. Porque toda vez que ignorou a intuição, se arrependeu.
- **alt:** Linha de Intuição. Antena. Capta sinais que os outros não captam. Não é místico. Seu sistema nervoso processa em camadas que a consciência não acessa.
- **alt2:** Intuição como linha visível. Poucas mãos têm. Seu inconsciente trabalha mais rápido que seu consciente. Quando algo "parece errado" sem motivo, não é paranoia.

### protection_marks

- **content:** Marcas de proteção. Linhas paralelas em pontos específicos. Alguém cuida de você. Visível ou não. Ancestralidade, universo, ou acaso jogando a seu favor repetidamente. O nome não importa. A proteção é real.
- **alt:** Marcas de proteção. Escudo em áreas vulneráveis. Já escapou de coisas que não deveria ter escapado. Coincidência demais.
- **alt2:** Proteção escrita na mão. Rede de segurança invisível. Não significa que nada vai dar errado. Significa que quando der, algo te segura. Sempre segurou.

---

# 13. MEASUREMENTS — 24 fixos

## Coração

| Variação         | Comprimento                                 | Curvatura                       | Profundidade                           |
| ---------------- | ------------------------------------------- | ------------------------------- | -------------------------------------- |
| long_straight    | Longa. Atravessa a palma inteira sem parar. | Reta. Sem desvio nenhum.        | Marcada. Funda. Sem correntes.         |
| long_curved      | Longa. Vai de ponta a ponta.                | Curva suave, generosa.          | Consistente do início ao fim.          |
| long_deep_curved | Longa. Passa do centro com folga.           | Curva acentuada. Mergulha.      | Profunda. Das mais marcadas que eu vi. |
| short_straight   | Curta. Para no meio da palma.               | Reta. Objetiva.                 | Firme, mas discreta.                   |
| short_curved     | Curta. Compacta.                            | Curva concentrada.              | Média. Presente, não gritante.         |
| medium_straight  | Média. Nem longa, nem curta.                | Reta. Equilibrada.              | Uniforme. Sem variação.                |
| medium_curved    | Média. Comprimento moderado.                | Curva presente, não exagerada.  | Moderada. Consistente.                 |
| faint            | Extensão variável.                          | Direção suave, quase hesitante. | Tênue. Precisa de luz boa pra ver.     |

## Cabeça

| Variação         | Comprimento                      | Direção                    | Profundidade                           |
| ---------------- | -------------------------------- | -------------------------- | -------------------------------------- |
| long_straight    | Longa. Passa do centro da palma. | Reta. Direta. Sem desvio.  | Uniforme. Firme.                       |
| long_curved      | Longa. Extensa.                  | Mergulha pro Monte da Lua. | Constante. Sem interrupção.            |
| long_deep_curved | Muito longa. Quase toca a borda. | Curva profunda pra Lua.    | Profunda. Marcada. Pesada.             |
| short_straight   | Curta. Para antes do centro.     | Reta. Pragmática.          | Firme. Compacta.                       |
| short_curved     | Curta. Compacta.                 | Curva leve. Intuitiva.     | Média. Suave.                          |
| medium_straight  | Média. Comprimento padrão.       | Reta. Sem desvio.          | Moderada. Estável.                     |
| medium_curved    | Média.                           | Curva suave presente.      | Equilibrada.                           |
| faint            | Extensão difícil de medir.       | Direção sutil.             | Fraca. Discreta. Presente, mas quieta. |

## Vida

| Variação       | Arco                               | Monte de Vênus            | Profundidade                     |
| -------------- | ---------------------------------- | ------------------------- | -------------------------------- |
| long_deep      | Extenso. Contorna generosamente.   | Pronunciado, firme.       | Profunda. Constante até o pulso. |
| long_faint     | Extenso, mas suave.                | Moderado.                 | Tênue. Presente mas sem força.   |
| short_deep     | Curto. Para cedo.                  | Contido.                  | Funda enquanto dura.             |
| short_faint    | Curto e suave.                     | Discreto.                 | Fraca. Pede atenção.             |
| curved_wide    | Arco largo. Generoso.              | Pronunciado. Vênus cheio. | Consistente. Forte.              |
| curved_tight   | Arco fechado. Perto do polegar.    | Contido. Reservado.       | Presente, firme.                 |
| broken_restart | Interrompido. Recomeça mais fundo. | Varia.                    | Mais funda na segunda fase.      |
| chained        | Ondulado. Oscilante.               | Moderado.                 | Irregular. Vai e volta.          |

## Destino

| Variação      | Início                      | Direção                         | Terminação                   |
| ------------- | --------------------------- | ------------------------------- | ---------------------------- |
| present_deep  | Do pulso ou perto.          | Firme em direção a Saturno.     | Forte. Sem bifurcação.       |
| present_faint | Início indefinido.          | Sutil. Pra cima, mas hesitante. | Suave.                       |
| broken        | Começa, para, recomeça.     | Muda de direção após a pausa.   | A segunda fase é mais forte. |
| multiple      | Múltiplos pontos de início. | Direções paralelas subindo.     | Várias terminações.          |
| late_start    | Começa no meio da palma.    | Firme quando começa.            | Sólida. Sem hesitação.       |
| absent        | —                           | —                               | —                            |

---

# 14. PAYWALL TEASERS (5 fixos)

Frase acima: "Tem mais. Muito mais. Quer ver o que suas outras linhas dizem?"

| #   | Seção      | Frase visível                                                                       |
| --- | ---------- | ----------------------------------------------------------------------------------- |
| 1   | Mente      | Sua cabeça decide rápido. Seu coração demora pra aceitar. E no meio desse atraso... |
| 2   | Passado    | Tem uma marca aqui que apareceu faz uns anos. Você sabe do que eu tô falando.       |
| 3   | Intimidade | Quando a porta fecha, você é outra pessoa. E quase ninguém sabe.                    |
| 4   | Destino    | Tem algo chegando. E não, não é o que você tá esperando.                            |
| 5   | Raros      | Tem uma marca na sua mão que quase ninguém tem. Eu vi.                              |

---

# 15. ORDEM DAS SEÇÕES (v2)

```
report_opening
PRÓLOGO (FREE)        Elemento + Retrato
  → prologue_to_heart
CAP 01 (FREE)         Coração
  → heart_to_paywall
═══ PAYWALL ═══
CAP 02 (PAGO)         Cabeça
  → head_to_life
CAP 03 (PAGO)         Vida
  → life_to_venus
CAP 04 (PAGO)         Vênus
  → venus_to_mounts
CAP 05 (PAGO)         Montes
  → mounts_to_fate
CAP 06 (PAGO)         Destino
  → fate_to_crossings
CAP 07 (PAGO)         Cruzamentos
  → crossings_to_compat
CAP 08 (PAGO)         Compatibilidade
  → compat_to_rare
CAP 09 (PAGO)*        Raros (* só se existirem)
EPÍLOGO
```

### Diferenças vs mock atual

| Mock atual                   | v2                     |
| ---------------------------- | ---------------------- |
| Destino em #4                | Destino em #6          |
| Intimidade em #5             | Intimidade em #4       |
| Montes em #7                 | Montes em #5           |
| Compatibilidade em #6        | Compatibilidade em #8  |
| Cruzamentos em #8            | Cruzamentos em #7      |
| "Planeta dominante"          | "Monte dominante"      |
| "Na quiromancia clássica..." | Removido               |
| Título "Na cama"             | "Quando a porta fecha" |
| Compatibilidade em grid      | Narrativa              |

---

# CONTAGEM FINAL

| Arquivo         | Blocos   | Textos   |
| --------------- | -------- | -------- |
| report-opening  | 1        | 3        |
| epilogue        | 1        | 3        |
| section-meta    | 10       | —        |
| impact-phrases  | 8        | 8        |
| transitions     | 10       | 10       |
| element         | 12       | 36       |
| heart           | 30       | 90       |
| head            | 28       | 84       |
| life            | 24       | 72       |
| venus           | 6        | 18       |
| mounts          | 12       | 36       |
| fate            | 18       | 54       |
| crossings       | 8        | 24       |
| compatibility   | 10       | 30       |
| rare-signs      | 6        | 18       |
| paywall-teasers | 5        | 5        |
| measurements    | 24       | 24       |
| gender-map      | —        | —        |
| **TOTAL**       | **~203** | **~515** |
