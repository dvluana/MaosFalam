# MaosFalam

Webapp de quiromancia com IA. Mobile-first. Next.js 14+ App Router + TypeScript strict + Tailwind + Framer Motion.
Personagem invisivel: cigana que existe so como voz nos textos. Tecnologia invisivel.

## Workflow

- Leia TODO.md no inicio de cada sessao. Trabalhe na primeira tarefa de AGORA.
- Ao completar tarefa: mova pra DONE no TODO.md com data. Atualize STATUS.md.
- Ao encontrar subtarefa: adicione no TODO.md na secao correta.
- Ao tomar decisao tecnica: registre em STATUS.md na secao "Decisoes tecnicas".

## Commands

```
npm run dev | npm run build | npm run lint | npm run type-check | npm run test | npm run test:e2e
```

## Rules

- TypeScript strict. Sem `any`.
- Componentes: funcoes + export default.
- Tailwind pra estilos. CSS custom so pra canvas/particles.
- `no-console: error` no ESLint.
- Front com mocks primeiro. Hook useMock() pra transicao pro backend.

## Modularizacao

- 1 componente = 1 responsabilidade = 1 arquivo.
- Se o componente faz 2 coisas, extraia a segunda pra outro componente.
- Se precisa de scroll pra achar o return(), ta grande. Extraia.
- Logica de dados (fetch, transformacao) fica em hooks, nao em componentes.
- Componente recebe dados prontos por props. Renderiza. So isso.
- Tipos compartilhados em /src/types/. Tipos locais no topo do arquivo.
- Nao criar abstracoes "pra caso precise no futuro". Extraia quando precisar.

## Naming

Componentes: PascalCase.tsx | Hooks: useCamelCase.ts | Types: PascalCase | Constantes: UPPER_SNAKE | Pastas: kebab-case | Mocks: kebab-case.json

## Brand voice (OBRIGATORIO em todo texto pro usuario)

- Segunda pessoa. "Voce", nunca "as pessoas".
- Cigana: direta, sem hedging. Sem "talvez", "pode ser".
- ZERO: travessoes (—), energias, vibracoes, universo, algoritmo, IA, emojis.
- Nomenclatura real: "Monte de Jupiter", "Linha de Saturno".
- A marca revela, nunca explica.

## Docs (leia SO quando precisar)

- @docs/screens.md — telas e estados. ANTES de criar qualquer tela.
- @docs/blocks.md — blocos de texto. Quando criar mocks ou resultado.
- @docs/palmistry.md — quiromancia. Quando tocar em deteccao.
- @docs/brand-voice.md — tom de voz. Quando tiver duvida sobre copy.
- @docs/architecture.md — DDD, banco, APIs. Quando comecar backend.
- @docs/product.md — mercado, monetizacao. Se precisar contexto de negocio.
- @docs/DS.md — design system. Quando criar componentes visuais.

## Colors

black:#08050E deep:#110C1A surface:#171222 parchment:#1C1710(SO reading cards)
gold:#C9A24A rose:#C4647A violet:#7B6BA5 bone:#E8DFD0 ember:#8B5A38 velvet:#2A1830

## Fonts

Cinzel Decorative: LOGO ONLY. Cormorant Garamond italic: voz da cigana. Cinzel: headings. Raleway: corpo/UI. JetBrains Mono: dados tecnicos.

## Git

main: prod. develop: staging. feature/\*: PRs pra develop.

## Behavior

- Seja direto. Faca o trabalho. Sem explicacoes longas.
- Quando criar tela: leia docs/screens.md pra TODOS os estados.
- Quando escrever texto de UI: siga brand voice.
- Quando terminar: rode `npm run build`.
- Agrupe tarefas. Nao peca confirmacao a cada passo.
- ANTES de editar arquivo existente: leia ele primeiro.
