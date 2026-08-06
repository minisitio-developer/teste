# Execucao - checkouts de pagamento com redirect seguro

Data: 2026-08-05

## Objetivo

Evitar redirecionamento para `undefined` ou erro silencioso quando a API de pagamento nao retorna URL valida.

## Alteracoes realizadas

Arquivos:

- `front/src/views/comprar-anuncio/_components/checkoutUpdate.jsx`
- `front/src/views/campanha/_components/checkoutUpdate.jsx`

Mudancas:

- Criado helper `redirecionarPagamento(url)`.
- Validado `response.url` antes de alterar `window.location.href`.
- Criado helper `mostrarErroPagamento()`.
- Falhas na geracao de pagamento agora exibem erro amigavel.

## Smoke test

Arquivo:

- `scripts/smoke/critical-contracts.test.js`

Mudanca:

- Adicionado teste garantindo que os checkouts validam URL de pagamento antes do redirect.

## Validacao

Comandos executados:

```bash
cd front && npm run build
npm run test:smoke
```

Resultado:

- Build frontend: sucesso.
- Smoke tests: 6/6 passando.

