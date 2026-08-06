# Execucao - smoke de protecao admin desconto

Data: 2026-08-05

## Objetivo

Garantir que a rota administrativa de consulta de desconto continue protegida por `auth`, evitando reabertura acidental de endpoint `/admin/*`.

## Analise

A rota legada sem `/api` em `/admin/desconto/buscar/:id` foi conferida e esta comentada, portanto nao esta ativa.

Rota ativa protegida:

- `/api/admin/desconto/buscar/:id`

Rota publica correta:

- `/api/portal/desconto/buscar/:id`

## Alteracao

Arquivo:

- `scripts/smoke/critical-contracts.test.js`

Mudanca:

- Adicionado teste garantindo que `/api/admin/desconto/buscar/:id` exige `auth`.

## Validacao

Comandos executados:

```bash
npm run test:smoke
node --check back/routes/Routes.js
```

Resultado:

- Smoke tests: 4/4 passando.
- Sintaxe de rotas: OK.

