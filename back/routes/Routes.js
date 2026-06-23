const express = require('express');
const router = express.Router();
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
        //auth();
        //res.setHeader('Content-Type', 'application/json; charset=utf-8');
        console.log('Time: ', Date.now(), req.path);
        next();
    });

    router.get('/api/', BemVindo.bemvindo);



    //buscador
    router.post('/api/buscar', Buscador.busca);
    router.get('/api/cadernos', Buscador.buscarCaderno);
    router.get('/api/ufs', Buscador.buscarUf);
    router.post('/api/anuncios/:codCaderno', Buscador.buscaGeralCaderno);
    router.get('/api/atividade/:codAtividade', Buscador.buscaAtividade);
    router.get('/api/anuncio/:codAnuncio', Buscador.buscaAnuncio);
    router.get('/api/admin/usuario', Admin.listarUsuarios);

    //Login
    router.post('/api/entrar', loginLimiter, Login.login);
    router.post('/api/test-connection', auth, (req, res) => res.json({ success: true }));
    router.post('/api/is-auth', authVerification, Login.sessionVerification);

    //Admin
    router.post('/api/admin/usuario/create', auth, Users.create);
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
    router.get('/api/admin/desconto/aplicar/:id', auth, Admin.aplicarDesconto);
    router.get('/api/admin/desconto/read/all', auth, Admin.buscarAllId);
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
    router.get('/api/admin/anuncio/classificado/geral/:caderno/:uf', EspacosController.listarClassificadoGeral);
    router.get('/api/admin/anuncio/classificado/todos/:caderno/:uf', EspacosController.listarTodosClassificados);
    router.get('/api/admin/anuncio/classificado/geral2', EspacosController.listarClassificadoGeral2);
    router.get('/api/admin/anuncio/classificado/especifico/:caderno/:uf', EspacosController.listarClassificadoEspecifico);
    router.get('/api/admin/anuncio/quantidade/uf', auth, EspacosController.quantidadeUf);
    router.get('/api/admin/lista/test/:caderno/:uf', EspacosController.listaTeste);
    router.get('/api/admin/import/stage', EspacosController.importStage);
    router.get('/api/admin/import/stage/finalizar', EspacosController.finalizarImportStage);

    //DASHBOARD
    router.get('/api/admin/dashboard', auth, async (req, res) => {
        try {
            const [totalResult] = await database.query(
                `SELECT COUNT(*) as total FROM anuncio`,
                { type: database.QueryTypes.SELECT }
            );

            const [basicoResult] = await database.query(
                `SELECT COUNT(*) as total FROM anuncio WHERE codTipoAnuncio = '1'`,
                { type: database.QueryTypes.SELECT }
            );

            const [completoResult] = await database.query(
                `SELECT COUNT(*) as total FROM anuncio WHERE codTipoAnuncio = '3'`,
                { type: database.QueryTypes.SELECT }
            );

            const [ativosResult] = await database.query(
                `SELECT COUNT(*) as total FROM anuncio WHERE activate = 1`,
                { type: database.QueryTypes.SELECT }
            );

            const [inativosResult] = await database.query(
                `SELECT COUNT(*) as total FROM anuncio WHERE activate = 0`,
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

            res.json({
                success: true,
                data: {
                    total: totalResult.total,
                    basico: basicoResult.total,
                    completo: completoResult.total,
                    ativos: ativosResult.total,
                    inativos: inativosResult.total,
                    porUf,
                    porMes
                }
            });
        } catch (error) {
            console.error('Erro no dashboard:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar dados do dashboard' });
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
    router.get('/api/admin/preco-base/read', auth, Admin.listarValorBase);
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

        const anuncio = await Anuncio.findAll({
            where: {
                codAnuncio: req.body.id
            }
        });

        const filename = req.file ? req.file.filename : false

        const emailReturn = await faleComDono(req.body, anuncio.descEmailAutorizante, filename);
        //faleComDonoCliente(req.body);
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
        const url = req.headers.host;

        const anuncio = await Anuncio.findOne({
            where: { codAnuncio: req.params.id },
            raw: true,
            attributes: ['descImagem']
        });
        console.log(anuncio)

        const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>MINISITIO</title>
      <meta property="og:title" content="MINISITIO" />
       <meta property="og:description" content="&#128274; Link Seguro" />
      <meta property="og:image" content="https://minisitio.com.br/api/files/descImagem/${anuncio.descImagem}" />
      <meta property="og:image:width" content="300">
<meta property="og:image:height" content="300">
       <meta property="og:url" content="https://minisitio.com.br/api/portal/share/${req.params.id}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta http-equiv="refresh" content="0; url="https://minisitio.com.br/api/portal/share/${req.params.id}" />
    </head>
    <body>
      <p>Redirecionando para o conteúdo...</p>
      <script>
       fetch('https://minisitio.com.br/api/admin/anuncio/visualizacoes?id=${req.params.id}')
        .then((x) => x.json())
        .then((res) => {
            //console.log(res)
        })
        window.location.href = "https://minisitio.com.br/perfil/${req.params.id}"
      </script>
    </body>
    </html>
  `;

        res.send(html).status(200);
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


    return router;
};










