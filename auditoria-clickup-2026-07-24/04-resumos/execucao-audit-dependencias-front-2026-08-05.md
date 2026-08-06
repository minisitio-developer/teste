# Execucao - Auditoria de dependencias do frontend

Data: 2026-08-05

## Objetivo

Reduzir vulnerabilidades conhecidas nas dependencias de producao do frontend sem aplicar migracoes quebraveis sem teste dedicado.

## Alteracoes

- Executado `npm audit fix` no frontend.
- Atualizadas dependencias transitivas vulneraveis, incluindo `dompurify`, `fast-uri`, `socket.io-parser` e `ws`.
- Removido `xlsx` do frontend por nao haver correcao disponivel para os advisories publicados.
- `front/src/admin/view/BI/BiTable.jsx` passou a exportar CSV compativel com Excel usando APIs nativas do navegador.
- Adicionado smoke test para impedir reintroducao de `xlsx` no frontend.

## Validacao

- `npm run test:smoke`: aprovado, 12 testes passaram.
- `npm run build`: aprovado.
- `npm audit --omit=dev` no root: 0 vulnerabilidades.
- `npm audit --omit=dev` no frontend: 2 vulnerabilidades moderadas restantes.

## Resultado

- Frontend antes: 8 vulnerabilidades, sendo 5 altas/moderadas corrigiveis e `xlsx` sem fix.
- Frontend depois: 2 vulnerabilidades moderadas restantes em `react-router`.

## Pendencia controlada

As vulnerabilidades restantes em `react-router` exigem `npm audit fix --force`, que instala `react-router-dom@7.18.2` e representa migracao major. Testei rapidamente a linha 7, mas ela aumenta o bundle e o proprio audit apontou advisory novo em algumas versoes. A recomendacao e tratar essa migracao em uma tarefa propria, com teste funcional de navegacao, login, rotas admin e rotas publicas.
