# Execucao - Performance de rotas admin lazy-load

Data: 2026-08-05

## Objetivo

Reduzir carregamento inicial do frontend removendo telas administrativas de uso especifico do bundle principal.

## Alteracoes

- `front/src/routes/Rotas.jsx`: `Calhau` passou para `React.lazy`.
- `front/src/routes/Rotas.jsx`: `Campanha` passou para `React.lazy`.
- Rotas foram envolvidas por `Suspense` mantendo URLs e `PrivateRoute`.
- Adicionado smoke test para impedir import estatico dessas telas no arquivo central de rotas.

## Validacao

- `npm run test:smoke`: aprovado, 10 testes passaram.
- `npm run build`: aprovado.

## Resultado de performance

- `Calhau` gerado como chunk proprio: aproximadamente `2.60 kB`.
- `Campanha` gerado como chunk proprio: aproximadamente `15.06 kB`.
- Chunk principal apos esta etapa: aproximadamente `1.534 kB`.
- Avisos anteriores de import dinamico inefetivo em `Calhau` e `Campanha` foram eliminados.

## Pendencias relacionadas

- O chunk principal ainda excede 500 kB.
- O CSS principal ainda e grande e merece uma rodada propria de revisao.
