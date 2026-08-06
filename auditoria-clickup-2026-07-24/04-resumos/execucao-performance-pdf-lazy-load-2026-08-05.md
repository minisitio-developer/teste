# Execucao - Performance de PDF lazy-load

Data: 2026-08-05

## Objetivo

Reduzir o JavaScript inicial enviado ao usuario, carregando bibliotecas pesadas de PDF/imagem apenas quando usadas.

## Alteracoes

- `front/src/globalFunctions/functions.jsx`: `jspdf` e `html2canvas` passaram de imports estaticos para imports dinamicos.
- `front/src/plugins/PdfGenerator.jsx`: `jspdf` e `html2canvas` passaram a carregar sob demanda no metodo `generatePdf`.
- `front/src/plugins/Adesivo.jsx`: `html2canvas` passou a carregar sob demanda no download do adesivo.
- Removidos logs de DOM/base64 no gerador/impressao de adesivo.
- Adicionado smoke test para impedir regressao para import estatico dessas bibliotecas nos helpers compartilhados.

## Validacao

- `npm run test:smoke`: aprovado, 9 testes passaram.
- `npm run build`: aprovado.

## Resultado de performance

- Chunk principal antes da otimizacao: aproximadamente `2.150 kB`.
- Apos separar `jspdf`: aproximadamente `1.751 kB`.
- Apos separar tambem `html2canvas`: aproximadamente `1.551 kB`.

Reducao aproximada no chunk principal: `599 kB` minificado.

## Pendencias relacionadas

- Ainda existem avisos de imports dinamicos inefetivos em `Calhau.jsx` e `Campanha.jsx`.
- O bundle principal ainda passa de 500 kB e precisa de novas rodadas de code splitting.
