# Execucao - Atualizacao Browserslist/caniuse-lite

Data: 2026-08-05

## Objetivo

Atualizar a base de browsers usada pelo build do frontend e remover aviso recorrente de `caniuse-lite` desatualizado.

## Alteracoes

- Executado `npx update-browserslist-db@latest --yes` no frontend.
- `front/package-lock.json` atualizado com a base mais recente.

## Validacao

- `npm run build`: aprovado e sem aviso de `caniuse-lite` desatualizado.
- `npm run test:smoke`: aprovado, 12 testes passaram.

## Avisos restantes

- Chunk principal ainda acima de 500 kB.
- `vite:css` ainda aparece como plugin com custo relevante.
