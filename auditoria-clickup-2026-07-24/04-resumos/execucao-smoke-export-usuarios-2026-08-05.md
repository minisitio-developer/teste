# Execucao - Smoke de exportacao de usuarios

Data: 2026-08-05

## Objetivo

Criar uma trava automatizada para evitar regressao em exportacoes de usuarios contendo campos sensiveis, como senha ou hash de autenticacao.

## Alteracoes

- Adicionado contrato no smoke test para validar o caminho ativo de `Admin.exportUser`.
- Validado que os atributos selecionados na consulta ativa nao incluem `senha` nem `hashCode`.
- Validado que as colunas geradas no Excel ativo nao incluem `senha` nem `hashCode`.
- Validado que `serverExportUser` tambem nao expoe cabecalhos sensiveis.

## Validacao

- `node --check scripts/smoke/critical-contracts.test.js`
- `npm run test:smoke`

Resultado: aprovado, 7 testes passaram.

## Observacao

O arquivo `back/controllers/Admin.js` ainda contem trechos legados comentados ou inacessiveis relacionados a exportacao antiga. O smoke foi direcionado ao fluxo ativo para evitar falso positivo sem mascarar vazamento real.
