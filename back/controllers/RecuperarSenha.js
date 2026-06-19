const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/table_usuarios');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const { forgotPasswordEmail } = require('../functions/sendMailer');

module.exports = {
    forgotPassword: async (req, res) => {
        const { email } = req.body;

        if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
            return res.status(400).json({ message: 'E-mail inválido.' });
        }

        const user = await Usuario.findAll({ where: { descEmail: email } });

        if (!user || user.length === 0)
            return res.status(404).json({ message: 'E-mail não encontrado.' });

        // Gera token seguro
        const token = crypto.randomBytes(32).toString('hex');
        const expiration = new Date(Date.now() + 3600000); // 1 hora

        await Usuario.update(
            {
                resetToken: token,
                resetTokenExpires: expiration
            },
            { where: { descEmail: email } }
        );

        const resetLink = `https://minitest.automaplay.com.br/reset-password?token=${token}`;

        const emailRecuperacao = await forgotPasswordEmail(user[0].descEmail, resetLink);

        res.json({ success: true, messagem: "enviado" });
    },
    resetPassword: async (req, res) => {
        const { token, password } = req.body;

        if (!token || typeof token !== 'string' || token.length !== 64) {
            return res.status(400).json({ message: 'Token inválido.' });
        }

        if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
            return res.status(400).json({ message: 'A senha deve ter entre 8 e 128 caracteres.' });
        }

        try {
            const user = await Usuario.findOne({
                where: {
                    resetToken: token,
                    resetTokenExpires: {
                        [Op.gt]: new Date()
                    }
                },
                attributes: ['codUsuario', 'descEmail', 'senha', 'resetToken', 'resetTokenExpires']
            });

            if (!user) {
                return res.status(400).json({ message: 'Token inválido ou expirado.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await Usuario.update({
                senha: hashedPassword,
                resetToken: null,
                resetTokenExpires: null
            },
                { where: { descEmail: user.descEmail } }
            );

            res.status(200).json({ success: true, message: 'Senha atualizada com sucesso.' });

        } catch (err) {
            console.error('Erro ao redefinir senha');
            res.status(500).json({ message: 'Erro ao redefinir senha.' });
        }
    }
}