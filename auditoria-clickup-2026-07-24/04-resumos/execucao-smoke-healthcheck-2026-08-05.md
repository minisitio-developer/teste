# Execucao - Smoke de healthcheck

Data: 2026-08-05

## Objetivo

Evitar regressao operacional no endpoint de saude da API, garantindo que `/api/health` continue registrado antes do catch-all do frontend.

## Alteracoes

- Adicionado contrato em `scripts/smoke/critical-contracts.test.js`.
- Validado que `back/index.js` possui rota `/api/health`.
- Validado que o catch-all `app.get('*')` existe e vem depois do healthcheck.

## Validacao

- `node --check scripts/smoke/critical-contracts.test.js`
- `npm run test:smoke`

Resultado: aprovado, 8 testes passaram.
