# Execucao - Performance com Lazy Routes

Data: 2026-08-06
Branch: codex/melhorias-seguranca-performance-20260805
PR: https://github.com/minisitio-developer/teste/pull/2

## Objetivo

Reduzir o peso inicial do frontend e evitar que telas administrativas, BI, plugins e paginas secundarias sejam carregadas junto com a primeira visita publica.

## Entregas

- Mantida a Home como entrada estatica principal.
- Convertidas rotas publicas secundarias para `React.lazy`.
- Convertidas telas de admin, BI, PIN, pagamentos, cadernos, usuarios, espacos, duplicidades, campanha e configuracoes para carregamento sob demanda.
- Convertidos plugins e paginas auxiliares, como QR Code, adesivo, institucional, contato, privacidade e reset de senha para carregamento sob demanda.
- Adicionada protecao no smoke test para impedir regressao de imports estaticos de telas admin no roteador.

## Resultado observado

- Antes: bundle principal `index` em aproximadamente 1.543 kB, com aviso de chunk acima de 500 kB.
- Depois: bundle principal `index` em aproximadamente 293 kB, sem aviso de chunk acima de 500 kB.
- O CSS principal tambem reduziu de aproximadamente 503 kB para 430 kB.

## Validacao

- `npm run test:smoke`: 16 testes passando.
- `npm run build`: build de producao concluido com sucesso.

## Impacto esperado

- Primeira carga publica mais leve.
- Menos JavaScript baixado por visitantes que nao usam admin.
- Melhor base para Core Web Vitals e experiencia mobile.
