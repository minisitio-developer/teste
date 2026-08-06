# Execucao - Remocao de xlsx no Backend

Data: 2026-08-06
Branch: codex/melhorias-seguranca-performance-20260805
PR: https://github.com/minisitio-developer/teste/pull/2

## Objetivo

Remover dependencia direta vulneravel e nao utilizada do backend.

## Diagnostico

- `npm audit --omit=dev` apontava `xlsx` como vulnerabilidade high.
- A busca no codigo nao encontrou uso direto de `require('xlsx')`.
- As ocorrencias restantes de `.xlsx` sao nomes de arquivo ou APIs de `exceljs`/`excel4node`.

## Entregas

- Removido `xlsx` de `back/package.json`.
- Atualizado `back/package-lock.json`.
- Removidos pacotes transitivos exclusivos de `xlsx`.
- Smoke test passou a impedir retorno de `xlsx` como dependencia direta no backend.

## Validacao

- `node --check back/index.js`: sintaxe OK.
- `npm run test:smoke`: 17 testes passando.
- `npm run build`: build de producao concluido com sucesso.
- `npm audit --omit=dev`: total caiu de 34 para 33 vulnerabilidades.

## Proximo risco observado

As vulnerabilidades criticas restantes se concentram principalmente na cadeia legada `html-pdf`/`phantomjs`/`request`. A correcao ideal exige substituir geracao de PDF baseada em PhantomJS por uma abordagem moderna.
