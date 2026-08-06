# Execucao - Atualizacao Nodemailer

Data: 2026-08-06
Branch: codex/melhorias-seguranca-performance-20260805
PR: https://github.com/minisitio-developer/teste/pull/2

## Objetivo

Corrigir vulnerabilidade direta apontada pelo `npm audit` no pacote de envio de emails.

## Entregas

- Atualizado `nodemailer` de `^8.0.10` para `^9.0.4`.
- Atualizado `back/package-lock.json`.
- Adicionado smoke test para manter Nodemailer em versao 9+.
- Adicionado smoke test para impedir uso de payload `raw` em `sendMailer.js`.

## Validacao

- `node --check back/functions/sendMailer.js`: sintaxe OK.
- `npm run test:smoke`: 17 testes passando.
- `npm run build`: build de producao concluido com sucesso.
- `npm audit --omit=dev`: total caiu de 33 para 32 vulnerabilidades.

## Observacao

O codigo atual usa `createTransport` e `sendMail`, sem payload `raw`. A atualizacao foi mantida como pacote pequeno para reduzir risco operacional.
