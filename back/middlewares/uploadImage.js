const multer = require('multer');
const path = require('path');

const ALLOWED_UPLOAD_DIRS = ['logoParceiro', 'logoCertificado', 'imgCertificado', 'logoCashBack', 'descImagem', 'promocao', 'adminInstitucional'];

function getValidCod(req) {
    return req.query.cod && req.query.cod !== 'undefined' && req.query.cod !== 'null'
        ? req.query.cod
        : null;
}

module.exports = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (req.query.local && ALLOWED_UPLOAD_DIRS.includes(req.query.local)) {
                cb(null, path.join(__dirname, `../public/upload/img/${req.query.local}`));
            } else {
                cb(null, path.join(__dirname, '../public/upload/img/'));
            }
        },
        filename: (req, file, cb) => {
            //cb(null, Date.now().toString() + "_" + file.originalname) 


            if (req.query.local == 'logoParceiro') {
                const cod = getValidCod(req);
                if (cod) {
                    cb(null, cod + "_" + Date.now().toString() + path.extname(file.originalname));
                } else {
                    cb(null, "new_" + Date.now().toString() + path.extname(file.originalname));
                }

            } else if (req.query.local == "logoCertificado") {
                const cod = getValidCod(req);
                if (cod) {
                    cb(null, cod + "_" + Date.now().toString() + path.extname(file.originalname));
                } else {
                    cb(null, "new_" + Date.now().toString() + path.extname(file.originalname));
                }
            } else if (req.query.local == "imgCertificado") {
                const cod = getValidCod(req);
                if (cod) {
                    cb(null, cod + "_" + Date.now().toString() + path.extname(file.originalname));
                } else {
                    cb(null, "new_" + Date.now().toString() + path.extname(file.originalname));
                }
            } else if (req.query.local == "logoCashBack") {
                const cod = getValidCod(req);
                if (cod) {
                    cb(null, cod + "_" + Date.now().toString() + path.extname(file.originalname));
                } else {
                    cb(null, "new_" + Date.now().toString() + path.extname(file.originalname));
                }
            } else if (req.query.local == "descImagem") {
                const cod = getValidCod(req);
                if (cod) {
                    cb(null, cod + "_" + Date.now().toString() + path.extname(file.originalname));
                } else {
                    cb(null, "new_" + Date.now().toString() + path.extname(file.originalname));
                }
            } else if (req.query.local == "promocao") {
                const cod = getValidCod(req);
                if (cod) {
                    cb(null, cod + "_" + Date.now().toString() + path.extname(file.originalname));
                } else {
                    cb(null, "new_" + Date.now().toString() + path.extname(file.originalname));
                }
            } else if (req.query.local == "adminInstitucional") {
                const cod = getValidCod(req);
                if (cod) {
                    cb(null, cod + "_" + Date.now().toString() + path.extname(file.originalname));
                } else {
                    cb(null, "new_" + Date.now().toString() + path.extname(file.originalname));
                }
            } else {
                cb(null, file.originalname);
            }
            //cb(null, file.originalname) 


        }
    }),
    fileFilter: (req, file, cb) => {
        const extensaoImg = ['image/png', 'image/jpg', 'image/jpeg'].find(formatoAceito => formatoAceito == file.mimetype);

        if (extensaoImg) {
            return cb(null, true);
        }

        return cb(null, false);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
}));
