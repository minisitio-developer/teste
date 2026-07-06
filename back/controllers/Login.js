const key = require('../config/config.js');
const secretKey = key.apiSecret;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { identifyDocument } = require('../validations');

const Usuarios = require('../models/table_usuarios');

module.exports = {
    login: async (req, res) => {
        // await database.sync(); // REMOVED: sync should not run per-request

        const { descCPFCNPJ, senha } = req.body;

        if (!descCPFCNPJ || !senha) {
            return res.status(400).json({ success: false, message: "CPF/CNPJ e senha são obrigatórios" });
        }

        if (typeof descCPFCNPJ !== 'string' || descCPFCNPJ.length > 20) {
            return res.status(400).json({ success: false, message: "CPF/CNPJ inválido" });
        }

        const docType = identifyDocument(descCPFCNPJ);
        if (docType === 'Invalid') {
            return res.status(400).json({ success: false, message: "CPF/CNPJ com formato inválido" });
        }

        if (typeof senha !== 'string' || senha.length > 128) {
            return res.status(400).json({ success: false, message: "Senha inválida" });
        }

        const user = await Usuarios.findOne({
            where: {
                descCPFCNPJ: descCPFCNPJ
            },
            raw: true,
            attributes: ['codUsuario', 'descNome', 'descCPFCNPJ', 'senha', 'codTipoUsuario', 'ativo']
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Credenciais inválidas" });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ success: false, message: "Credenciais inválidas" });
        }

        const token = jwt.sign({ id: user.id, role: user.codTipoUsuario, uuid: user.codUsuario, doc: user.descCPFCNPJ }, secretKey, { expiresIn: "1h" });

        res.cookie('userTokenAccess', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1h
        });

        const { senha: _, ...safeUser } = user;
        safeUser.success = true;

        if (user.ativo && user.codTipoUsuario == 1) {
            res.json({ success: true, message: "Usuario encontrado", data: safeUser, type: 1, accessToken: token })
        } else if (user.ativo && user.codTipoUsuario == 2) {
            res.json({ success: true, message: "Não é possível entrar com acesso MASTER", data: safeUser, type: 2, accessToken: token })
        } else if (user.ativo && user.codTipoUsuario == 3) {
            res.json({ success: true, message: "Não é possível entrar com acesso ANUNCIANTE", data: safeUser, type: 3, accessToken: token })
        } else if (user.ativo && user.codTipoUsuario == 5) {
            res.json({ success: true, message: "Não é possível entrar com acesso ANUNCIANTE", data: safeUser, type: 5, accessToken: token })
        } else {
            res.json({ success: false, message: "O usuário não está ativo, por favor fale com o suporte." })
        }

    },
    sessionVerification: async (req, res) => {
        const user = await Usuarios.findOne({
            where: {
                codUsuario: req.userId
            },
            raw: true,
            attributes: ['codUsuario', 'descNome', 'descCPFCNPJ', 'codTipoUsuario', 'ativo']
        });

         res.json({success: true, data: user})
    },
}

