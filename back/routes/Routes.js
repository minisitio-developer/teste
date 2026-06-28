const express = require('express');
const multer = require('multer');
const path = require('path');

//Controllers
const BemVindo = require('../controllers/BemVindo');
const Buscador = require('../controllers/Buscador');
const Admin = require('../controllers/Admin');
const EspacosController = require('../controllers/admin/espacos/index.js');
const CampanhaController = require('../controllers/admin/campanha/index.js');
const Login = require('../controllers/Login');
const Rotinas = require('../controllers/Rotinas');
const Users = require('../controllers/Users');
const Upload = require('../controllers/Upload');
const UserActions = require('../controllers/UserActions');
const Email = require('../controllers/Email');
const WebHook = require('../controllers/WebHooks.js');
const InstConfig = require('../controllers/admin/institucional-config/controller.js');
const contatoConfig = require('../controllers/admin/contato-config/controller.js');

//FUNCTIONS
const saveImport = require('../functions/serverImport');
const { faleComDono, faleComDonoCliente } = require('../functions/sendMailer');

//MODELS
const Anuncio = require('../models/table_anuncio');

//middleware
const auth = require('../middlewares/authentication.js');
const authVerification = require('../middlewares/authVerification.js');



const uploadUser = require('../middlewares/uploadImage');
const uploadPdf = require('../middlewares/uploadPdf');
const RecuperarSenha = require('../controllers/RecuperarSenha.js');
const database = require('../config/db.js');



//module.exports = router;

module.exports = (io, loginLimiter) => {
    const router = express.Router();
    router.use(function timelog(req, res, next) {
        next();
    });

    router.get('/api/', BemVindo.bemvindo);



    //buscador
    router.post('/api/buscar', Buscador.busca);
    router.get('/api/cadernos', Buscador.buscarCaderno);
    router.get('/api/ufs', Buscador.buscarUf);
    router.get('/api/atividades', Buscador.buscarAtividades);
    router.post('/api/anuncios/:codCaderno', Buscador.buscaGeralCaderno);
    router.get('/api/atividade/:codAtividade', Buscador.buscaAtividade);
    router.get('/api/anuncio/:codAnuncio', Buscador.buscaAnuncio);
    router.get('/api/admin/usuario', auth, Admin.listarUsuarios);

    //Login
    router.post('/api/entrar', loginLimiter, Login.login);
    router.post('/api/test-connection', auth, (req, res) => res.json({ success: true }));
    router.post('/api/is-auth', authVerification, Login.sessionVerification);

    //Admin
    router.post('/api/admin/usuario/create', Users.create);
    router.post('/api/admin/usuario/update/:id', auth, Users.update);
    router.put('/api/admin/usuario/status/:id', auth, Users.updateStatus);
    router.get('/api/admin/usuario/edit/:id', auth, Users.buscarUsuario);
    router.delete('/api/admin/usuario/delete/:id', auth, Users.delete);
    router.get('/api/admin/usuario/buscar/:id', auth, Users.buscarUsuarioId);
    router.get('/api/portal/usuario/buscar/:id', Users.consultarUsuarioPortal);
    router.post('/api/admin/usuario/export', auth, Admin.exportUser);

    router.get('/api/admin/cadernos', auth, Admin.listarCadernos);
    router.get('/api/portal/cadernos', Admin.listarCadernosPortal);
    router.post('/api/admin/cadernos/count/perfis', auth, Admin.countPerfis);
    router.get('/api/admin/cadernos/buscar/', auth, Admin.buscarRegistroCaderno);
    router.post('/api/admin/cadernos/create', auth, Admin.criarCaderno);
    router.put('/api/admin/cadernos/update', auth, Admin.atualizarCadernos);
    router.delete('/api/admin/cadernos/delete/:id', auth, Admin.deleteCadernos);
    router.get('/api/admin/cadernos/edit/:id', auth, Admin.listarCadernoId);

    router.get('/api/admin/atividades/read', auth, Admin.listarAtividades);
    router.get('/api/admin/atividade', auth, Admin.listarAtividadesId);
    router.put('/api/admin/atividade/update', auth, Admin.atualizarAtividades);
    router.delete('/api/admin/atividade/delete/:id', auth, Admin.deleteAtividade);
    router.post('/api/admin/atividade/create', auth, Admin.criarAtividade);

    router.get('/api/admin/desconto/read', auth, Admin.listarIds);
    router.get('/api/admin/desconto/edit/:id', auth, Admin.listarUserId);
    router.put('/api/admin/desconto/update', auth, Admin.atualizarIds);
    router.put('/api/admin/desconto/status/:id', auth, Admin.updateUserStatus);
    router.post('/api/admin/desconto/create', auth, Admin.criarIds);
    router.delete('/api/admin/desconto/delete/:id', auth, Admin.deleteIds);
    router.get('/api/admin/desconto/buscar/:id', auth, Admin.buscarId);
    router.get('/api/admin/desconto/aplicar/:id', Admin.aplicarDesconto);
    router.get('/api/admin/desconto/read/all', Admin.buscarAllId);
    router.get('/api/admin/desconto/usuario/buscar/:id', auth, Admin.buscarUsuarioId);
    router.get('/api/admin/desconto/ddd/:id', auth, Admin.buscarDDD);
    router.post('/api/admin/desconto/export', auth, Admin.exportID);

    /* router.get('/admin/desconto/read', Admin.listarIds);
    router.get('/admin/desconto/edit/:id', Admin.listarUserId);
    router.put('/admin/desconto/update', auth, Admin.atualizarIds);
    //router.post('/admin/desconto/create', Admin.criarIds);
    router.delete('/admin/desconto/delete/:id', auth, Admin.deleteIds);
    router.get('/admin/desconto/buscar/:id', Admin.buscarId);
    router.get('/admin/desconto/ddd/:id', Admin.buscarDDD); */

    //ANUNCIOS
    router.get('/api/admin/espacos/read', auth, EspacosController.listarEspacos);
    router.get('/api/admin/anuncio/edit/:id', auth, EspacosController.listarAnuncioId);
    router.post('/api/admin/anuncio/create', auth, EspacosController.criarAnuncio);
    router.put('/api/admin/anuncio/status/:id', auth, EspacosController.updateAnuncioStatus);
    router.put('/api/admin/anuncio/moderacao/:id', auth, EspacosController.atualizarModeracao);
    router.delete('/api/admin/anuncio/delete/:id', auth, EspacosController.deleteAnuncio);
    router.put('/api/admin/anuncio/update', auth, EspacosController.atualizarAnuncio);
    router.put('/api/admin/anuncio/update/tipo', auth, EspacosController.atualizarTipoPerfil);
    router.get('/api/admin/anuncio/buscar', auth, EspacosController.buscarAnuncioId);
    router.get('/api/admin/anuncio/public', EspacosController.buscarAnuncioIdpublic);
    router.get('/api/admin/anuncio/visualizacoes', EspacosController.visualizacoes);
    router.post('/api/admin/anuncio/duplicate', auth, EspacosController.duplicar);
    router.get('/api/admin/anuncio/classificado/:caderno/:uf', EspacosController.listarClassificado);
    router.get('/api/buscar-profissionais', Buscador.buscarProfissionais);

    router.get('/api/admin/anuncio/classificado/geral/:caderno/:uf', EspacosController.listarClassificadoGeral);
    router.get('/api/admin/anuncio/classificado/todos/:caderno/:uf', EspacosController.listarTodosClassificados);
    router.get('/api/admin/anuncio/classificado/geral2', EspacosController.listarClassificadoGeral2);
    router.get('/api/admin/anuncio/classificado/especifico/:caderno/:uf', EspacosController.listarClassificadoEspecifico);
    router.get('/api/admin/anuncio/quantidade/uf', auth, EspacosController.quantidadeUf);
    router.get('/api/admin/lista/test/:caderno/:uf', EspacosController.listaTeste);
    router.get('/api/admin/import/stage', auth, EspacosController.importStage);
    router.get('/api/admin/import/stage/finalizar', auth, EspacosController.finalizarImportStage);

    //DASHBOARD - Leitura do cache (instantanea)
    router.get('/api/admin/dashboard', auth, async (req, res) => {
        try {
            let cache;
            try {
                const result = await database.query(
                    `SELECT * FROM dashboard_cache WHERE id = 1`,
                    { type: database.QueryTypes.SELECT }
                );
                cache = result[0];
            } catch (e) {
                cache = null;
            }

            if (!cache || !cache.lastUpdated) {
                return res.json({
                    success: true,
                    data: {
                        total: 0, basico: 0, completo: 0, ativos: 0, inativos: 0,
                        semEmail: null, semTelefone: null, semEmailETelefone: null,
                        expirados: 0, expiraEm30Dias: 0,
                        porUf: [], porMes: [], cadernosPorUf: [],
                        lastUpdated: null
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    total: cache.total,
                    basico: cache.basico,
                    completo: cache.completo,
                    ativos: cache.ativos,
                    inativos: cache.inativos,
                    semEmail: null,
                    semTelefone: null,
                    semEmailETelefone: null,
                    expirados: cache.expirados,
                    expiraEm30Dias: cache.expiraEm30Dias,
                    porUf: JSON.parse(cache.porUf_json || '[]'),
                    porMes: JSON.parse(cache.porMes_json || '[]'),
                    cadernosPorUf: JSON.parse(cache.cadernosPorUf_json || '[]'),
                    lastUpdated: cache.lastUpdated
                }
            });
        } catch (error) {
            console.error('Erro no dashboard:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar dados do dashboard' });
        }
    });

    //DASHBOARD - Atualizar cache (queries lentas)
    router.post('/api/admin/dashboard/refresh', auth, async (req, res) => {
        try {
            await database.query(
                `CREATE TABLE IF NOT EXISTS dashboard_cache (
                    id INT PRIMARY KEY DEFAULT 1,
                    total INT DEFAULT 0, basico INT DEFAULT 0, completo INT DEFAULT 0,
                    ativos INT DEFAULT 0, inativos INT DEFAULT 0,
                    expirados INT DEFAULT 0, expiraEm30Dias INT DEFAULT 0,
                    semEmail INT DEFAULT NULL, semTelefone INT DEFAULT NULL, semEmailETelefone INT DEFAULT NULL,
                    porUf_json LONGTEXT, porMes_json LONGTEXT, cadernosPorUf_json LONGTEXT,
                    contatos_json LONGTEXT, lastUpdated DATETIME,
                    UNIQUE KEY idx_dashboard_cache_id (id)
                )`
            );
            const [stats] = await database.query(
                `SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN codTipoAnuncio = '1' THEN 1 ELSE 0 END) as basico,
                    SUM(CASE WHEN codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo,
                    SUM(CASE WHEN activate = 1 THEN 1 ELSE 0 END) as ativos,
                    SUM(CASE WHEN activate = 0 THEN 1 ELSE 0 END) as inativos,
                    SUM(CASE WHEN activate = 1 AND dueDate IS NOT NULL AND dueDate < NOW() THEN 1 ELSE 0 END) as expirados,
                    SUM(CASE WHEN activate = 1 AND dueDate IS NOT NULL AND dueDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiraEm30Dias
                 FROM anuncio`,
                { type: database.QueryTypes.SELECT }
            );

            const porUf = await database.query(
                `SELECT codUf, COUNT(*) as total,
                 SUM(CASE WHEN codTipoAnuncio = '1' THEN 1 ELSE 0 END) as basico,
                 SUM(CASE WHEN codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo
                 FROM anuncio WHERE activate = 1
                 GROUP BY codUf ORDER BY total DESC`,
                { type: database.QueryTypes.SELECT }
            );

            const porMes = await database.query(
                `SELECT DATE_FORMAT(createdAt, '%Y-%m') as mes, COUNT(*) as total,
                 SUM(CASE WHEN codTipoAnuncio = '1' THEN 1 ELSE 0 END) as basico,
                 SUM(CASE WHEN codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo
                 FROM anuncio
                 WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                 GROUP BY mes ORDER BY mes ASC`,
                { type: database.QueryTypes.SELECT }
            );

            const cadernosPorUf = await database.query(`SELECT UF, COUNT(*) as total FROM caderno GROUP BY UF ORDER BY total DESC`, { type: database.QueryTypes.SELECT });

            const [contatos] = await database.query(
                `SELECT
                    SUM(CASE WHEN descEmailComercial IS NULL OR descEmailComercial = '' OR descEmailComercial = 'atualizar' OR descEmailComercial = '0' THEN 1 ELSE 0 END) as semEmail,
                    SUM(CASE WHEN descTelefone IS NULL OR descTelefone = '' OR descTelefone = 'atualizar' THEN 1 ELSE 0 END) as semTelefone,
                    SUM(CASE WHEN (descEmailComercial IS NULL OR descEmailComercial = '' OR descEmailComercial = 'atualizar' OR descEmailComercial = '0') AND (descTelefone IS NULL OR descTelefone = '' OR descTelefone = 'atualizar') THEN 1 ELSE 0 END) as semEmailETelefone
                 FROM anuncio WHERE activate = 1`,
                { type: database.QueryTypes.SELECT }
            );

            await database.query(
                `INSERT INTO dashboard_cache (id, total, basico, completo, ativos, inativos, expirados, expiraEm30Dias, semEmail, semTelefone, semEmailETelefone, porUf_json, porMes_json, cadernosPorUf_json, contatos_json, lastUpdated)
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE
                    total=VALUES(total), basico=VALUES(basico), completo=VALUES(completo),
                    ativos=VALUES(ativos), inativos=VALUES(inativos),
                    expirados=VALUES(expirados), expiraEm30Dias=VALUES(expiraEm30Dias),
                    semEmail=VALUES(semEmail), semTelefone=VALUES(semTelefone), semEmailETelefone=VALUES(semEmailETelefone),
                    porUf_json=VALUES(porUf_json), porMes_json=VALUES(porMes_json),
                    cadernosPorUf_json=VALUES(cadernosPorUf_json), contatos_json=VALUES(contatos_json), lastUpdated=NOW()`,
                {
                    replacements: [
                        stats.total, stats.basico, stats.completo, stats.ativos, stats.inativos,
                        stats.expirados, stats.expiraEm30Dias,
                        contatos.semEmail, contatos.semTelefone, contatos.semEmailETelefone,
                        JSON.stringify(porUf), JSON.stringify(porMes), JSON.stringify(cadernosPorUf), JSON.stringify(contatos)
                    ],
                    type: database.QueryTypes.INSERT
                }
            );

            res.json({ success: true, message: 'Cache atualizado', lastUpdated: new Date() });
        } catch (error) {
            console.error('Erro ao atualizar cache do dashboard:', error);
            res.status(500).json({ success: false, message: 'Erro ao atualizar cache' });
        }
    });

    //DASHBOARD - Atualizar cache de contatos (colunas TEXT - lento)
    router.post('/api/admin/dashboard/refresh-contatos', auth, async (req, res) => {
        try {
            const [contatos] = await database.query(
                `SELECT
                    SUM(CASE WHEN descEmailComercial IS NULL OR descEmailComercial = '' OR descEmailComercial = 'atualizar' OR descEmailComercial = '0' THEN 1 ELSE 0 END) as semEmail,
                    SUM(CASE WHEN descTelefone IS NULL OR descTelefone = '' OR descTelefone = 'atualizar' THEN 1 ELSE 0 END) as semTelefone,
                    SUM(CASE WHEN (descEmailComercial IS NULL OR descEmailComercial = '' OR descEmailComercial = 'atualizar' OR descEmailComercial = '0') AND (descTelefone IS NULL OR descTelefone = '' OR descTelefone = 'atualizar') THEN 1 ELSE 0 END) as semEmailETelefone
                 FROM anuncio WHERE activate = 1`,
                { type: database.QueryTypes.SELECT }
            );

            await database.query(
                `UPDATE dashboard_cache SET semEmail=?, semTelefone=?, semEmailETelefone=?, contatos_json=?, lastUpdated=NOW() WHERE id=1`,
                {
                    replacements: [
                        contatos.semEmail, contatos.semTelefone, contatos.semEmailETelefone,
                        JSON.stringify(contatos)
                    ],
                    type: database.QueryTypes.UPDATE
                }
            );

            res.json({ success: true, message: 'Cache de contatos atualizado', data: contatos });
        } catch (error) {
            console.error('Erro ao atualizar cache de contatos:', error);
            res.status(500).json({ success: false, message: 'Erro ao atualizar cache de contatos' });
        }
    });

    //DASHBOARD - Ler contatos do cache
    router.get('/api/admin/dashboard/contatos', auth, async (req, res) => {
        try {
            let cache;
            try {
                const result = await database.query(
                    `SELECT contatos_json FROM dashboard_cache WHERE id = 1`,
                    { type: database.QueryTypes.SELECT }
                );
                cache = result[0];
            } catch (e) {
                cache = null;
            }

            if (!cache || !cache.contatos_json) {
                return res.json({ success: true, data: { semEmail: null, semTelefone: null, semEmailETelefone: null } });
            }

            res.json({ success: true, data: JSON.parse(cache.contatos_json) });
        } catch (error) {
            console.error('Erro ao ler cache de contatos:', error);
            res.status(500).json({ success: false, message: 'Erro ao ler cache de contatos' });
        }
    });

    router.get('/api/admin/dashboard/capa', auth, async (req, res) => {
        try {
            const capaAtividades = [
                'ADMINISTRAÇÃO REGIONAL / PREFEITURA', 'EMERGÊNCIA', 'UTILIDADE PÚBLICA', 'HOSPITAIS PÚBLICOS',
                'CÂMARA DE VEREADORES - CÂMARA DISTRITAL', 'SECRETARIA DE TURISMO', 'INFORMAÇÕES', 'EVENTOS NA CIDADE'
            ];
            const placeholders = capaAtividades.map(() => '?').join(',');

            const [capaPairs, cadernos] = await Promise.all([
                database.query(
                    `SELECT DISTINCT codCaderno, codAtividade FROM anuncio WHERE activate = 1 AND codAtividade IN (${placeholders})`,
                    { replacements: capaAtividades, type: database.QueryTypes.SELECT }
                ),
                database.query(`SELECT codCaderno, nomeCaderno, UF FROM caderno`, { type: database.QueryTypes.SELECT })
            ]);

            const capaMap = {};
            for (const pair of capaPairs) {
                if (!capaMap[pair.codCaderno]) capaMap[pair.codCaderno] = new Set();
                capaMap[pair.codCaderno].add(pair.codAtividade);
            }

            const ufStats = {};
            let completa = 0, falta_1 = 0, falta_2 = 0, falta_3 = 0, falta_4 = 0, falta_5 = 0, falta_6 = 0, falta_7 = 0, sem_nenhuma = 0;
            let totalCadernos = 0;

            for (const c of cadernos) {
                totalCadernos++;
                const count = (capaMap[c.nomeCaderno] || new Set()).size;
                if (count === 8) completa++;
                else if (count === 7) falta_1++;
                else if (count === 6) falta_2++;
                else if (count === 5) falta_3++;
                else if (count === 4) falta_4++;
                else if (count === 3) falta_5++;
                else if (count === 2) falta_6++;
                else if (count === 1) falta_7++;
                else sem_nenhuma++;

                if (!ufStats[c.UF]) ufStats[c.UF] = { UF: c.UF, total_cadernos: 0, completa: 0, sem_nenhuma: 0 };
                ufStats[c.UF].total_cadernos++;
                if (count === 8) ufStats[c.UF].completa++;
                else if (count === 0) ufStats[c.UF].sem_nenhuma++;
            }

            res.json({
                success: true,
                data: {
                    capaGeral: {
                        total_cadernos: totalCadernos, completa, falta_1, falta_2, falta_3, falta_4, falta_5, falta_6, falta_7, sem_nenhuma
                    },
                    capaPorUf: Object.values(ufStats).sort((a, b) => b.total_cadernos - a.total_cadernos)
                }
            });
        } catch (error) {
            console.error('Erro no dashboard capa:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar dados da capa' });
        }
    });

    //CAMPANHA PROMOÇÃO
    router.get('/api/admin/campanha/promocao/:codAnuncio/:hash', CampanhaController.verificarPromocao);
    router.get('/api/admin/campanha/desconto/read', auth, Admin.CampanhalistarIds);
    router.post('/api/admin/campanha/create', auth, CampanhaController.gerarCampanha);
    router.get('/api/admin/campanha/read', auth, CampanhaController.listarCampanha);
    router.get('/api/admin/campanha/read/:hash', auth, CampanhaController.listarUserCampanha);
    router.delete('/api/admin/campanha/cancelar/:id', auth, CampanhaController.cancelarCampanha);
    router.get('/api/admin/campanha/verificar-arquivo/:id', auth, CampanhaController.verificarArquivoCampanha);
    
    router.put('/api/admin/campanha/:hash', auth, CampanhaController.dataAcesso);
    router.put('/api/admin/campanha/status-link/:id', auth, CampanhaController.ativarInativarLink);
    //router.post('/api/admin/anuncio/promocao/criar', Admin.criarPromocao);

    //ROTAS MODULO PAGAMENTOS
    router.get('/api/admin/pagamentos/read', auth, Admin.listarPagamentos);
    router.get('/api/admin/preco-base/read', Admin.listarValorBase);
    router.put('/api/admin/preco-base', auth, Admin.atualizarValorBase);

    //ROTAS MODULO PIN
    router.get('/api/admin/pin/read', auth, Admin.listarPin);
    router.post('/api/admin/pin/create', auth, Admin.criarPin);
    router.put('/api/admin/pin/update', auth, Admin.atualizarPin);
    router.delete('/api/admin/pin/delete/:id', auth, Admin.deletarPin);
    router.get('/api/admin/pin/edit/:id', auth, Admin.listarPinId);
    router.get('/api/portal/pin/', Admin.listarPinPortal);

    //ROTAS MODULO CALHAU
    router.get('/api/admin/calhau/read', auth, Admin.listarCalhau);
    router.post('/api/admin/calhau/create', auth, Admin.criarCalhau);
    router.delete('/api/admin/calhau/delete/:id', auth, Admin.deletarCalhau);

    //EXPORT OR IMPORT
    router.post('/api/admin/anuncio/export', auth, EspacosController.export4excell);
    router.post('/api/admin/export/:modulo', auth, Admin.exportPadrao);

    // Wrapper para passar o io
    function importWithSocket(req, res, next) {
        req.io = io; // injeta o io no req para o controller usar
        return Admin.import4excell(req, res, next);
    }

    // router.post('/api/admin/anuncio/import/:socketId', saveImport().single('uploadedfile'), importWithSocket);
    router.get('/api/admin/anuncio/progress', auth, Buscador.progressImport);

    //site
    router.post('/api/admin/usuario/criar-anuncio', Users.criarAnuncio);
    router.get('/api/pa', Users.qtdaAnuncio);
    router.post('/api/upload-image', auth, uploadUser.single('image'), Upload.uploadImg);
    router.post('/api/upload-pdf', auth, uploadPdf.single('file'), Upload.uploadPdf);
    router.get('/api/list-image', auth, Upload.listFiles);

    //ACÕES DO USUARIO
    router.get('/api/cartao-digital', UserActions.cartaoDigital);
    //router.get('/api/cartao-digital', UserActions.cartaoDigital);

    //EMAILS
    router.post('/api/contato', Email.contato);
    router.get('/api/caderno/legenda/:uf/:caderno', Admin.cadernoLegenda);
    router.put('/api/caderno/legenda/:uf/:caderno', auth, Admin.cadernoLegendaUpdate);


    //EMAIL FALE COM O DONO
    // Configuração do multer para armazenar o arquivo em uma pasta local
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../public/upload/anexoEmail/')); // Pasta onde os arquivos serão salvos
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname)); // Nome único para cada arquivo
        }
    });

    const upload = multer({ storage });

    router.post('/api/fale-com-dono', upload.single('anexo'), async (req, res) => {
        console.log(req.body);

        if (req.body.email == '') {
            res.json({ success: false, message: "email não enviado" });
            return;
        }

        const anuncio = await Anuncio.findOne({
            where: {
                codAnuncio: req.body.id
            }
        });

        const filename = req.file ? req.file.filename : false

        const emailReturn = await faleComDono(req.body, anuncio ? anuncio.descEmailAutorizante : null, filename);
        if (anuncio && anuncio.descEmailAutorizante) {
            await faleComDonoCliente(req.body, anuncio.descNomeAutorizante);
        }
        if (emailReturn) {
            res.json({ success: true, message: "email enviado" });
        } else {
            res.json({ success: false, message: "email não enviado" });
        }
    });


    //ROTINAS
    router.get('/api/rotina/repaginar', Rotinas.paginacaoDosCadernos);

    //WEBHOOKS
    router.post('/api/webhook', WebHook.atualizarPagamentos);
    router.get('/api/pagamento/create/:id/:codDesconto', WebHook.criarPagamento);
    router.get('/api/pagamento/create/:id', WebHook.criarPagamento);


    //PORTAL
    router.get('/api/read/promocao/:caderno/:uf', Buscador.buscarPromocoes);

    //PORTAL COMPARTILHAMENTO
    router.get('/api/portal/share/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).send('ID inválido');
            }

            const anuncio = await Anuncio.findOne({
                where: { codAnuncio: id },
                raw: true,
                attributes: ['descImagem']
            });

            const escapeHtml = (str) => {
                if (!str) return '';
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            };

            const baseUrl = 'https://minisitio.com.br';
            const shareUrl = `${baseUrl}/api/portal/share/${id}`;
            const perfilUrl = `${baseUrl}/perfil/${id}`;
            const imagemUrl = anuncio?.descImagem ? `${baseUrl}/api/files/descImagem/${encodeURIComponent(anuncio.descImagem)}` : '';
            const vizUrl = `${baseUrl}/api/admin/anuncio/visualizacoes?id=${id}`;

            const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>MINISITIO</title>
      <meta property="og:title" content="MINISITIO" />
      <meta property="og:description" content="&#128274; Link Seguro" />
      ${imagemUrl ? `<meta property="og:image" content="${escapeHtml(imagemUrl)}" />` : ''}
      <meta property="og:image:width" content="300">
      <meta property="og:image:height" content="300">
      <meta property="og:url" content="${escapeHtml(shareUrl)}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta http-equiv="refresh" content="0; url=${escapeHtml(perfilUrl)}" />
    </head>
    <body>
      <p>Redirecionando para o conteúdo...</p>
      <script>
        fetch('${escapeHtml(vizUrl)}')
          .then((x) => x.json())
          .catch(() => {});
        window.location.href = "${escapeHtml(perfilUrl)}";
      </script>
    </body>
    </html>
  `;

            res.status(200).send(html);
        } catch (error) {
            console.error('Erro no share:', error);
            res.status(500).send('Erro interno');
        }
    });

    //SITE INSTITUCIONAL
    router.post('/api/admin/institucional/config', auth, InstConfig.atualizarRegistro);
    router.get('/api/admin/institucional/read', InstConfig.lerRegistro);

    //SITE CONTATO
    router.post('/api/admin/contato/config', auth, contatoConfig.atualizarContato);
    router.get('/api/admin/contato/read', auth, contatoConfig.lerContato);

    //RECUPERAÇÃO DE SENHAS
    router.post('/api/forgot-password', RecuperarSenha.forgotPassword);
    router.post('/api/reset-password', RecuperarSenha.resetPassword);

    //ROTA ENCURTADA: /:id -> /perfil/:id
    router.get('/:id(\\d+)', (req, res) => {
        res.redirect(301, `/perfil/${req.params.id}`);
    });

    router.get('/start-download/:socketId', async (req, res) => {
        const socketId = req.params.socketId;

        for (let i = 0; i <= 100; i++) {
            await new Promise(r => setTimeout(r, 500));

            const progress = Math.round((i / 100) * 100);

            console.log(progress)
            io.to(socketId).emit('download-progress', { progress });
        }

        io.to(socketId).emit('download-complete');
        res.send('Download concluído, eventos enviados!');
    });

    // TEMPORARIO - REMOVIDO (deploy limpo - item #70)

    return router;
};






