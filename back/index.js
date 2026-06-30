require('dotenv').config();

// Prevent unhandled promise rejections from crashing the process
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason && reason.message ? reason.message : reason);
});

// Prevent uncaught exceptions from crashing the process
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});

const express = require('express');
const app = express();
app.set('trust proxy', 1);
const port = Number(process.env.PORT || 3032);
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// ========== VALIDAÇÃO DE SEGURANÇA NA INICIALIZAÇÃO ==========
const requiredEnvVars = ['API_KEY', 'API_SECRET'];
// DB_PASSWORD pode estar dentro de DATABASE_URL (Railway)
if (!process.env.DATABASE_URL && !process.env.MYSQL_URL) {
    requiredEnvVars.push('DB_PASSWORD');
}
const minLen = process.env.NODE_ENV === 'production' ? 10 : 4;
const missing = requiredEnvVars.filter(v => !process.env[v] || process.env[v].length < minLen);
if (missing.length > 0) {
    console.error(`ERRO FATAL: Variáveis de ambiente ausentes ou fracas: ${missing.join(', ')}`);
    console.error('Copie .env.example para .env e configure valores seguros.');
    process.exit(1);
}

if (process.env.API_SECRET && process.env.API_SECRET.length < 64) {
    console.warn('AVISO: API_SECRET deve ter pelo menos 64 caracteres para segurança ideal.');
}

const path = require('path');
const fs = require('fs');
//streams
const http = require("http");
const { Server } = require('socket.io');
const cron = require('node-cron');
const { deletarPromocoesExpiradas } = require('./crons/promocao');
const { inativarCampanhasExpiradas, downgradePerfil } = require('./crons/campanha');


// ========== CONFIGURAÇÃO SEGURA DE CERTIFICADOS ==========
// Para produção, descomente e configure com certificados válidos:
// const https = require('https');
// const options = {
//     key: fs.readFileSync("./certificados/code.key"),
//     cert: fs.readFileSync("./certificados/code.crt"),
// };
// const server = https.createServer(options, app);

// Em desenvolvimento, use HTTP:
const server = http.createServer(app);
const BASE_PATH = "/api";

// ========== CONFIGURAÇÃO SEGURA DE CORS ==========
const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
];
if (process.env.ALLOWED_ORIGINS) {
    defaultOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
}
const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
if (railwayDomain) {
    defaultOrigins.push(`https://${railwayDomain}`);
}
const allowedOrigins = defaultOrigins;

// Configuração segura de Socket.IO
const socketOptions = {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST"],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    path: "/socket.io",
    transports: ['websocket', 'polling']
}

const io = new Server(server, socketOptions);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ========== APLICAR CORS SEGURO ==========
const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, api_key, secret_key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
};
app.use(corsMiddleware);

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10000,
    message: 'Muitas requisicoes, tente novamente mais tarde'
});

app.use('/api', limiter);
app.use(helmet({
    contentSecurityPolicy: false,
}));

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // apenas 5 tentativas
    skipSuccessfulRequests: true
});


// Configurar EJS como motor de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'ejs'));

// Servir arquivos estáticos (CSS, imagens, etc.)
app.use(express.static(path.join(__dirname, 'ejs')));

//rota principal
const route = require('./routes/Routes')(io, loginLimiter);
app.use(route);

app.use('/api', express.static('public'));
app.use('/imgdefault', express.static('public'));

app.use('/api/files', express.static(path.resolve(__dirname, "public", "upload", "img")));
app.use('/api/files/mosaicos', express.static(path.resolve(__dirname, "public", "upload", "img", "mosaico")));
app.use('/api/files/2', express.static(path.resolve(__dirname, "public", "upload", "img", "promocao")));
app.use('/api/files/3', express.static(path.resolve(__dirname, "public", "cartaoDigital")));
app.use('/api/files/institucional', express.static(path.resolve(__dirname, "public", "upload", "img", "adminInstitucional")));
app.use('/api/files/og', express.static(path.resolve(__dirname, "public", "OG")));
app.use('/api/files/campanha', express.static(path.resolve(__dirname, "public", "upload", "campanha")));

const OLD_SERVER = 'https://minisitio.com.br';
const https = require('https');
const imageFolders = {
    '/api/files/descImagem/': 'descImagem',
    '/api/files/logoParceiro/': 'logoParceiro',
    '/api/files/mosaico/': 'mosaico',
};

Object.entries(imageFolders).forEach(([routePrefix, folder]) => {
    app.get(`${routePrefix}*`, (req, res) => {
        const filename = req.params[0];
        if (!filename || filename.includes('..')) return res.status(400).send('Invalid');
        const localPath = path.resolve(__dirname, 'public', 'upload', 'img', folder, filename);
        if (fs.existsSync(localPath)) {
            return res.sendFile(localPath);
        }
        const remoteUrl = `${OLD_SERVER}/api/files/${folder}/${encodeURIComponent(filename)}`;
        https.get(remoteUrl, (proxyRes) => {
            if (proxyRes.statusCode === 200) {
                res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/octet-stream');
                res.setHeader('Cache-Control', 'public, max-age=86400');
                proxyRes.pipe(res);
            } else {
                res.status(404).send('Not found');
            }
        }).on('error', () => {
            res.status(404).send('Not found');
        });
    });
});

// Servir frontend build para produção
const frontBuildPath = path.join(__dirname, '..', 'front', 'build');
app.use(express.static(frontBuildPath));

app.get('/api/files/2/download/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).send('Nome de arquivo inválido');
    }
    const filePath = path.resolve(__dirname, "public", "upload", "img", "promocao", filename);

    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('Erro ao forçar o download:', err);
            res.status(404).send('Arquivo não encontrado');
        }
    });
});


app.get('/outapi', (req, res) => {
    res.json({ status: 'ok' });
});

// WebSocket
/* io.on("connection", (socket) => {
    console.log("🔌 Cliente conectado.", socket.id);
    socket.on('start-download', async () => {
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(res => setTimeout(res, 500)); // Simula tempo
            socket.emit('download-progress', { progress: i });
        }
        socket.emit('download-complete');
    });



}); */

const ImportController = require('./controllers/ImportController');
const importCtrl = ImportController(io);
app.post('/api/admin/anuncio/import/:socketId', importCtrl.upload, importCtrl.importar);

const database = require('./config/db');
const Sequelize = require('sequelize');



cron.schedule('*/5 * * * *', () => {
    console.log('Deletando promoções expiradas...');
    deletarPromocoesExpiradas();
});

cron.schedule('0 5 * * *', () => {
    console.log('inativando campanhas expiradas...');
    inativarCampanhasExpiradas();
});

cron.schedule('0 3 * * *', () => {
    console.log('atualizando perfis expiradas...');
    downgradePerfil();
});

// Backup diário do banco às 2h da manhã
cron.schedule('0 2 * * *', () => {
    console.log('Iniciando backup do banco de dados...');
    try {
        const { execSync } = require('child_process');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filepath = `./backups/backup_${timestamp}.sql.gz`;
        execSync(`mkdir -p ./backups && mysqldump -h ${process.env.DB_HOST || 'db'} -P ${process.env.DB_PORT || 3306} -u ${process.env.DB_USER || 'root'} -p${process.env.DB_PASSWORD || 'root'} ${process.env.DB_NAME || 'minisitio_local'} | gzip > "${filepath}"`, { stdio: 'pipe' });
        console.log(`✓ Backup concluído: ${filepath}`);
    } catch (err) {
        console.error(`✗ Erro no backup: ${err.message}`);
    }
});



// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message, err.type || '', req.method, req.path);
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ success: false, message: 'Payload muito grande' });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'JSON inválido' });
    }
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).send('Not Found');
    }
    res.sendFile(path.join(frontBuildPath, 'index.html'));
});

async function seedAdmin() {
    try {
        const bcrypt = require('bcryptjs');
        const Usuario = require('./models/table_usuarios');
        
        const adminCnpj = process.env.ADMIN_CNPJ;
        const adminSenha = process.env.ADMIN_SENHA;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@sistema.com';
        
        if (!adminCnpj || !adminSenha) {
            console.log('SEED: Pulando seed admin (ADMIN_CNPJ/ADMIN_SENHA não definidos)');
            return;
        }
        
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(adminSenha, salt);
        const [user, created] = await Usuario.findOrCreate({
            where: { descCPFCNPJ: adminCnpj },
            defaults: {
                codTipoPessoa: 'J',
                descNome: 'Administrador',
                descEmail: adminEmail,
                senha: hash,
                codTipoUsuario: 1,
                codUf: '27',
                codCidade: '0',
                descTelefone: '',
                descRepresentanteConvenio: '',
                descEndereco: '',
                usuarioCod: '0',
                dtCadastro2: new Date().toISOString().split('T')[0],
                dtAlteracao: new Date().toISOString().split('T')[0],
                ativo: 1
            }
        });
        if (!created) {
            await user.update({ senha: hash, ativo: 1 });
        }
        console.log('SEED: Admin pronto');
    } catch (err) {
        console.error('SEED: Erro:', err.message);
    }
}

async function seedPin() {
    try {
        const database = require('./config/db');
        await database.query(`
            CREATE TABLE IF NOT EXISTS pin (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo VARCHAR(255) NOT NULL UNIQUE,
                validade TEXT NOT NULL
            )
        `);
        await database.query(`INSERT IGNORE INTO pin (codigo, validade) VALUES ('61984213444', '31/12/2030')`);
        console.log('SEED: PIN 61984213444 verificado/criado');
    } catch (err) {
        console.error('SEED PIN: Erro:', err.message);
    }
}

async function fixAutoIncrement() {
    try {
        const Atividade = require('./models/table_atividade');
        
        // sync({ alter: true }) faz o Sequelize comparar o modelo com a tabela real
        // e executar ALTER TABLE automaticamente para cada coluna que difere
        await Atividade.sync({ alter: true });
        console.log('FIX: Tabela atividade sincronizada com AUTO_INCREMENT');

    } catch (err) {
        console.error('FIX AUTO_INCREMENT atividade:', err.message);
        
        // Fallback: tentar via SQL direto
        try {
            const database = require('./config/db');
            await database.query(`ALTER TABLE atividade MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT`);
            console.log('FIX: AUTO_INCREMENT adicionado via SQL direto');
        } catch (e2) {
            console.error('FIX SQL fallback:', e2.message);
        }
    }
}

async function runCleanup() {
    return require('./migrations/runCleanup')();
}

server.listen(port, async () => {
    console.log("rodando na porta: ", port);
    await fixAutoIncrement();
    if (process.env.RUN_CLEANUP === 'true') {
        await runCleanup();
        console.log('CLEANUP finalizado. Remova a env var RUN_CLEANUP.');
    }
    await seedAdmin();
    await seedPin();
});
