const key = require('../config/config.js');
const jwt = require('jsonwebtoken');

const ROLES = {
    ADMIN: 1,
    MASTER: 2,
    ANUNCIANTE: 3,
    ANUNCIANTE_5: 5
};

function auth(req, res, next) {
  const secretKey = key.apiSecret;
    const authToken = req.headers['authorization'];

    if (!authToken) {
        res.setHeader('WWW-Authenticate', 'Bearer');
        return res.status(401).json({ success: false, message: "Token não fornecido" });
    }

    const bearer = authToken.split(' ');
    if (bearer.length !== 2 || bearer[0] !== 'Bearer') {
        return res.status(401).json({ success: false, message: "Formato de token inválido" });
    }
    const token = bearer[1];

    jwt.verify(token, secretKey, (err, data) => {
        if (err) {
            console.warn('Falha na verificação JWT:', err.name);
            res.setHeader('WWW-Authenticate', 'Bearer');
            return res.status(401).json({ success: false, message: "Token inválido ou expirado" });
        }
        req.user = {
            id: data.uuid || data.id,
            role: data.role || null,
        };
        next();
    });

};

function checkRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ success: false, message: "Acesso negado" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Permissão insuficiente" });
        }
        next();
    };
};

module.exports = auth;
module.exports.checkRole = checkRole;
module.exports.ROLES = ROLES;