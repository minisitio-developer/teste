# Execucao - Remocao de senha fixa no fluxo publico

Data: 2026-08-05

## Objetivo

Remover envio desnecessario de senha fixa e `hashCode` legado no fluxo publico de compra de anuncio.

## Alteracoes

- `front/src/views/comprar-anuncio/criarAnuncio.jsx`: removido envio de `"senha": "12345"`.
- `front/src/views/comprar-anuncio/criarAnuncio.jsx`: removido envio de `"hashCode": 0`.
- Adicionado smoke test para impedir regressao desses campos no fluxo publico.

## Observacao tecnica

O backend `Users.create` ja gera a senha a partir da regra existente do sistema, portanto esses campos enviados pelo frontend eram redundantes e aumentavam risco de manutencao insegura.

## Validacao

- `npm run test:smoke`: aprovado, 11 testes passaram.
- `npm run build`: aprovado.
