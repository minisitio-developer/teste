# Execucao - smoke tests de contratos criticos

Data: 2026-08-05

## Objetivo

Adicionar uma trava automatizada simples para evitar regressao nos contratos mais sensiveis de seguranca e fluxo publico/admin.

## Alteracoes realizadas

Arquivos:

- `package.json`
- `scripts/smoke/critical-contracts.test.js`

Mudancas:

- Criado script `npm run test:smoke`.
- Criados testes com `node:test`, sem dependencia externa.

## Contratos cobertos

1. Rotas administrativas de criacao de usuario/anuncio exigem `auth`.
2. Rota publica de criacao de usuario usa `Users.createPortal`.
3. Rota publica de desconto existe em `/api/portal/desconto/buscar/:id`.
4. Frontend publico nao chama mais `/admin/usuario/create` nem `/admin/anuncio/create`.
5. Endpoint `fale-com-dono` valida e-mail, valida anuncio e nao loga `req.body`.
6. Mailer do `fale-com-dono` escapa HTML e usa `replyTo`.

## Validacao

Comandos executados:

```bash
npm run test:smoke
cd front && npm run build
```

Resultado:

- Smoke tests: 4/4 passando.
- Build frontend: sucesso.

## Observacao

O primeiro teste falhou por glob `*.test.js` no Windows. O script foi corrigido para apontar o arquivo explicitamente e passou em seguida.

