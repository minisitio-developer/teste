const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, 'back', 'routes', 'Routes.js');
let content = fs.readFileSync(routesPath, 'utf8');

// Insert redis client
const redisImport = "const redisClient = require('../config/redis.js');";
if (!content.includes(redisImport)) {
    content = content.replace("const database = require('../config/db.js');", "const database = require('../config/db.js');\n" + redisImport);
}

// ===== GET /api/admin/dashboard =====
const getDashboardStart = "router.get('/api/admin/dashboard', auth, async (req, res) => {";
const getDashboardEnd = "    //DASHBOARD - Atualizar cache (queries lentas)";
const getDashboardOldIdx = content.indexOf(getDashboardStart);
const getDashboardEndIdx = content.indexOf(getDashboardEnd);
if (getDashboardOldIdx >= 0 && getDashboardEndIdx > getDashboardOldIdx) {
    const getDashboardNew = `router.get('/api/admin/dashboard', auth, async (req, res) => {
        try {
            if (redisClient.isReady) {
                const redisData = await redisClient.get('dashboard_cache');
                if (redisData) {
                    return res.json({ success: true, data: JSON.parse(redisData) });
                }
            }
            
            // Fallback para MySQL
            let cache;
            try {
                try { await database.query(\`ALTER TABLE dashboard_cache ADD COLUMN porAtividade_json LONGTEXT\`); } catch (e) { }
                try { await database.query(\`ALTER TABLE dashboard_cache ADD COLUMN porId_json LONGTEXT\`); } catch (e) { }
                const result = await database.query(
                    \`SELECT * FROM dashboard_cache WHERE id = 1\`,
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
                        total: 0, basico: 0, completo: 0, capa: 0, ativos: 0, inativos: 0,
                        semEmail: null, semTelefone: null, semEmailETelefone: null,
                        expirados: 0, expiraEm30Dias: 0,
                        porUf: [], porMes: [], cadernosPorUf: [], porAtividade: [], porId: [],
                        lastUpdated: null
                    }
                });
            }

            const dataToReturn = {
                total: cache.total,
                basico: cache.basico,
                completo: cache.completo,
                capa: cache.capa || 0,
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
                porAtividade: JSON.parse(cache.porAtividade_json || '[]'),
                porId: JSON.parse(cache.porId_json || '[]'),
                lastUpdated: cache.lastUpdated
            };
            
            if (redisClient.isReady) {
                await redisClient.set('dashboard_cache', JSON.stringify(dataToReturn), { EX: 3600 });
            }

            res.json({ success: true, data: dataToReturn });
        } catch (error) {
            console.error('Erro no dashboard:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar dados do dashboard' });
        }
    });

`;

    const oldBlock = content.substring(getDashboardOldIdx, getDashboardEndIdx);
    content = content.replace(oldBlock, getDashboardNew);
}

// ===== POST /api/admin/dashboard/refresh =====
const postRefreshStart = "router.post('/api/admin/dashboard/refresh', auth, async (req, res) => {";
const postRefreshEnd = "    //DASHBOARD - Atualizar cache de contatos (colunas TEXT - lento)";
const postRefreshOldIdx = content.indexOf(postRefreshStart);
const postRefreshEndIdx = content.indexOf(postRefreshEnd);
if (postRefreshOldIdx >= 0 && postRefreshEndIdx > postRefreshOldIdx) {
    const postRefreshNew = `router.post('/api/admin/dashboard/refresh', auth, async (req, res) => {
        try {
            await database.query(
                \`CREATE TABLE IF NOT EXISTS dashboard_cache (
                    id INT PRIMARY KEY DEFAULT 1,
                    total INT DEFAULT 0, basico INT DEFAULT 0, completo INT DEFAULT 0,
                    ativos INT DEFAULT 0, inativos INT DEFAULT 0,
                    expirados INT DEFAULT 0, expiraEm30Dias INT DEFAULT 0,
                   semEmail INT DEFAULT NULL, semTelefone INT DEFAULT NULL, semEmailETelefone INT DEFAULT NULL,
                    porUf_json LONGTEXT, porMes_json LONGTEXT, cadernosPorUf_json LONGTEXT,
                    porAtividade_json LONGTEXT, porId_json LONGTEXT, contatos_json LONGTEXT, lastUpdated DATETIME,
                    UNIQUE KEY idx_dashboard_cache_id (id)
                )\`
            );
            try { await database.query(\`ALTER TABLE dashboard_cache ADD COLUMN porAtividade_json LONGTEXT\`); } catch (e) { }
            try { await database.query(\`ALTER TABLE dashboard_cache ADD COLUMN porId_json LONGTEXT\`); } catch (e) { }
            try { await database.query(\`ALTER TABLE dashboard_cache ADD COLUMN capa INT DEFAULT 0\`); } catch (e) { }
            const [stats] = await database.query(
                \`SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN codTipoAnuncio IN ('1','2') THEN 1 ELSE 0 END) as basico,
                    SUM(CASE WHEN codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo,
                    SUM(CASE WHEN codTipoAnuncio = '4' THEN 1 ELSE 0 END) as capa,
                    SUM(CASE WHEN activate = '1' THEN 1 ELSE 0 END) as ativos,
                    SUM(CASE WHEN activate != '1' OR activate IS NULL THEN 1 ELSE 0 END) as inativos,
                    SUM(CASE WHEN activate = '1' AND dueDate IS NOT NULL AND dueDate < NOW() THEN 1 ELSE 0 END) as expirados,
                    SUM(CASE WHEN activate = '1' AND dueDate IS NOT NULL AND dueDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiraEm30Dias
                 FROM anuncio\`,
                { type: database.QueryTypes.SELECT }
            );

            const porUf = await database.query(
                \`SELECT codUf, COUNT(*) as total,
                 SUM(CASE WHEN codTipoAnuncio IN ('1','2') THEN 1 ELSE 0 END) as basico,
                 SUM(CASE WHEN codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo,
                 SUM(CASE WHEN codTipoAnuncio = '4' THEN 1 ELSE 0 END) as capa,
                 SUM(CASE WHEN codDesconto IS NOT NULL AND codDesconto != '' AND codDesconto != '00.000.0000' AND codDesconto != '00.000.0001' THEN 1 ELSE 0 END) as campanhas,
                 SUM(CASE WHEN descTelefone IS NULL OR descTelefone = '' OR descTelefone = 'atualizar' OR descTelefone = '0' THEN 1 ELSE 0 END) as telAtualizar,
                 SUM(CASE WHEN descEmailComercial IS NULL OR descEmailComercial = '' OR descEmailComercial = 'atualizar' OR descEmailComercial = '0' THEN 1 ELSE 0 END) as emailAtualizar,
                 COUNT(DISTINCT CASE WHEN codDesconto NOT IN ('00.000.0000','00.000.0001','') THEN codDesconto END) as totalId
                 FROM anuncio WHERE activate = '1'
                 GROUP BY codUf ORDER BY total DESC\`,
                { type: database.QueryTypes.SELECT }
            );

            const porMes = await database.query(
                \`SELECT DATE_FORMAT(dtAlteracao, '%Y-%m') as mes, COUNT(*) as total,
                 SUM(CASE WHEN codTipoAnuncio IN ('1','2') THEN 1 ELSE 0 END) as basico,
                 SUM(CASE WHEN codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo
                 FROM anuncio
                 WHERE dtAlteracao IS NOT NULL AND dtAlteracao >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                 GROUP BY mes ORDER BY mes ASC\`,
                { type: database.QueryTypes.SELECT }
            );

            const porAtividade = await database.query(
                \`SELECT atv.nomeAmigavel as atividade, COUNT(*) as total,
                 SUM(CASE WHEN a.codTipoAnuncio IN ('1','2') THEN 1 ELSE 0 END) as basico,
                 SUM(CASE WHEN a.codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo,
                 SUM(CASE WHEN a.codDesconto IS NOT NULL AND a.codDesconto != '' AND a.codDesconto != '00.000.0000' AND a.codDesconto != '00.000.0001' THEN 1 ELSE 0 END) as campanhas,
                 SUM(CASE WHEN a.descTelefone IS NULL OR a.descTelefone = '' OR a.descTelefone = 'atualizar' OR a.descTelefone = '0' THEN 1 ELSE 0 END) as telAtualizar,
                 SUM(CASE WHEN a.descEmailComercial IS NULL OR a.descEmailComercial = '' OR a.descEmailComercial = 'atualizar' OR a.descEmailComercial = '0' THEN 1 ELSE 0 END) as emailAtualizar
                 FROM anuncio a
                 JOIN atividade atv ON a.codAtividade = atv.atividade
                 WHERE a.activate = '1'
                 GROUP BY atv.nomeAmigavel
                 ORDER BY total DESC\`,
                { type: database.QueryTypes.SELECT }
            );

            const cadernosPorUf = await database.query(
                \`SELECT codUf as UF, codCaderno as Caderno, COUNT(*) as total,
                 SUM(CASE WHEN codTipoAnuncio IN ('1','2') THEN 1 ELSE 0 END) as basico,
                 SUM(CASE WHEN codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo,
                 SUM(CASE WHEN codDesconto IS NOT NULL AND codDesconto != '' AND codDesconto != '00.000.0000' AND codDesconto != '00.000.0001' THEN 1 ELSE 0 END) as campanhas,
                 SUM(CASE WHEN descTelefone IS NULL OR descTelefone = '' OR descTelefone = 'atualizar' OR descTelefone = '0' THEN 1 ELSE 0 END) as telAtualizar,
                 SUM(CASE WHEN descEmailComercial IS NULL OR descEmailComercial = '' OR descEmailComercial = 'atualizar' OR descEmailComercial = '0' THEN 1 ELSE 0 END) as emailAtualizar
                 FROM anuncio WHERE activate = '1'
                 GROUP BY codUf, codCaderno ORDER BY codUf ASC, total DESC\`,
                { type: database.QueryTypes.SELECT }
            );

            const porId = await database.query(
                \`SELECT a.codDesconto as id, d.descricao as descricao,
                 COUNT(*) as total,
                 SUM(CASE WHEN a.codTipoAnuncio IN ('1','2') THEN 1 ELSE 0 END) as basico,
                 SUM(CASE WHEN a.codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo,
                 SUM(CASE WHEN a.codTipoAnuncio = '4' THEN 1 ELSE 0 END) as capa,
                 SUM(CASE WHEN a.descTelefone IS NULL OR a.descTelefone = '' OR a.descTelefone = 'atualizar' OR a.descTelefone = '0' THEN 1 ELSE 0 END) as telAtualizar,
                 SUM(CASE WHEN a.descEmailComercial IS NULL OR a.descEmailComercial = '' OR a.descEmailComercial = 'atualizar' OR a.descEmailComercial = '0' THEN 1 ELSE 0 END) as emailAtualizar
                 FROM anuncio a
                 LEFT JOIN desconto d ON a.codDesconto = d.hash
                 WHERE a.activate = '1'
                 GROUP BY a.codDesconto, d.descricao
                 ORDER BY total DESC\`,
                { type: database.QueryTypes.SELECT }
            );

            const [contatos] = await database.query(
                \`SELECT
                    SUM(CASE WHEN descEmailComercial IS NULL OR descEmailComercial = '' OR descEmailComercial = 'atualizar' OR descEmailComercial = '0' THEN 1 ELSE 0 END) as semEmail,
                    SUM(CASE WHEN descTelefone IS NULL OR descTelefone = '' OR descTelefone = 'atualizar' THEN 1 ELSE 0 END) as semTelefone,
                    SUM(CASE WHEN (descEmailComercial IS NULL OR descEmailComercial = '' OR descEmailComercial = 'atualizar' OR descEmailComercial = '0') AND (descTelefone IS NULL OR descTelefone = '' OR descTelefone = 'atualizar') THEN 1 ELSE 0 END) as semEmailETelefone
                 FROM anuncio WHERE activate = '1'\`,
                { type: database.QueryTypes.SELECT }
            );

            await database.query(
                \`INSERT INTO dashboard_cache (id, total, basico, completo, capa, ativos, inativos, expirados, expiraEm30Dias, semEmail, semTelefone, semEmailETelefone, porUf_json, porMes_json, cadernosPorUf_json, porAtividade_json, porId_json, contatos_json, lastUpdated)
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE
                    total=VALUES(total), basico=VALUES(basico), completo=VALUES(completo), capa=VALUES(capa),
                    ativos=VALUES(ativos), inativos=VALUES(inativos),
                    expirados=VALUES(expirados), expiraEm30Dias=VALUES(expiraEm30Dias),
                    semEmail=VALUES(semEmail), semTelefone=VALUES(semTelefone), semEmailETelefone=VALUES(semEmailETelefone),
                    porUf_json=VALUES(porUf_json), porMes_json=VALUES(porMes_json),
                    cadernosPorUf_json=VALUES(cadernosPorUf_json), porAtividade_json=VALUES(porAtividade_json),
                    porId_json=VALUES(porId_json),
                    contatos_json=VALUES(contatos_json), lastUpdated=NOW()\`,
                {
                    replacements: [
                        stats.total, stats.basico, stats.completo, stats.capa || 0, stats.ativos, stats.inativos,
                        stats.expirados, stats.expiraEm30Dias,
                        contatos.semEmail, contatos.semTelefone, contatos.semEmailETelefone,
                        JSON.stringify(porUf), JSON.stringify(porMes), JSON.stringify(cadernosPorUf),
                        JSON.stringify(porAtividade), JSON.stringify(porId), JSON.stringify(contatos)
                    ],
                    type: database.QueryTypes.INSERT
                }
            );
            
            const payload = {
                total: stats.total,
                basico: stats.basico,
                completo: stats.completo,
                capa: stats.capa || 0,
                ativos: stats.ativos,
                inativos: stats.inativos,
                semEmail: contatos.semEmail,
                semTelefone: contatos.semTelefone,
                semEmailETelefone: contatos.semEmailETelefone,
                expirados: stats.expirados,
                expiraEm30Dias: stats.expiraEm30Dias,
                porUf: porUf,
                porMes: porMes,
                cadernosPorUf: cadernosPorUf,
                porAtividade: porAtividade,
                porId: porId,
                lastUpdated: new Date()
            };
            
            if (redisClient.isReady) {
                await redisClient.set('dashboard_cache', JSON.stringify(payload), { EX: 3600 });
            }

            res.json({ success: true, message: 'Cache atualizado', lastUpdated: new Date() });
        } catch (error) {
            console.error('Erro ao atualizar cache do dashboard:', error);
            res.status(500).json({ success: false, message: 'Erro ao atualizar cache' });
        }
    });

`;

    const oldBlock = content.substring(postRefreshOldIdx, postRefreshEndIdx);
    content = content.replace(oldBlock, postRefreshNew);
}

fs.writeFileSync(routesPath, content, 'utf8');
console.log('Routes.js patched successfully!');
