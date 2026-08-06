# Revisao de inovacao - IA, voz e mobilidade

Data: 2026-08-05

## Objetivo

Revisar novas oportunidades de evolucao do Minisitio usando IA, recursos de voz, geolocalizacao, rotas, notificacoes e experiencias inspiradas em Uber/Waze, sem perder estabilidade, seguranca e foco comercial.

## Fontes tecnicas consultadas

- OpenAI Realtime API: https://platform.openai.com/docs/api-reference/realtime
- OpenAI Audio API: https://platform.openai.com/docs/api-reference/audio
- MDN Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- MDN SpeechRecognition: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- Google Maps Routes API: https://developers.google.com/maps/documentation/routes/reference/rest
- MDN Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- Apple Web Push: https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers

## Ideias prioritarias

### 1. Assistente de cadastro com IA

Criar um assistente que ajuda o anunciante a preencher o perfil, revisar texto, sugerir categoria, gerar descricao comercial e identificar campos faltantes.

Beneficio:
- Reduz abandono no cadastro.
- Melhora qualidade dos anuncios.
- Diminui suporte humano.

MVP:
- Botao "Melhorar meu anuncio" no fluxo de cadastro/edicao.
- IA gera `descDescricao`, sugestoes de tags e titulo mais claro.
- Antes de salvar, usuario aprova manualmente.

Risco:
- Nao permitir publicacao automatica sem confirmacao.
- Registrar consentimento para uso dos dados do anuncio.

Estimativa: 2 a 4 dias.

### 2. Busca por voz

Adicionar busca falada no portal: "quero pizzaria perto de mim", "oficina em Porto Velho", "promocoes de mercado".

Tecnologia:
- Web Speech API para reconhecimento quando suportado pelo navegador.
- Fallback por digitacao quando nao houver suporte.
- Futuro: OpenAI Realtime para conversa natural.

Beneficio:
- Experiencia moderna.
- Melhor acessibilidade.
- Diferencial em mobile.

MVP:
- Icone de microfone no campo de busca.
- Transcrever voz para texto.
- Rodar busca atual com o texto transcrito.

Risco:
- SpeechRecognition nao e Baseline em todos os browsers; precisa fallback.

Estimativa: 1 a 2 dias.

### 3. Guia por voz do perfil

Permitir que o usuario toque em "Ouvir resumo" no webcard/perfil e receba leitura do anuncio, endereco, telefone, promocao e horario.

Tecnologia:
- SpeechSynthesis no browser para MVP.
- OpenAI Audio API para voz de maior qualidade em etapas premium.

Beneficio:
- Acessibilidade.
- Uso em movimento.
- Diferencial para publico menos familiarizado com leitura em telas pequenas.

MVP:
- Botao "Ouvir perfil".
- Texto gerado localmente a partir dos dados do anuncio.

Estimativa: 1 dia.

### 4. Minisitio perto de mim

Criar experiencia parecida com "perto de mim": listar anunciantes por proximidade e ordenar por distancia.

Tecnologia:
- Geolocation API do navegador.
- Latitude/longitude ja existem no modelo de anuncio (`descLat`, `descLng`).
- Futuro: mapa com clusters e filtro por categoria.

Beneficio:
- Mais relevancia para consumidor.
- Mais valor comercial para anunciante.

MVP:
- Botao "Usar minha localizacao".
- Ordenar resultados por distancia aproximada.
- Exibir "a X km de voce".

Risco:
- Exigir permissao clara e opcional.
- Nunca bloquear busca se usuario negar localizacao.

Estimativa: 3 a 5 dias.

### 5. Rotas e ETA para o anunciante

No perfil, oferecer "Como chegar", ETA e alternativas de rota.

Tecnologia:
- Google Maps Routes API para distancia/tempo.
- Link externo para app de mapa como fallback.

Beneficio:
- Experiencia estilo Waze/Uber.
- Aumenta conversao de visita presencial.

MVP:
- Calcular distancia/tempo entre usuario e anunciante.
- Botao "Abrir rota".

Estimativa: 2 a 4 dias, dependendo de chave/API/custos.

### 6. Alertas inteligentes de oportunidade

Notificar usuarios sobre promocoes/categorias/cidades salvas.

Tecnologia:
- Push API + Service Worker.
- Compatibilidade com Safari/iOS via Web Push em Home Screen apps.

Beneficio:
- Retencao.
- Reativacao.
- Produto mais parecido com app nativo.

MVP:
- Usuario opta por receber alertas.
- Enviar notificacao quando nova promocao entrar em uma cidade/categoria.

Risco:
- Push exige consentimento e cuidado contra spam.
- Backend precisa armazenar subscription de forma segura.

Estimativa: 5 a 8 dias.

### 7. Ranking inteligente e recomendacao

Criar um motor de recomendacao simples para ordenar anuncios por combinacao de:
- Distancia.
- Categoria buscada.
- Termos do usuario.
- Promocao ativa.
- Qualidade/completude do perfil.
- Historico de cliques/visualizacoes.

Beneficio:
- Resultado mais relevante.
- Mais receita potencial com planos/promocoes.

MVP:
- Score deterministico sem IA primeiro.
- IA entra depois para melhorar semantica de busca.

Estimativa: 4 a 7 dias.

### 8. Copiloto administrativo

Criar um painel IA para administradores perguntarem:
- "Quais cidades estao com baixa cobertura?"
- "Quais perfis estao incompletos?"
- "Quais campanhas performaram melhor?"
- "Sugira 20 leads de categorias em falta."

Tecnologia:
- IA conectada a endpoints internos e relatorios.
- Respostas sempre com links para tela administrativa.

Beneficio:
- Diretoria enxerga inteligencia de negocio.
- Operacao ganha velocidade.

MVP:
- Chat admin somente leitura.
- Consultas sobre usuarios, anuncios, cidades, campanhas e descontos.

Estimativa: 7 a 12 dias.

## Ideias inspiradas em Uber/Waze

### Mapa vivo de demanda

Mostrar mapa por cidade/caderno com calor de buscas e cliques. Ajuda equipe comercial a ver onde vender mais.

### ETA comercial

No perfil: "Voce esta a 8 min deste anunciante". Isso aproxima o produto de apps de mobilidade.

### Status em tempo real do anunciante

Permitir status simples: aberto, ocupado, atendimento rapido, promocao ativa agora.

### Check-in de visita

Usuario confirma que visitou ou ligou; gera metrica para anunciante e prova de valor comercial.

### Roteiro de vendas

Para vendedor interno: rota diaria com leads proximos, prioridade por potencial e lembrete automatico.

## Ordem recomendada de execucao

1. Busca por voz com fallback.
2. Ouvir perfil por voz.
3. Minisitio perto de mim.
4. Rotas/ETA no perfil.
5. Assistente IA de cadastro.
6. Alertas push de promocao.
7. Ranking inteligente.
8. Copiloto administrativo.

## Cuidados obrigatorios

- IA nao deve publicar dados sem aprovacao humana.
- Localizacao deve ser opt-in e degradar bem sem permissao.
- Voz deve ter fallback textual.
- Push precisa de opt-in, opt-out e limite de frequencia.
- Custos de APIs externas devem ser medidos por ambiente antes de abrir para todos.
- Toda novidade precisa entrar com smoke/contrato minimo e teste de build.

## Recomendacao executiva

O melhor primeiro pacote inovador e:

- Busca por voz.
- Ouvir perfil.
- Perto de mim.
- Como chegar/ETA.

Esse pacote e visivel para usuario final, tem impacto comercial claro, parece moderno como Uber/Waze, e pode ser implementado incrementalmente sem mudar o core financeiro.
