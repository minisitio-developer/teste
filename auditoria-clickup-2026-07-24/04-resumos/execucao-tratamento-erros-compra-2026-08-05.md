# Execucao - tratamento de erros no fluxo publico de compra

Data: 2026-08-05

## Objetivo

Evitar erro silencioso ou tela travada quando APIs de usuario, anuncio ou pagamento retornam falha durante a compra publica.

## Alteracoes realizadas

Arquivo:

- `front/src/views/comprar-anuncio/criarAnuncio.jsx`

Mudancas:

- Criado helper `finalizarComErro`.
- Formulario deixa de assumir que `.form-create` sempre existe.
- Consulta de usuario agora possui `catch`.
- Criacao de usuario valida `res.success` e `res.message.codUsuario`.
- Criacao de anuncio valida `res.success` e `res.message.codAnuncio`.
- Falhas de pagamento agora exibem erro visivel ao usuario.
- Erro de criacao de anuncio destrava spinner e remove blur do formulario.

## Smoke test

Arquivo:

- `scripts/smoke/critical-contracts.test.js`

Mudanca:

- Adicionado teste garantindo que o fluxo principal de compra valida resposta antes de usar `codUsuario`, `codAnuncio` e antes de redirecionar pagamento.

## Validacao

Comandos executados:

```bash
cd front && npm run build
npm run test:smoke
```

Resultado:

- Build frontend: sucesso.
- Smoke tests: 5/5 passando.

