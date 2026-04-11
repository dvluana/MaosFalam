# MãosFalam

Webapp mobile-first de quiromancia com IA, construído em `Next.js 16`, `React 19`, `TypeScript strict`, `Tailwind v4` e `Framer Motion`.

O projeto hoje entrega um frontend de alta fidelidade para:

- landing principal
- LP de venda
- autenticação
- leitura de mão
- área logada
- tarot gratuito
- compartilhamento
- créditos e pagamento

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
npm run test
```

## Estrutura

```text
src/
  app/           rotas App Router
  components/    UI compartilhada e componentes por domínio
  hooks/         hooks de frontend
  lib/           helpers e adapters do front
  mocks/         conteúdo mockado e builders
  types/         contratos TypeScript
docs/            produto, arquitetura, DS e planos
public/          assets estáticos
```

## Convenções do repositório

- `src/app`: páginas e layouts; devem orquestrar fluxo, não concentrar UI reutilizável.
- `src/components/ui`: primitives e patterns compartilhados.
- `src/components/*`: componentes por domínio (`landing`, `reading`, `camera`, `tarot`, `account`).
- `src/hooks`: hooks sem dependência de componentes visuais.
- `src/mocks`: dados e builders temporários de MVP.
- `src/app/preview/*`: playgrounds de desenvolvimento; bloqueados em produção.

## Documentação principal

- `CLAUDE.md`: workflow interno do repositório
- `STATUS.md`: estado atual do projeto
- `TODO.md`: backlog ativo
- `docs/architecture.md`: arquitetura alvo
- `docs/DS.md`: direção de design system
- `docs/screens.md`: mapeamento de telas e estados

## Estado atual

- frontend funcional e validado com `lint`, `type-check` e `test`
- parte relevante do fluxo ainda é mockada
- `/manifesto` ainda vem de `public/manifesto.html` via rewrite em `src/proxy.ts`
- previews existem para desenvolvimento, mas não ficam acessíveis em produção
