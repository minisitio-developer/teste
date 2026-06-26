const database = require('../config/db');

async function runCleanup() {
    try {
        await database.authenticate();
        console.log('CLEANUP: Conectado ao MySQL');

        const [ufs] = await database.query('SELECT id_uf, sigla_uf FROM uf');
        const dfRecord = ufs.find(u => u.sigla_uf === 'DF');
        if (!dfRecord) { console.error('CLEANUP: DF nao encontrado'); return; }
        const dfId = String(dfRecord.id_uf);
        console.log(`CLEANUP: DF id_uf = ${dfId}`);

        async function delBatch(table, where, batchSize) {
            let total = 0, del = 1;
            while (del > 0) {
                try {
                    const [r] = await database.query(`DELETE FROM ${table} WHERE ${where} LIMIT ${batchSize}`);
                    del = r.affectedRows;
                    total += del;
                    if (del > 0) console.log(`  ${table}: -${del} (total: ${total})`);
                } catch(e) {
                    console.log(`  ${table} error: ${e.message}`);
                    break;
                }
            }
            return total;
        }

        async function delAll(table, batchSize) {
            let total = 0, del = 1;
            while (del > 0) {
                try {
                    const [r] = await database.query(`DELETE FROM ${table} LIMIT ${batchSize}`);
                    del = r.affectedRows;
                    total += del;
                    if (del > 0) console.log(`  ${table}: -${del} (total: ${total})`);
                } catch(e) {
                    console.log(`  ${table} error: ${e.message}`);
                    break;
                }
            }
            return total;
        }

        console.log('CLEANUP: importStage...');
        await delAll('importStage', 50);

        console.log('CLEANUP: anuncios nao-DF...');
        await delBatch('anuncio', `codUf != '${dfId}'`, 50);

        console.log('CLEANUP: cadernos nao-DF...');
        await delBatch('caderno', `codUf != '${dfId}'`, 50);

        console.log('CLEANUP: usuarios nao-DF...');
        await delBatch('usuario', `codUf != '${dfId}' AND codTipoUsuario != '1'`, 50);

        console.log('CLEANUP: campanhas...');
        await delBatch('campanhas', `uf != 'DF'`, 50);

        console.log('CLEANUP: promocao...');
        await delBatch('promocao', `uf != 'DF'`, 50);

        console.log('CLEANUP: tokens_promocao...');
        await delAll('tokens_promocao', 50);

        console.log('CLEANUP: desconto...');
        await delAll('desconto', 50);

        console.log('CLEANUP: pagamento...');
        await delAll('pagamento', 50);

        console.log('CLEANUP: OPTIMIZE importStage...');
        try {
            await database.query('OPTIMIZE TABLE importStage');
            console.log('  importStage OK');
        } catch(e) { console.log('  importStage:', e.message); }

        console.log('CLEANUP: Criando pin...');
        try {
            await database.query(`CREATE TABLE IF NOT EXISTS pin (id INT AUTO_INCREMENT PRIMARY KEY, codigo VARCHAR(255) NOT NULL UNIQUE, validade TEXT NOT NULL)`);
            await database.query(`INSERT IGNORE INTO pin (codigo, validade) VALUES ('61984213444', '31/12/2030')`);
            console.log('  pin OK');
        } catch(e) { console.log('  pin:', e.message); }

        console.log('CLEANUP: Criando dashboard_cache...');
        try {
            await database.query(`CREATE TABLE IF NOT EXISTS dashboard_cache (
                id INT PRIMARY KEY DEFAULT 1,
                total INT DEFAULT 0, basico INT DEFAULT 0, completo INT DEFAULT 0,
                ativos INT DEFAULT 0, inativos INT DEFAULT 0,
                expirados INT DEFAULT 0, expiraEm30Dias INT DEFAULT 0,
                semEmail INT DEFAULT NULL, semTelefone INT DEFAULT NULL, semEmailETelefone INT DEFAULT NULL,
                porUf_json LONGTEXT, porMes_json LONGTEXT, cadernosPorUf_json LONGTEXT,
                contatos_json LONGTEXT, lastUpdated DATETIME,
                UNIQUE KEY idx_dashboard_cache_id (id)
            )`);
            console.log('  dashboard_cache OK');
        } catch(e) { console.log('  dashboard_cache:', e.message); }

        const [finalSizes] = await database.query(`
            SELECT table_name, ROUND((data_length + index_length) / 1024 / 1024, 2) AS total_mb
            FROM information_schema.tables WHERE table_schema = DATABASE()
            ORDER BY (data_length + index_length) DESC LIMIT 10
        `);
        console.log('CLEANUP: Tamanho final:');
        finalSizes.forEach(s => console.log(`  ${s.table_name}: ${s.total_mb} MB`));

        console.log('CLEANUP: CONCLUIDO');
    } catch (err) {
        console.error('CLEANUP: ERRO:', err.message);
    }
}

module.exports = runCleanup;
