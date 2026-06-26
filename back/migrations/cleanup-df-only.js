const database = require('../config/db');

async function cleanup() {
    const dryRun = process.argv.includes('--dry-run');

    try {
        await database.authenticate();
        console.log('Conectado ao MySQL do Railway');

        // 1. Verificar tamanho das tabelas
        const [sizes] = await database.query(`
            SELECT table_name, table_rows, 
                   ROUND(data_length / 1024 / 1024, 2) AS data_mb,
                   ROUND(index_length / 1024 / 1024, 2) AS index_mb,
                   ROUND((data_length + index_length) / 1024 / 1024, 2) AS total_mb
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
            ORDER BY (data_length + index_length) DESC
        `);
        console.log('\n--- TAMANHO DAS TABELAS ---');
        sizes.forEach(s => console.log(`  ${s.table_name}: ${s.total_mb} MB (${s.table_rows} rows)`));

        // 2. Mapear UFs
        const [ufs] = await database.query('SELECT id_uf, sigla_uf, nome_uf FROM uf');
        console.log('\n--- UFs ---');
        ufs.forEach(u => console.log(`  id_uf=${u.id_uf} -> ${u.sigla_uf} (${u.nome_uf})`));

        const dfRecord = ufs.find(u => u.sigla_uf === 'DF');
        if (!dfRecord) {
            console.error('ERRO: DF não encontrado na tabela uf!');
            process.exit(1);
        }
        const dfId = dfRecord.id_uf;
        console.log(`\nDF id_uf = ${dfId}`);

        // 3. Contar registros DF vs outros
        const [anuncioCount] = await database.query(`
            SELECT 
                CASE WHEN codUf = '${dfId}' THEN 'DF' ELSE 'outros' END AS grupo,
                COUNT(*) AS total
            FROM anuncio GROUP BY grupo
        `);
        console.log('\n--- ANUNCIOS ---');
        anuncioCount.forEach(r => console.log(`  ${r.grupo}: ${r.total}`));

        const [cadernoCount] = await database.query(`
            SELECT 
                CASE WHEN codUf = '${dfId}' THEN 'DF' ELSE 'outros' END AS grupo,
                COUNT(*) AS total
            FROM caderno GROUP BY grupo
        `);
        console.log('\n--- CADERNOS ---');
        cadernoCount.forEach(r => console.log(`  ${r.grupo}: ${r.total}`));

        const [usuarioCount] = await database.query(`
            SELECT 
                CASE WHEN codUf = '${dfId}' THEN 'DF' ELSE 'outros' END AS grupo,
                COUNT(*) AS total
            FROM usuario GROUP BY grupo
        `);
        console.log('\n--- USUARIOS ---');
        usuarioCount.forEach(r => console.log(`  ${r.grupo}: ${r.total}`));

        const [importCount] = await database.query('SELECT COUNT(*) AS total FROM importStage');
        console.log(`\n--- IMPORTSTAGE: ${importCount[0].total} registros ---`);

        const [campanhaCount] = await database.query(`
            SELECT 
                CASE WHEN uf = 'DF' THEN 'DF' ELSE 'outros' END AS grupo,
                COUNT(*) AS total
            FROM campanhas GROUP BY grupo
        `);
        console.log('\n--- CAMPANHAS ---');
        campanhaCount.forEach(r => console.log(`  ${r.grupo}: ${r.total}`));

        const [promocaoCount] = await database.query(`
            SELECT 
                CASE WHEN uf = 'DF' THEN 'DF' ELSE 'outros' END AS grupo,
                COUNT(*) AS total
            FROM promocao GROUP BY grupo
        `);
        console.log('\n--- PROMOCOES ---');
        promocaoCount.forEach(r => console.log(`  ${r.grupo}: ${r.total}`));

        const [descontoCount] = await database.query('SELECT COUNT(*) AS total FROM desconto');
        console.log(`\n--- DESCONTO: ${descontoCount[0].total} registros ---`);

        if (dryRun) {
            console.log('\n=== DRY RUN - Nenhuma alteracao feita ===');
            process.exit(0);
        }

        // 4. Limpar
        console.log('\n--- LIMPANDO ---');

        console.log('Limpando importStage...');
        await database.query('DELETE FROM importStage');
        console.log('  OK');

        console.log('Limpando anuncios nao-DF...');
        await database.query(`DELETE FROM anuncio WHERE codUf != '${dfId}'`);
        console.log('  OK');

        console.log('Limpando cadernos nao-DF...');
        await database.query(`DELETE FROM caderno WHERE codUf != '${dfId}'`);
        console.log('  OK');

        console.log('Limpando usuarios nao-DF (mantendo admin)...');
        await database.query(`DELETE FROM usuario WHERE codUf != '${dfId}' AND codTipoUsuario != '1'`);
        console.log('  OK');

        console.log('Limpando campanhas nao-DF...');
        await database.query(`DELETE FROM campanhas WHERE uf != 'DF'`);
        console.log('  OK');

        console.log('Limpando promocoes nao-DF...');
        await database.query(`DELETE FROM promocao WHERE uf != 'DF'`);
        console.log('  OK');

        console.log('Limpando tokens_promocao orfaos...');
        await database.query('DELETE FROM tokens_promocao');
        console.log('  OK');

        console.log('Limpando pagamentos orfaos (sem usuario)...');
        await database.query('DELETE FROM pagamento WHERE codUsuario NOT IN (SELECT codUsuario FROM usuario)');
        console.log('  OK');

        // 5. Criar tabelas que falharam
        console.log('\n--- CRIANDO TABELAS QUE FALHARAM ---');

        console.log('Criando pin...');
        await database.query(`
            CREATE TABLE IF NOT EXISTS pin (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo VARCHAR(255) NOT NULL UNIQUE,
                validade TEXT NOT NULL
            )
        `);
        console.log('  OK');

        console.log('Criando dashboard_cache...');
        await database.query(`
            CREATE TABLE IF NOT EXISTS dashboard_cache (
                id INT PRIMARY KEY DEFAULT 1,
                total INT DEFAULT 0, basico INT DEFAULT 0, completo INT DEFAULT 0,
                ativos INT DEFAULT 0, inativos INT DEFAULT 0,
                expirados INT DEFAULT 0, expiraEm30Dias INT DEFAULT 0,
                semEmail INT DEFAULT NULL, semTelefone INT DEFAULT NULL, semEmailETelefone INT DEFAULT NULL,
                porUf_json LONGTEXT, porMes_json LONGTEXT, cadernosPorUf_json LONGTEXT,
                contatos_json LONGTEXT, lastUpdated DATETIME,
                UNIQUE KEY idx_dashboard_cache_id (id)
            )
        `);
        console.log('  OK');

        // 6. Seed PIN
        console.log('Inserindo PIN...');
        await database.query(`
            INSERT IGNORE INTO pin (codigo, validade) VALUES ('61984213444', '31/12/2030')
        `);
        console.log('  OK');

        // 7. OPTIMIZE para liberar espaco
        console.log('\n--- OPTIMIZE TABLES ---');
        const tables = ['anuncio', 'caderno', 'usuario', 'campanhas', 'promocao', 'desconto', 'importStage', 'pagamento', 'tokens_promocao'];
        for (const t of tables) {
            try {
                await database.query(`OPTIMIZE TABLE ${t}`);
                console.log(`  ${t} - OK`);
            } catch (e) {
                console.log(`  ${t} - skip (${e.message})`);
            }
        }

        // 8. Verificar tamanho final
        const [finalSizes] = await database.query(`
            SELECT table_name, table_rows, 
                   ROUND(data_length / 1024 / 1024, 2) AS data_mb,
                   ROUND(index_length / 1024 / 1024, 2) AS index_mb,
                   ROUND((data_length + index_length) / 1024 / 1024, 2) AS total_mb
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
            ORDER BY (data_length + index_length) DESC
        `);
        console.log('\n--- TAMANHO FINAL ---');
        finalSizes.forEach(s => console.log(`  ${s.table_name}: ${s.total_mb} MB (${s.table_rows} rows)`));

        console.log('\n=== LIMPEZA CONCLUIDA ===');

    } catch (err) {
        console.error('ERRO:', err.message);
    } finally {
        await database.close();
    }
}

cleanup();
