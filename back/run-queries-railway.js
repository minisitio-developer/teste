const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'thomas.proxy.rlwy.net',
  port: 38287,
  user: 'root',
  password: 'mslXpGCdDFZzFBaJUdadTSwuwNsPhNYH',
  database: 'railway',
  connectTimeout: 30000,
};

async function runWithRetry(name, sql, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let pool;
    try {
      pool = mysql.createPool({ ...DB_CONFIG, connectionLimit: 1 });
      console.log(`\n${'='.repeat(80)}`);
      console.log(`QUERY ${name} (attempt ${attempt})`);
      console.log(`${'='.repeat(80)}`);
      const [rows] = await pool.execute(sql);
      if (Array.isArray(rows) && rows.length === 0) {
        console.log("(no results)");
      } else if (Array.isArray(rows)) {
        console.log(JSON.stringify(rows, null, 2));
      } else {
        console.log(JSON.stringify(rows, null, 2));
      }
      await pool.end().catch(() => {});
      return;
    } catch (err) {
      console.error(`  Attempt ${attempt} ERROR: ${err.message}`);
      if (pool) await pool.end().catch(() => {});
      if (attempt < maxRetries) {
        console.log(`  Retrying in 2 seconds...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
}

const queries = [
  { name: "1. Images (descImagem) - anuncio", sql: "SELECT COUNT(*) as total, SUM(CASE WHEN a.descImagem IS NOT NULL AND a.descImagem != '' AND a.descImagem != '0' THEN 1 ELSE 0 END) as com_imagem, SUM(CASE WHEN a.descImagem IS NULL OR a.descImagem = '' OR a.descImagem = '0' THEN 1 ELSE 0 END) as sem_imagem FROM anuncio a WHERE a.activate = 1" },
  { name: "2. First 5 anuncios (caderno)", sql: "SELECT a.codAnuncio, a.descAnuncio, a.descImagem, a.descEmailComercial, a.descTelefone, a.descCelular, a.descSite, a.descFacebook, a.descInsta FROM anuncio a WHERE a.activate = 1 LIMIT 5" },
  { name: "3. Atividade with anuncio count", sql: "SELECT at.id, at.nomeAmigavel, at.atividade, COUNT(a.codAnuncio) as total_anuncios FROM atividade at LEFT JOIN anuncio a ON at.id = a.codAtividade GROUP BY at.id, at.nomeAmigavel, at.atividade HAVING total_anuncios > 0 ORDER BY total_anuncios DESC LIMIT 20" },
  { name: "4. Image paths distribution", sql: "SELECT a.descImagem, COUNT(*) as cnt FROM anuncio a WHERE a.activate = 1 AND a.descImagem IS NOT NULL AND a.descImagem != '' GROUP BY a.descImagem ORDER BY cnt DESC LIMIT 20" },
  { name: "5. Total anuncios", sql: "SELECT COUNT(*) as total FROM anuncio" },
  { name: "6. Anuncios by codUf", sql: "SELECT a.codUf, COUNT(*) as total FROM anuncio a WHERE a.activate = 1 GROUP BY a.codUf ORDER BY total DESC" },
  { name: "7. Capa/caderno (tipoAnuncio 1,2,3)", sql: "SELECT a.codAnuncio, a.descAnuncio, a.descImagem, a.codTipoAnuncio FROM anuncio a WHERE a.activate = 1 AND a.codTipoAnuncio IN ('1', '2', '3') LIMIT 10" },
  { name: "8. Globals", sql: "SELECT * FROM globals" },
  { name: "9. Cidades total", sql: "SELECT COUNT(*) as total FROM cidade" },
  { name: "10. nomeAmigavel data", sql: "SELECT id, nomeAmigavel, atividade FROM atividade WHERE nomeAmigavel IS NOT NULL AND nomeAmigavel != '' LIMIT 20" },
  { name: "11. Anuncios per activate status", sql: "SELECT a.activate, COUNT(*) as total FROM anuncio a GROUP BY a.activate" },
  { name: "12. Caderno sample", sql: "SELECT * FROM caderno LIMIT 5" },
  { name: "13. UF sample", sql: "SELECT * FROM uf LIMIT 10" },
  { name: "14. Cidades sample", sql: "SELECT * FROM cidade LIMIT 5" },
  { name: "15. Tags sample", sql: "SELECT * FROM tags LIMIT 5" },
];

async function main() {
  for (const q of queries) {
    await runWithRetry(q.name, q.sql);
  }
  console.log("\n\nAll queries completed.");
}

main().catch(err => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
