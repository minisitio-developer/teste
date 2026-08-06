# Execucao - migracao de rotas publicas para portal

Data: 2026-08-05

## Objetivo

Remover chamadas publicas do frontend que apontavam para rotas `/admin/*` sem token, evitando falhas 401/403 apos o endurecimento das rotas administrativas.

## Alteracoes realizadas

### Rotas de criacao publica

Arquivos:

- `front/src/components/Modal/ContentChildForm.jsx`
- `front/src/components/Modal/ContentChildLogin.jsx`
- `front/src/views/area-assinante/AssinanteCadastro.jsx`

Mudancas:

- `/admin/usuario/create` -> `/portal/usuario/create`
- `/admin/anuncio/create` -> `/portal/anuncio/create`

### Rotas publicas de consulta de desconto

Arquivos:

- `front/src/views/comprar-anuncio/_components/checkoutUpdate.jsx`
- `front/src/views/campanha/_components/checkoutUpdate.jsx`
- `front/src/components/WebcardThumb.jsx`
- `front/src/views/painelAnuciante/Editar.jsx`

Mudanca:

- `/admin/desconto/buscar/:id` -> `/portal/desconto/buscar/:id`

## Validacao

Comando executado:

```bash
cd front && npm run build
```

Resultado:

- Build frontend concluido com sucesso.
- Warnings conhecidos permanecem: Browserslist, chunks grandes e dynamic imports inefetivos.

## Observacao

Chamadas em `front/src/admin/view/*` foram preservadas como administrativas. O proximo bloco deve revisar se essas chamadas administrativas enviam `authorization` corretamente.

