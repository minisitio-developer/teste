# Execucao - Inovacao com voz e rota

Data: 2026-08-06

## Objetivo

Implementar um primeiro pacote de inovacao visivel ao usuario final, inspirado em experiencias modernas de mobilidade e assistencia, sem depender de API paga ou nova infraestrutura.

## Alteracoes

- Criado `front/src/components/VoiceSearchButton.jsx`.
- Criado `front/src/components/SpeakProfileButton.jsx`.
- Criado `front/src/components/RouteAssistButton.jsx`.
- `front/src/components/Busca.jsx` agora possui busca por voz quando o navegador suporta Web Speech Recognition.
- `front/src/components/FullWebCard.jsx` agora possui:
  - botao `Ouvir perfil`;
  - botao `Como chegar`.
- `Como chegar` usa Geolocation API sob demanda e abre Google Maps URLs sem chave de API.
- Adicionado smoke test para proteger esses recursos e garantir fallback sem API key embutida.

## Fontes tecnicas

- SpeechRecognition: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- SpeechSynthesis: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- Google Maps URLs: https://developers.google.com/maps/documentation/urls/get-started
- OpenAI Realtime API para evolucao futura: https://platform.openai.com/docs/api-reference/realtime

## Validacao

- `npm run test:smoke`: aprovado, 14 testes passaram.
- `npm run build`: aprovado.

## Observacoes

- SpeechRecognition tem disponibilidade limitada entre navegadores; o botao e ocultado quando nao ha suporte.
- SpeechSynthesis e amplamente disponivel e roda localmente no navegador.
- Geolocalizacao e opt-in pelo usuario e possui fallback: se a permissao for negada, o Google Maps abre rota/destino sem origem precisa.
- Nenhuma chave Google foi adicionada ao frontend.

## Proximos passos recomendados

- Testar manualmente em Chrome/Edge mobile e desktop.
- Criar experiencia `perto de mim` em resultados de busca usando distancia entre usuario e anuncios com latitude/longitude.
- Evoluir voz para assistente conversacional com OpenAI Realtime quando houver decisao de custo/privacidade.
