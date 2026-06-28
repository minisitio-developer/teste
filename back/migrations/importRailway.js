const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const RAILWAY_HOST = 'thomas.proxy.rlwy.net';
const RAILWAY_PORT = 38287;
const RAILWAY_USER = 'root';
const RAILWAY_PASS = 'mslXpGCdDFZzFBaJUdadTSwuwNsPhNYH';
const RAILWAY_DB = 'railway';

const DUMP_DIR = 'C:\\Users\\Leôncio';

const FILES_TO_IMPORT = [
    { file: 'dump_struct.sql', label: ' Estrutura', limit: Infinity },
    { file: 'dump_small.sql', label: ' Dump pequeno', limit: Infinity },
    { file: 'dump_caderno.sql', label: ' Cadernos', limit: Infinity },
    { file: 'dump_anuncio.sql', label: ' Anuncios (2.9GB)', limit: Infinity },
];

async function importSqlFile(conn, filePath, label) {
    const stat = fs.statSync(filePath);
    const fileSizeMB = (stat.size / 1024 / 1024).toFixed(1);
    console.log(`\n${label} (${fileSizeMB} MB)...`);

    let statementCount = 0;
    let totalLines = 0;
    let currentStatement = '';
    const startTime = Date.now();

    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        totalLines++;
        const trimmed = line.trim();

        if (trimmed === '' || trimmed.startsWith('--') || trimmed.startsWith('/*') || trimmed === '*/') {
            continue;
        }

        currentStatement += line + '\n';

        if (trimmed.endsWith(';')) {
            try {
                await conn.query(currentStatement);
                statementCount++;
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                    // skip duplicates
                } else if (err.errno === 1062 || err.message.includes('Duplicate')) {
                    // skip
                } else {
                    console.error(`  Erro na statement ${statementCount + 1}: ${err.message.substring(0, 100)}`);
                }
            }
            currentStatement = '';

            if (statementCount % 1000 === 0) {
                const elapsed = (Date.now() - startTime) / 1000;
                const speed = (statementCount / elapsed).toFixed(0);
                process.stdout.write(`  ${statementCount} statements | ${speed}/s | linhas: ${totalLines}\r`);
            }
        }
    }

    if (currentStatement.trim()) {
        try {
            await conn.query(currentStatement);
            statementCount++;
        } catch (err) {
            // skip errors on last statement
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  Concluido: ${statementCount} statements em ${elapsed}s`);
    return statementCount;
}

async function main() {
    console.log('=== IMPORTACAO RAILWAY ===');
    console.log(`Host: ${RAILWAY_HOST}:${RAILWAY_PORT}`);

    const conn = await mysql.createConnection({
        host: RAILWAY_HOST,
        port: RAILWAY_PORT,
        user: RAILWAY_USER,
        password: RAILWAY_PASS,
        database: RAILWAY_DB,
        connectTimeout: 30000,
        multipleStatements: true,
    });

    console.log('Conectado ao Railway!');

    // Check current state
    const [ufs] = await conn.query('SELECT COUNT(*) as total FROM uf');
    const [anuncios] = await conn.query('SELECT COUNT(*) as total FROM anuncio');
    const [cadernos] = await conn.query('SELECT COUNT(*) as total FROM caderno');
    const [usuarios] = await conn.query('SELECT COUNT(*) as total FROM usuario');
    console.log(`\nEstado ATUAL:`);
    console.log(`  UF: ${ufs[0].total}`);
    console.log(`  Anuncios: ${anuncios[0].total}`);
    console.log(`  Cadernos: ${cadernos[0].total}`);
    console.log(`  Usuarios: ${usuarios[0].total}`);

    for (const item of FILES_TO_IMPORT) {
        const filePath = path.join(DUMP_DIR, item.file);
        if (!fs.existsSync(filePath)) {
            console.log(`Arquivo nao encontrado: ${item.file}`);
            continue;
        }
        await importSqlFile(conn, filePath, item.label);
    }

    // Final state
    const [ufs2] = await conn.query('SELECT COUNT(*) as total FROM uf');
    const [anuncios2] = await conn.query('SELECT COUNT(*) as total FROM anuncio');
    const [cadernos2] = await conn.query('SELECT COUNT(*) as total FROM caderno');
    const [usuarios2] = await conn.query('SELECT COUNT(*) as total FROM usuario');
    console.log(`\nEstado FINAL:`);
    console.log(`  UF: ${ufs2[0].total}`);
    console.log(`  Anuncios: ${anuncios2[0].total}`);
    console.log(`  Cadernos: ${cadernos2[0].total}`);
    console.log(`  Usuarios: ${usuarios2[0].total}`);

    await conn.end();
    console.log('\nImportacao concluida!');
}

main().catch(err => {
    console.error('ERRO FATAL:', err.message);
    process.exit(1);
});
