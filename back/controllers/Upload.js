const Anuncio = require('../models/table_anuncio');
const path = require('path');
const fs = require('node:fs/promises');

module.exports = {
    uploadImg: async (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                erro: true,
                mensagem: 'Erro: upload não realizado. Envie uma imagem PNG ou JPG.'
            });
        }

        if (req.query.cod && (!req.query.local || req.query.local === 'descImagem')) {
            try {
                await Anuncio.update({
                    descImagem: req.file.filename
                }, {
                    where: {
                        codAnuncio: req.query.cod
                    }
                });
            } catch (err) {
                console.error('Erro ao salvar descImagem no banco:', err.message);
            }
        }

        return res.json({
            success: true,
            erro: false,
            fileName: req.file.filename,
            mensagem: 'Upload realizado com sucesso!'
        });
    },

    uploadPdf: async (req, res) => {
        const caminho = req.query.id
            ? path.join(__dirname, '../public/cartaoDigital/' + req.query.id)
            : null;

        if (caminho) {
            try {
                await fs.unlink(caminho);
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error(`Erro ao apagar o arquivo "${caminho}":`, err);
                }
            }
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                erro: true,
                mensagem: 'Erro: upload não realizado. Envie um PDF.'
            });
        }

        return res.json({
            success: true,
            erro: false,
            mensagem: 'Upload realizado com sucesso!',
            name: req.savedFileName
        });
    },

    listFiles: async (req, res) => {
        res.send('ok');
    }
};
