const db = require('./back/config/db');

async function deleteBatch(sql, batchSize, label) {
    let total = 0;
    while (true) {
        try {
            const [result] = await db.query(sql + ` LIMIT ${batchSize}`);
            const deleted = result.affectedRows || 0;
            if (deleted === 0) break;
            total += deleted;
            if (deleted > 0) console.log(`  ${label}: +${deleted} (total: ${total})`);
        } catch (e) {
            console.error(`  ${label} ERROR:`, e.message);
            break;
        }
    }
    return total;
}

(async () => {
    try {
        // Check remaining
        const [[{t: total}]] = await db.query("SELECT COUNT(*) as t FROM anuncio");
        const [[{t: df}]] = await db.query("SELECT COUNT(*) as t FROM anuncio WHERE codUf = 'DF'");
        console.log('Total:', total, '| DF:', df);

        // Continue deleting remaining non-DF UFs
        const ufsToDelete = ['MA','AM','AL','AP','AC','TO','PI','PB','PE','RN','PA','MT','MS','SE','RO','RR'];
        console.log('\nContinuando...');
        let totalDel = 0;
        for (const uf of ufsToDelete) {
            const t = await deleteBatch(`DELETE FROM anuncio WHERE codUf = '${uf}'`, 50000, uf);
            totalDel += t;
            if (t > 0) console.log(`  ${uf}: ${t} deletados`);
        }
        console.log('Total deletados:', totalDel);

        // Final verify
        const [[{t: final}]] = await db.query("SELECT COUNT(*) as t FROM anuncio");
        const [[{t: finalDf}]] = await db.query("SELECT COUNT(*) as t FROM anuncio WHERE codUf = 'DF'");
        console.log('\n=== FINAL ===');
        console.log('Total:', final, '| DF:', finalDf);

        // Optimize
        console.log('\nOtimizando...');
        await db.query("OPTIMIZE TABLE anuncio");
        console.log('OK');

        process.exit(0);
    } catch (e) {
        console.error('FATAL:', e.message);
        process.exit(1);
    }
})().catch(e => { console.error(e.message); process.exit(1); });
