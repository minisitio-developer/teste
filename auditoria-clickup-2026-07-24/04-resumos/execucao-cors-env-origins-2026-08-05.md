# Execucao - Estabilidade de CORS via env

Data: 2026-08-05

## Objetivo

Evitar falhas de CORS causadas por espacos ou entradas vazias em `ALLOWED_ORIGINS`.

## Alteracoes

- `back/index.js`: origens vindas de `ALLOWED_ORIGINS` agora passam por `trim`.
- Entradas vazias sao descartadas com `filter(Boolean)`.
- Adicionado smoke test cobrindo esse contrato.

## Validacao

- `node --check back/index.js`
- `npm run test:smoke`
- `npm run build`

Resultado: aprovado, 11 testes passaram e build de producao concluido.
