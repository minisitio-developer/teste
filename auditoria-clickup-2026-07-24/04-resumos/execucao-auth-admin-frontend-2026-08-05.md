# Execucao - autenticacao em chamadas admin do frontend

Data: 2026-08-05

## Objetivo

Garantir que chamadas administrativas restantes para rotas protegidas enviem token, enquanto chamadas publicas usam rotas `/portal/*`.

## Alteracoes realizadas

### Admin Espacos

Arquivos:

- `front/src/admin/view/Espacos/FormCadastro.jsx`
- `front/src/admin/view/Espacos/ComprarAnuncio.jsx`

Mudancas:

- Adicionado header `authorization: Bearer <userTokenAccess>` na consulta de desconto admin.
- Adicionado header `authorization: Bearer <userTokenAccess>` no cadastro de anuncio admin.

### Fluxos publicos previamente migrados

Confirmado por busca:

- `front/src/components/Modal/ContentChildForm.jsx`
- `front/src/components/Modal/ContentChildLogin.jsx`
- `front/src/views/area-assinante/AssinanteCadastro.jsx`
- `front/src/views/comprar-anuncio/_components/checkoutUpdate.jsx`
- `front/src/views/campanha/_components/checkoutUpdate.jsx`
- `front/src/components/WebcardThumb.jsx`
- `front/src/views/painelAnuciante/Editar.jsx`

Esses fluxos agora usam `/portal/*` para criacao publica e consulta publica de desconto.

## Validacao

Comando executado:

```bash
cd front && npm run build
```

Resultado:

- Build concluido com sucesso.
- Warnings conhecidos de performance permanecem.

## Proximo bloco recomendado

Criar smoke tests automatizados minimos para travar regressao em:

1. Rotas publicas de portal.
2. Rotas admin protegidas.
3. Health check.
4. Validacao basica de payload de usuario portal.

