# Execucao - Limpeza de logs em checkout publico

Data: 2026-08-05

## Objetivo

Remover logs de debug dos fluxos publicos de compra, checkout e campanha para reduzir ruido em producao e evitar exposicao acidental de dados no console.

## Alteracoes

- Removidos `console.log` ativos de `front/src/views/comprar-anuncio/criarAnuncio.jsx`.
- Removidos `console.log` ativos de `front/src/views/comprar-anuncio/_components/checkoutUpdate.jsx`.
- Removidos `console.log` ativos de `front/src/views/campanha/_components/checkoutUpdate.jsx`.
- Removidos comentarios antigos contendo `console.log` nesses trechos criticos.
- Adicionado smoke test para impedir `console.log` ativo nos arquivos criticos de checkout publico.

## Validacao

- `npm run test:smoke`: aprovado, 13 testes passaram.
- `npm run build`: aprovado.
