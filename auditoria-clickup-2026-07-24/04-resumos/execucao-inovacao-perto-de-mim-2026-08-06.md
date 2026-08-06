# Execucao - Inovacao Perto de mim

Data: 2026-08-06

## Objetivo

Adicionar uma primeira experiencia de busca por proximidade, inspirada em produtos como mapas, rotas e mobilidade, sem depender de nova API paga.

## Alteracoes

- Criado `front/src/utils/geoDistance.js` com:
  - parse seguro de coordenadas;
  - verificacao de coordenadas;
  - calculo Haversine;
  - formatacao de distancia em metros/km.
- `front/src/components/Resultados.jsx` agora possui botao `Perto de mim`.
- Ao clicar, o navegador pede localizacao do usuario e ordena resultados com `descLat/descLng` pela menor distancia.
- `front/src/components/Cardlist.jsx` mostra badge de distancia quando disponivel.
- Adicionado smoke test para garantir geolocalizacao opt-in, calculo local e ausencia de chave Google.

## Validacao

- `npm run test:smoke`: aprovado, 15 testes passaram.
- `npm run build`: aprovado.

## Observacoes

- A funcionalidade degrada bem: anuncios sem coordenadas continuam aparecendo, apenas sem distancia.
- A localizacao so e solicitada quando o usuario clica em `Perto de mim`.
- Nao foi embutida chave de API no frontend.

## Proximos passos

- Popular `descLat/descLng` nos anuncios durante cadastro/edicao.
- Criar score de ranking combinando distancia, promocao ativa e qualidade do perfil.
- Criar mapa de resultados com clusters em uma etapa futura.
