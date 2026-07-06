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

    if (authToken != undefined) {

        const bearer = authToken.split(' ');
        let token = bearer[1];

        jwt.verify(token, secretKey, (err, data) => {
            if (err) {
                res.status(401);
                res.json({ success: false, message: "Token inválido" });
            } else {
                req.token = token;
                req.user = {
                    id: data.uuid || data.id,
                    role: data.role || null,
                    doc: data.doc || null
                };

                next();
            }
        });

    } else {
        res.status(401);
        res.json({ success: false, message: "Token Inválido" });
    }
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

module.exports = { auth, checkRole, ROLES };