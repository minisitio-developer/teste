# Fluxo de Trabalho — Minisitio

## Branches

| Branch | Uso | Proteção |
|--------|-----|----------|
| `master` | Produção | Push direto bloqueado, apenas PR |
| `develop` | Integração | Base para novas features |
| `feature/*` | Desenvolvimento | Branch a partir de `develop` |
| `fix/*` | Correções | Branch a partir de `develop` |
| `hotfix/*` | Correção urgente | Branch a partir de `master` |

## Fluxo

feature/ → develop → master → VPS (produção)

```
git checkout develop
git pull origin develop
git checkout -b feature/minha-feature

# ... desenvolvimento ...
git add .
git commit -m "feat: descricao"
git push origin feature/minha-feature
```

Criar Pull Request no GitHub: `feature/*` → `develop`

Após aprovação, merge em `develop`. Depois:

PR: `develop` → `master`

## Deploy

A VPS em produção acompanha `origin/master`. Após merge em `master`:

```bash
# Na VPS (apenas leitura, sem commit)
cd /opt/minisitio/applications/minisitio
git pull origin master
docker compose -f /opt/minisitio/infrastructure/compose/docker-compose.production.yml up -d --build
```

## Ambiente Local

```bash
# Primeira vez
cp back/.env.example back/.env
docker compose up -d
cd back && npm run dev

# Frontend (outro terminal)
cd front && npm start
```

## Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: ...` — nova funcionalidade
- `fix: ...` — correção de bug
- `refactor: ...` — refatoração
- `chore: ...` — tarefas de manutenção
- `docs: ...` — documentação
- `style: ...` — formatação, estilo
- `perf: ...` — performance
- `test: ...` — testes

## Segurança

- `.env*` / segredos **nunca** versionados
- VPS usa Deploy Key de **leitura**
- Nenhum desenvolvimento direto na VPS
- Senhas de produção apenas em `/opt/minisitio/config/.env.production`
