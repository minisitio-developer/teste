/**
 * Migração: Vincula arquivos de imagem no disco ao campo descImagem no banco.
 * 
 * Padrão de arquivo: {codAnuncio}_{timestamp}.{ext}
 * Atualiza apenas registros onde descImagem é NULL ou 0.
 * Para múltiplos arquivos por codAnuncio, usa o mais recente (maior timestamp).
 * 
 * Uso: node back/migrations/fix-descImagem.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const database = require('../config/db');

const DESC_IMG_DIR = path.join(__dirname, '..', 'public', 'upload', 'img', 'descImagem');
const FILE_PATTERN = /^(\d+)_(\d+)\.\w+$/;

async function main() {
    const isDryRun = process.argv.includes('--dry-run');

    console.log('=== Migração: fix-descImagem ===');
    console.log(`Modo: ${isDryRun ? 'DRY-RUN (sem alterações)' : 'PRODUÇÃO'}`);
    console.log(`Diretório: ${DESC_IMG_DIR}`);
    console.log('');

    // 1. Listar arquivos no padrão
    const files = fs.readdirSync(DESC_IMG_DIR).filter(f => FILE_PATTERN.test(f));
    console.log(`Arquivos no padrão {codAnuncio}_{timestamp}.{ext}: ${files.length}`);

    // 2. Agrupar por codAnuncio, pegar o mais recente
    const byCodAnuncio = {};
    for (const file of files) {
        const match = file.match(FILE_PATTERN);
        if (!match) continue;

        const codAnuncio = parseInt(match[1]);
        const timestamp = parseInt(match[2]);

        if (!byCodAnuncio[codAnuncio] || timestamp > byCodAnuncio[codAnuncio].timestamp) {
            byCodAnuncio[codAnuncio] = { file, timestamp };
        }
    }

    const codAnuncios = Object.keys(byCodAnuncio).map(Number);
    console.log(`Anúnicos únicos para atualizar: ${codAnuncios.length}`);
    console.log('');

    if (codAnuncios.length === 0) {
        console.log('Nada para fazer.');
        await database.close();
        return;
    }

    // 3. Verificar quais registros precisam de update
    const placeholders = codAnuncios.map(() => '?').join(',');
    const [rows] = await database.query(
        `SELECT codAnuncio, descImagem FROM anuncio WHERE codAnuncio IN (${placeholders}) AND (descImagem IS NULL OR descImagem = '0' OR descImagem = 0)`,
        { replacements: codAnuncios, type: database.QueryTypes.SELECT }
    );

    const needsUpdate = Array.isArray(rows) ? rows : [rows];
    console.log(`Registros que precisam de update (descImagem=NULL ou 0): ${needsUpdate.length}`);

    // 4. Executar updates
    let updated = 0;
    let errors = 0;

    for (const row of needsUpdate) {
        const info = byCodAnuncio[row.codAnuncio];
        if (!info) continue;

        try {
            if (!isDryRun) {
                await database.query(
                    `UPDATE anuncio SET descImagem = ? WHERE codAnuncio = ?`,
                    { replacements: [info.file, row.codAnuncio], type: database.QueryTypes.UPDATE }
                );
            }
            updated++;
            console.log(`  [${isDryRun ? 'DRY' : 'OK'}] codAnuncio=${row.codAnuncio} → ${info.file}`);
        } catch (err) {
            errors++;
            console.error(`  [ERRO] codAnuncio=${row.codAnuncio}: ${err.message}`);
        }
    }

    // 5. Registros que já têm descImagem (skip)
    const alreadyHas = codAnuncios.length - needsUpdate.length;
    if (alreadyHas > 0) {
        console.log(`\nRegistros já com imagem (ignorados): ${alreadyHas}`);
    }

    console.log('');
    console.log('=== Resumo ===');
    console.log(`Atualizados: ${updated}`);
    console.log(`Erros: ${errors}`);
    console.log(`Ignorados (já tinham imagem): ${alreadyHas}`);

    await database.close();
}

main().catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
});
