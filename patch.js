const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, 'back', 'routes', 'Routes.js');
let content = fs.readFileSync(routesPath, 'utf8');

// Insert redis client
content = content.replace("const database = require('../config/db.js');", "const database = require('../config/db.js');\nconst redisClient = require('../config/redis.js');");

// Update GET dashboard
const getDashboardStart = content.indexOf("router.get('/api/admin/dashboard', auth, async (req, res) => {");
const getDashboardEnd = content.indexOf("    //DASHBOARD - Atualizar cache (queries lentas)");
const getDashboardOld = content.substring(getDashboardStart, getDashboardEnd);

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
                        total: 0, basico: 0, completo: 0, ativos: 0, inativos: 0,
                        semEmail: null, semTelefone: null, semEmailETelefone: null,
                        expirados: 0, expiraEm30Dias: 0,
                        porUf: [], porMes: [], cadernosPorUf: [],
                        lastUpdated: null
                    }
                });
            }

            const dataToReturn = {
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
            };
            
            if (redisClient.isReady) {
                await redisClient.set('dashboard_cache', JSON.stringify(dataToReturn), { EX: 3600 }); // Expira em 1h
            }

            res.json({ success: true, data: dataToReturn });
        } catch (error) {
            console.error('Erro no dashboard:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar dados do dashboard' });
        }
    });

`;

content = content.replace(getDashboardOld, getDashboardNew);

// Update POST refresh
const postRefreshStart = content.indexOf("router.post('/api/admin/dashboard/refresh', auth, async (req, res) => {");
const postRefreshEnd = content.indexOf("    //DASHBOARD - Atualizar cache de contatos (colunas TEXT - lento)");
const postRefreshOld = content.substring(postRefreshStart, postRefreshEnd);

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
                    contatos_json LONGTEXT, lastUpdated DATETIME,
                    UNIQUE KEY idx_dashboard_cache_id (id)
                )\`
            );
            const [stats] = await database.query(
                \`SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN codTipoAnuncio = '1' THEN 1 ELSE 0 END) as basico,
                    SUM(CASE WHEN codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo,
                    SUM(CASE WHEN activate = 1 THEN 1 ELSE 0 END) as ativos,
                    SUM(CASE WHEN activate = 0 THEN 1 ELSE 0 END) as inativos,
                    SUM(CASE WHEN activate = 1 AND dueDate IS NOT NULL AND dueDate < NOW() THEN 1 ELSE 0 END) as expirados,
                    SUM(CASE WHEN activate = 1 AND dueDate IS NOT NULL AND dueDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiraEm30Dias
                 FROM anuncio\`,
                { type: database.QueryTypes.SELECT }
            );

            const porUf = await database.query(
                \`SELECT codUf, COUNT(*) as total,
                 SUM(CASE WHEN codTipoAnuncio = '1' THEN 1 ELSE 0 END) as basico,
                 SUM(CASE WHEN codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo
                 FROM anuncio WHERE activate = 1
                 GROUP BY codUf ORDER BY total DESC\`,
                { type: database.QueryTypes.SELECT }
            );

            const porMes = await database.query(
                \`SELECT DATE_FORMAT(createdAt, '%Y-%m') as mes, COUNT(*) as total,
                 SUM(CASE WHEN codTipoAnuncio = '1' THEN 1 ELSE 0 END) as basico,
                 SUM(CASE WHEN codTipoAnuncio = '3' THEN 1 ELSE 0 END) as completo
                 FROM anuncio
                 WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                 GROUP BY mes ORDER BY mes ASC\`,
                { type: database.QueryTypes.SELECT }
            );

            const cadernosPorUf = await database.query(\`SELECT UF, COUNT(*) as total FROM caderno GROUP BY UF ORDER BY total DESC\`, { type: database.QueryTypes.SELECT });

            const [contatos] = await database.query(
                \`SELECT
                    SUM(CASE WHEN descEmailComercial IS NULL OR descEmailComercial = '' OR descEmailComercial = 'atualizar' OR descEmailComercial = '0' THEN 1 ELSE 0 END) as semEmail,
                    SUM(CASE WHEN descTelefone IS NULL OR descTelefone = '' OR descTelefone = 'atualizar' THEN 1 ELSE 0 END) as semTelefone,
                    SUM(CASE WHEN (descEmailComercial IS NULL OR descEmailComercial = '' OR descEmailComercial = 'atualizar' OR descEmailComercial = '0') AND (descTelefone IS NULL OR descTelefone = '' OR descTelefone = 'atualizar') THEN 1 ELSE 0 END) as semEmailETelefone
                 FROM anuncio WHERE activate = 1\`,
                { type: database.QueryTypes.SELECT }
            );

            await database.query(
                \`INSERT INTO dashboard_cache (id, total, basico, completo, ativos, inativos, expirados, expiraEm30Dias, semEmail, semTelefone, semEmailETelefone, porUf_json, porMes_json, cadernosPorUf_json, contatos_json, lastUpdated)
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE
                    total=VALUES(total), basico=VALUES(basico), completo=VALUES(completo),
                    ativos=VALUES(ativos), inativos=VALUES(inativos),
                    expirados=VALUES(expirados), expiraEm30Dias=VALUES(expiraEm30Dias),
                    semEmail=VALUES(semEmail), semTelefone=VALUES(semTelefone), semEmailETelefone=VALUES(semEmailETelefone),
                    porUf_json=VALUES(porUf_json), porMes_json=VALUES(porMes_json),
                    cadernosPorUf_json=VALUES(cadernosPorUf_json), contatos_json=VALUES(contatos_json), lastUpdated=NOW()\`,
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
            
            const payload = {
                total: stats.total,
                basico: stats.basico,
                completo: stats.completo,
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

content = content.replace(postRefreshOld, postRefreshNew);

fs.writeFileSync(routesPath, content, 'utf8');
console.log('Routes.js patched!');
