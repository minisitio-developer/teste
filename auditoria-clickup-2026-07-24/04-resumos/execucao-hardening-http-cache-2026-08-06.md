# Execucao - Hardening HTTP e Cache

Data: 2026-08-06
Branch: codex/melhorias-seguranca-performance-20260805
PR: https://github.com/minisitio-developer/teste/pull/2

## Objetivo

Melhorar seguranca, estabilidade e performance de entrega HTTP sem instalar novas dependencias nem alterar contratos publicos de API.

## Entregas

- Ocultado o header `X-Powered-By` do Express.
- Origens CORS agora sao deduplicadas.
- CORS com wildcard passou a refletir apenas a origem real da requisicao, evitando `*` junto com credenciais.
- Rate limit de `/api` passou a ser configuravel via `API_RATE_LIMIT_MAX`.
- Rate limit passou a emitir headers padrao e desativar headers legados.
- Proxy de imagens do servidor antigo ganhou timeout configuravel via `IMAGE_PROXY_TIMEOUT_MS`.
- Assets versionados do frontend em `/assets` agora recebem cache `public, max-age=31536000, immutable`.
- Demais arquivos estaticos do frontend mantem cache curto de 1 hora.

## Validacao

- `node --check back/index.js`: sintaxe OK.
- `npm run test:smoke`: 17 testes passando.
- `npm run build`: build de producao concluido com sucesso.

## Impacto esperado

- Menor exposicao de tecnologia do servidor.
- Menos risco de requisicoes presas no fallback de imagens antigas.
- Melhor reaproveitamento de cache no navegador/CDN para assets com hash.
- Limites operacionais mais faceis de calibrar em homologacao e producao.
