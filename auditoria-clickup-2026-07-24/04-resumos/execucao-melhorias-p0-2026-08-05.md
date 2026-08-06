# Execucao de melhorias P0 - 2026-08-05

## Escopo executado

Primeiro bloco de melhorias criticas aplicado com foco em seguranca e estabilidade, sem alterar regras comerciais principais.

## Alteracoes realizadas

### 1. Criacao publica de usuario endurecida

Arquivo:

- `back/controllers/Users.js`

Mudanca:

- Criado `Users.createPortal`.
- A rota publica do portal passa a remover pontuacao do CPF/CNPJ.
- `TipoUsuario` vindo do cliente nao pode mais criar perfil administrativo.
- Portal aceita apenas:
  - `3` para anunciante;
  - `5` para prefeitura/capa quando explicitamente solicitado.

Motivo:

Evitar que chamada publica para `/api/portal/usuario/create` consiga criar usuario com perfil privilegiado.

### 2. Rota antiga sob `/admin` protegida

Arquivo:

- `back/routes/Routes.js`

Mudanca:

- `/api/admin/usuario/criar-anuncio` agora exige `auth`.
- Criado alias publico correto em `/api/portal/usuario/criar-anuncio`.

Motivo:

Manter convencao de seguranca: tudo que esta em `/api/admin/*` deve exigir autenticacao.

### 3. Endpoint `fale-com-dono` endurecido

Arquivos:

- `back/routes/Routes.js`
- `back/functions/sendMailer.js`

Mudancas:

- Removido log do corpo completo da mensagem.
- Adicionada validacao de e-mail.
- Adicionada validacao de `codAnuncio`.
- Retorno 404 quando anuncio nao existe ou nao tem e-mail de autorizante.
- Envio de e-mail agora fica em `try/catch`, com resposta controlada em erro.
- HTML livre informado pelo usuario e escapado no template do e-mail.
- Remetente tecnico passa a ser `Minisitio <SMTP_USER>`, com `replyTo` apontando para o e-mail do usuario.

Motivo:

Reduzir vazamento de dados pessoais em logs, evitar erro silencioso no SMTP e diminuir risco de HTML/script injetado em mensagem de contato.

## Validacoes realizadas

Comandos executados com sucesso:

```bash
node --check back/controllers/Users.js
node --check back/routes/Routes.js
node --check back/functions/sendMailer.js
node --check back/index.js
cd front && npm run build
```

Resultado:

- Sintaxe backend: OK.
- Build frontend: OK.

Warnings observados no build:

- Browserslist/caniuse-lite desatualizado.
- Dynamic imports inefetivos em algumas telas admin/BI.
- Chunk principal acima de 500 kB.

Esses warnings nao bloqueiam o funcionamento, mas seguem como melhoria de performance P2.

## Arquivos alterados nesta rodada

- `back/controllers/Users.js`
- `back/routes/Routes.js`
- `back/functions/sendMailer.js`
- `auditoria-clickup-2026-07-24/04-resumos/execucao-melhorias-p0-2026-08-05.md`

## Proximo bloco recomendado

1. Revisar chamadas publicas restantes que ainda apontam para `/admin/*`.
2. Centralizar cliente HTTP no frontend para tratar erro, auth e loading.
3. Criar smoke test automatizado do fluxo compra/cadastro/anuncio.

