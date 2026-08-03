const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_UPLOAD_DIRS = ['logoParceiro', 'logoCertificado', 'imgCertificado', 'logoCashBack', 'descImagem', 'promocao', 'adminInstitucional'];
const PREFIXED_UPLOAD_DIRS = new Set(ALLOWED_UPLOAD_DIRS);
const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpg', 'image/jpeg']);

function getValidCod(req) {
    const cod = req.query.cod;
    return cod && cod !== 'undefined' && cod !== 'null'
        ? String(cod).replace(/[^\w-]/g, '')
        : null;
}

function getUploadDir(local) {
    if (local && ALLOWED_UPLOAD_DIRS.includes(local)) {
        return path.join(__dirname, `../public/upload/img/${local}`);
    }

    return path.join(__dirname, '../public/upload/img/');
}

function getSafeFileName(req, file) {
    const ext = path.extname(file.originalname).toLowerCase();
    const local = req.query.local;

    if (PREFIXED_UPLOAD_DIRS.has(local)) {
        const cod = getValidCod(req) || 'new';
        return `${cod}_${Date.now()}${ext}`;
    }

    const parsed = path.parse(file.originalname);
    const baseName = parsed.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'image';

    return `${baseName}${ext}`;
}

module.exports = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = getUploadDir(req.query.local);
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, getSafeFileName(req, file));
        }
    }),
    fileFilter: (req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
            return cb(null, true);
        }

        return cb(new Error('Apenas imagens PNG ou JPG são permitidas.'), false);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
}));
