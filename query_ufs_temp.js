const db = require('./back/config/db');
(async () => {
    // Check column type of codUf in anuncio
    const r1 = await db.query("SHOW COLUMNS FROM anuncio WHERE Field = 'codUf'", { type: db.QueryTypes.SELECT });
    console.log('codUf column:', JSON.stringify(r1));

    // Check distinct values of codUf
    const r2 = await db.query("SELECT DISTINCT codUf, COUNT(*) as total FROM anuncio GROUP BY codUf ORDER BY codUf", { type: db.QueryTypes.SELECT });
    console.log('\nDistinct codUf values in anuncio:');
    for (const u of r2) console.log('  codUf=' + JSON.stringify(u.codUf) + ' (' + typeof u.codUf + '): ' + u.total);

    process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
