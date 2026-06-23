require('dotenv').config();

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
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000',      // Desenvolvimento local
        'http://localhost:3001',      // Alternativa desenvolvimento
        'https://meufrontend.com',
        'https://admin.meufrontend.com',
        'https://www.meufrontend.com'
    ];

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
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requisições
    message: 'Muitas requisições, tente novamente mais tarde'
});

app.use(limiter);
app.use(helmet());

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
    console.log(req)
    res.json({})
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

const saveImport = require('./functions/serverImport');
const csv = require('csv-parser');
const Atividade = require('./models/table_atividade');
const Usuarios = require('./models/table_usuarios');
const Descontos = require('./models/table_desconto');
//const Anuncio = require('./models/table_anuncio');
const ImportStage = require('./models/table_importStage');
const Caderno = require('./models/table_caderno');
const database = require('./config/db');
const Sequelize = require('sequelize');
const Globals = require('./models/table_globals');
const { Op } = Sequelize;

app.post('/api/admin/anuncio/import/:socketId', saveImport().single('uploadedfile'), async (req, res) => {
    //res.json({ success: true, message: "Importação" });


    // const io = req.io;
    const socketId = req.params.socketId;
    const readline = require('readline');

    console.log("🔌 Cliente conectado.", socketId);


    const filePath = path.join(__dirname, './public/importLog.json');
    const arquivoImportado = path.join(__dirname, './public/import/uploadedfile.csv');
    const DELAY_MS = 1000; // Delay configurável entre linhas
    let qtdaBasico = 0;
    let qtdaCompleto = 0;
    let dataObjGeral;



    const fileStream = fs.createReadStream(arquivoImportado);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let total = 0;

    for await (const line of rl) {
        if (line.trim() !== '') total++; // ignora linhas vazias
    }

    const totalLinhasCsv = total - 1;


    const salvarQtdaImportacao = await Globals.update({
        value: totalLinhasCsv
    }, {
        where: {
            keyValue: "total_importacao"
        }
    })

    /*            const consultarRegistros = await Globals.findAll({
                where: {
                    keyValue: "total_usuarios"
                },
                raw: true
            }) */



    async function importarPerfis() {
        let totalLinhas = 0;

        function updateJsonName(filePath, endProccess, progress) {
            try {
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();

                const jsonData = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(jsonData);

                data.progress = progress;
                data.fim = `${hours}:${minutes}:${seconds}`;
                data.endProccess = endProccess;

                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                console.log(`Progresso atualizado para: ${progress}`);
            } catch (error) {
                console.error('Erro ao atualizar progresso:', error);
            }
        }

        async function processRow(row, index) {
            /*      console.log(`Processando linha ${index}:`, totalAtual.count);
                 return; */
            try {
                if (index === 1) updateJsonName(filePath, false, 0);

                const idImport = row['idImport'];
                const codTipoAnuncio = row['TIPO'];
                const idDesconto = row['ID'];
                const nomeAnuncio = row['NOME'];
                const telefone = row['TELEFONE'];
                const cep = row['CEP'];
                const estado = row['UF'];
                const cidade = row['CIDADE'];
                let tipoAtividade = row['ATIVIDADE_PRINCIPAL_CNAE'];
                const nuDocumento = row['CNPJ_CPF'];
                const autorizante = row['AUTORIZANTE'];
                const email = row['EMAIL'];
                const senha = 12345;

                console.log(tipoAtividade)

                const verificarAtividadeExists = await Atividade.findOne({
                    where: { atividade: tipoAtividade }
                });

                if (!verificarAtividadeExists) {
                    tipoAtividade = "Compras e Serviços";
                }
                console.log("very", tipoAtividade)

                const verificarUserExists = await Usuarios.findOne({
                    where: { descCPFCNPJ: nuDocumento }
                });

                let codUser;
                if (verificarUserExists) {
                    codUser = verificarUserExists.dataValues.codUsuario;
                } else {
                    const dadosUsuario = {
                        codTipoPessoa: "pf",
                        descCPFCNPJ: nuDocumento,
                        descNome: nomeAnuncio || `import${index}`,
                        descEmail: email || "atualizar",
                        descEndereco: "atualizar",
                        senha,
                        hashCode: "0",
                        codTipoUsuario: 3,
                        descTelefone: telefone || "atualizar",
                        codUf: estado,
                        codCidade: cidade,
                        dtCadastro: dataNow(),
                        usuarioCod: 0,
                        dtCadastro2: dataNow(),
                        dtAlteracao: dataNow(),
                        ativo: "1"
                    };
                    const novoUsuario = await Usuarios.create(dadosUsuario);
                    codUser = novoUsuario.dataValues.codUsuario;
                }

                let codigoDeDesconto = await Descontos.findOne({ where: { hash: idDesconto } });

                const dataObj = {
                    codUsuario: codUser,
                    idImport: idImport,
                    codTipoAnuncio,
                    codAtividade: tipoAtividade,
                    codCaderno: cidade,
                    codUf: estado,
                    codCidade: cidade,
                    descAnuncio: nomeAnuncio || `import${index}`,
                    descImagem: 0,
                    descEndereco: "atualizar",
                    descTelefone: telefone || "atualizar",
                    descCelular: 0,
                    descEmailComercial: 0,
                    descEmailRetorno: email,
                    descWhatsApp: 0,
                    descCEP: cep,
                    descTipoPessoa: "pf",
                    descCPFCNPJ: nuDocumento,
                    descNomeAutorizante: autorizante || `import${index}`,
                    descEmailAutorizante: 0,
                    codDesconto: codigoDeDesconto ? codigoDeDesconto.hash : '00.000.0000',
                    descChavePix: 'chavePix',
                    qntVisualizacoes: 0,
                    codDuplicado: 0,
                    descPromocao: 0,
                    activate: 1,
                };

                dataObjGeral = dataObj;

                if (dataObj.codTipoAnuncio === 1) {
                    qtdaBasico += 1
                }

                if (dataObj.codTipoAnuncio === 3) {
                    qtdaCompleto += 1
                }

                await ImportStage.create(dataObj);
                updateJsonName(filePath, false, index);
                console.log(`Linha ${index} importada com sucesso.`);

                const progress = Math.round((index / totalLinhasCsv) * 100);

                //console.log("progredindo", progress, index, totalLinhasCsv)
                io.to(socketId).emit('download-progress', { progress });


            } catch (error) {
                console.error(`Erro ao importar linha ${index}:`, error);
            }
        }

        function dataNow() {
            const dataAtual = new Date();
            const ano = dataAtual.getFullYear();
            const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const dia = String(dataAtual.getDate()).padStart(2, '0');
            const hora = String(dataAtual.getHours()).padStart(2, '0');
            const minutos = String(dataAtual.getMinutes()).padStart(2, '0');
            const segundos = String(dataAtual.getSeconds()).padStart(2, '0');
            return `${ano}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
        }

        async function processFile() {
            console.log("Iniciando leitura do arquivo...");
            let index = 1;
            const stream = fs.createReadStream(arquivoImportado).pipe(csv({
                separator: ';',
                quote: '"',
            }));

            for await (const row of stream) {


                let codigoDeDesconto = await Descontos.findOne({ where: { hash: row["ID"] } });

                if (!codigoDeDesconto) {
                    console.log(`Processando linha ${row['ID']}:`);
                    return res.status(404).json({ success: false, message: "O codigo de ID não foi encontrado. Por favor insira um ID válido no arquivo ou gere um novo ID e tente novamente." });
                }
                await processRow(row, index);
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
                index++;
            }

            console.log("Arquivo lido com sucesso!");
            res.json({ success: true, message: "Importação" });
            updateJsonName(filePath, false, index - 1);
            // Zera o arquivo importLog.json após a última iteração
            const logInicial = {
                progress: 0,
                //fim: "",
                endProccess: true
            };
            fs.writeFileSync(filePath, JSON.stringify(logInicial, null, 2), 'utf8');



            try {

                const cadernos = await Caderno.findOne({
                    where: {
                        UF: dataObjGeral.codUf,
                        nomeCaderno: dataObjGeral.codCaderno
                    },
                    attributes: ['codCaderno', 'basico', 'completo', 'total']
                });


                if (dataObjGeral.codTipoAnuncio == 1) {
                    cadernos.basico = cadernos.basico + qtdaBasico;
                    cadernos.total = cadernos.total + (qtdaBasico + qtdaCompleto);

                    await cadernos.save();
                }

                if (dataObjGeral.codTipoAnuncio == 3) {
                    cadernos.completo = cadernos.completo + qtdaCompleto;
                    cadernos.total = cadernos.total + (qtdaBasico + qtdaCompleto);

                    await cadernos.save();
                }

                io.to(socketId).emit('download-complete');

                const query = `UPDATE importStage
                        JOIN (
                            SELECT codAnuncio, 
                                CEIL(ROW_NUMBER() OVER (ORDER BY codAtividade ASC, createdAt DESC) / 10) AS 'page_number'
                            FROM importStage
                            WHERE codUf = :estado AND codCaderno = :caderno
                        ) AS temp
                        ON importStage.codAnuncio = temp.codAnuncio
                        SET importStage.page = temp.page_number
                        WHERE importStage.codUf = :estado AND importStage.codCaderno = :caderno
                    `;

                /*        const query = `UPDATE anuncio
                         JOIN (
                             SELECT codAnuncio, 
                                 CEIL(ROW_NUMBER() OVER (ORDER BY codAtividade ASC, createdAt DESC) / 10) AS 'page_number'
                             FROM anuncio
                             WHERE codUf = :estado AND codCaderno = :caderno
                         ) AS temp
                         ON anuncio.codAnuncio = temp.codAnuncio
                         SET anuncio.page = temp.page_number
                         WHERE anuncio.codUf = :estado AND anuncio.codCaderno = :caderno
                     `; */

                database.query(query, {
                    replacements: { estado: dataObjGeral.codUf, caderno: dataObjGeral.codCaderno },
                    type: Sequelize.QueryTypes.UPDATE,
                });

                console.log(`Reorganização concluída para o estado:`, dataObjGeral.codUf);
                /* 
                                const zerarGlobalsTotalImport = await Globals.update({
                                    value: 0
                                }, {
                                    where: {
                                        keyValue: "total_importacao"
                                    }
                                }) */

            } catch (error) {
                console.error("Erro ao executar a reorganização:", error);
            }

        }

        await processFile();
    }

    // Para rodar a importação, basta chamar:
    try {
        importarPerfis();
    } catch (err) {
        console.error("Erro ao importar perfis:", err);
    }


});

function reorganizarAnuncios(codUf, codCaderno) {

    try {
        const query = `UPDATE anuncio
                            JOIN (
                                SELECT codAnuncio, 
                                    CEIL(ROW_NUMBER() OVER (ORDER BY codAtividade ASC, createdAt DESC) / 10) AS 'page_number'
                                FROM anuncio
                                WHERE codUf = :estado AND codCaderno = :caderno
                            ) AS temp
                            ON anuncio.codAnuncio = temp.codAnuncio
                            SET anuncio.page = temp.page_number
                            WHERE anuncio.codUf = :estado AND anuncio.codCaderno = :caderno
                        `;

        database.query(query, {
            replacements: { estado: codUf, caderno: codCaderno },
            type: Sequelize.QueryTypes.UPDATE,
        });

        console.log(`Reorganização concluída para o estado:`, codUf);
    } catch (error) {
        console.error("Erro ao executar a reorganização:", error);
    }
}

//reorganizarAnuncios("DF", "SUDOESTE - OCTOGONAL")



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
    console.error('Unhandled error:', err.message);
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ success: false, message: 'Payload muito grande' });
    }
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).send('Not Found');
    }
    res.sendFile(path.join(frontBuildPath, 'index.html'));
});

server.listen(port, () => {
    console.log("rodando na porta: ", port);
});
