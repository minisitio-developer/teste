# Minisitio

Sistema de guia comercial digital com backend Node.js/Express e frontend React.

**Versao:** v2.1.29

---

## Iniciar Localmente

### Pre-requisitos

- [Node.js v20+](https://nodejs.org)
- MySQL v8 rodando na porta **3307** (ou altere `DB_PORT` no `.env`)

### Opcao A — Script automatico (Windows)

```
Clique duplo em iniciar_robusto.bat
```

O script verifica pre-requisitos, mata processos nas portas, verifica MySQL e inicia tudo.

### Opcao B — Manual

```bash
# Clonar
git clone https://github.com/eduardotrindade/minisitio.git
cd minisitio

# Backend
cd back
npm install
cp .env.example .env   # Configure as variaveis
node index.js

# Frontend (outra janela)
cd front
npm install
npm start
```

### URLs

| Servico    | URL                          |
|------------|------------------------------|
| Frontend   | http://localhost:3000         |
| Backend    | http://localhost:3032/api     |
| MySQL      | localhost:3307                |

---

## Build de Producao

```bash
cd front
npm run build
```

O build e gerado em `front/build/`. O backend ja serve esta pasta automaticamente.

---

## Variaveis de Ambiente

### `back/.env`

| Variavel | Descricao | Padrao |
|----------|-----------|--------|
| `PORT` | Porta do servidor backend | `3032` |
| `NODE_ENV` | Ambiente (`development`/`production`) | `development` |
| `DB_HOST` | Host do MySQL | `127.0.0.1` |
| `DB_PORT` | Porta do MySQL | `3307` |
| `DB_USER` | Usuario MySQL | `root` |
| `DB_PASSWORD` | Senha MySQL | *(obrigatorio)* |
| `DB_NAME` | Nome do banco | `minisitio_local` |
| `ALLOWED_ORIGINS` | Origens CORS permitidas | localhost |
| `JWT_SECRET` | Chave JWT (64+ chars) | *(obrigatorio)* |
| `MP_ACCESS_TOKEN_SANDBOX` | Token Mercado Pago (teste) | *(obrigatorio)* |
| `MP_ACCESS_TOKEN_PROD` | Token Mercado Pago (producao) | *(obrigatorio)* |
| `API_SECRET` | Chave secreta da API | *(obrigatorio)* |
| `SECRET_KEY_WEBHOOK` | Chave do webhook | *(obrigatorio)* |

---

## Docker

```bash
# Subir todos os servicos
docker-compose up --build

# Parar
docker-compose down
```

**Servicos Docker:**
- Backend: porta 3032
- Frontend: porta 3000
- MySQL: porta 3307

---

## Estrutura do Projeto

```
minisitio/
├── back/               # Backend Node.js/Express
│   ├── config/         # Configuracoes (DB, JWT, SMTP)
│   ├── controllers/    # Logica de negocios
│   ├── models/         # Modelos Sequelize
│   ├── routes/         # Rotas da API
│   ├── middlewares/    # Autenticacao, validacao
│   ├── crons/          # Tarefas agendadas
│   └── index.js        # Ponto de entrada
│
├── front/              # Frontend React
│   ├── src/
│   │   ├── components/ # Componentes reutilizaveis
│   │   ├── views/      # Paginas principais
│   │   ├── admin/      # Painel administrativo
│   │   ├── routes/     # Roteamento React Router
│   │   └── config/     # Configuracao de URLs
│   └── build/          # Build de producao (gerado)
│
├── .github/workflows/  # CI/CD GitHub Actions
├── docker-compose.yml  # Orquestracao Docker
├── iniciar.bat         # Script inicializacao Windows
└── iniciar_robusto.bat # Script robusto com verificacoes
```

---

## Seguranca

Consulte [SEGURANCA.md](SEGURANCA.md) para guia completo.

**Checklist pre-publicacao:**
- [ ] `.env` configurado com valores reais
- [ ] `ALLOWED_ORIGINS` com dominios de producao
- [ ] `JWT_SECRET` com 64+ caracteres aleatorios
- [ ] SSL/HTTPS configurado
- [ ] Rate limiting ativo
- [ ] Helmet.js ativo

---

## CI/CD

O projeto usa GitHub Actions (`.github/workflows/ci.yml`):
- **Push para `master`**: verifica sintaxe backend + build frontend

### Secrets para configurar no GitHub:

| Secret | Descricao |
|--------|-----------|
| `REACT_APP_API_URL` | URL da API em producao |
| `REACT_APP_DOMAIN` | Dominio do frontend |

---

## Comandos Uteis

```bash
# Verificar sintaxe do backend
node --check back/index.js

# Build do frontend
cd front && npm run build

# Iniciar MySQL (Docker)
docker run -d --name minisitio-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=minisitio_local -p 3307:3306 mysql:8.0
```
