const mysql = require('mysql2/promise');

const queries = [
  { name: "1. Images in database (descImagem field)", sql: "SELECT COUNT(*) as total, SUM(CASE WHEN descImagem IS NOT NULL AND descImagem != '' AND descImagem != '0' THEN 1 ELSE 0 END) as com_imagem, SUM(CASE WHEN descImagem IS NULL OR descImagem = '' OR descImagem = '0' THEN 1 ELSE 0 END) as sem_imagem FROM espacos WHERE status = 1;" },
  { name: "2. Caderno data (first 5 espacos)", sql: "SELECT e.codEspacos, e.nome, e.descImagem, e.descEmail, e.descTelefone, e.descCelular, e.descSite, e.descFacebook, e.descInsta FROM espacos e WHERE e.status = 1 LIMIT 5;" },
  { name: "3. Atividade data with espaco count", sql: "SELECT a.codAtividade, a.nomeAmigavel, a.nome, COUNT(ea.codEspacos) as total_espacos FROM atividade a LEFT JOIN espaco_atividade ea ON a.codAtividade = ea.codAtividade GROUP BY a.codAtividade, a.nomeAmigavel, a.nome HAVING total_espacos > 0 ORDER BY total_espacos DESC LIMIT 20;" },
  { name: "4. Image paths distribution", sql: "SELECT descImagem, COUNT(*) as cnt FROM espacos WHERE status = 1 AND descImagem IS NOT NULL AND descImagem != '' GROUP BY descImagem ORDER BY cnt DESC LIMIT 20;" },
  { name: "5. Espaco_atividade total", sql: "SELECT COUNT(*) as total FROM espaco_atividade;" },
  { name: "6. Espacos by UF", sql: "SELECT uf, COUNT(*) as total FROM espacos WHERE status = 1 GROUP BY uf ORDER BY total DESC;" },
  { name: "7. Capa/caderno images", sql: "SELECT e.codEspacos, e.nome, e.descImagem, e.fotoCapa FROM espacos e WHERE e.status = 1 AND e.codTipoAnuncio IN (1, 2, 3) LIMIT 10;" },
  { name: "8. Globals (portal data)", sql: "SELECT * FROM globals;" },
  { name: "9. Cidades total", sql: "SELECT COUNT(*) as total FROM cidades;" },
  { name: "10. nomeAmigavel data", sql: "SELECT codAtividade, nomeAmigavel, nome FROM atividade WHERE nomeAmigavel IS NOT NULL AND nomeAmigavel != '' LIMIT 20;" },
];

async function main() {
  let connection;
  
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  
  if (dbUrl) {
    console.log("Connecting using Railway DATABASE_URL...");
    const url = new URL(dbUrl);
    connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.replace('/', ''),
      ssl: { rejectUnauthorized: true }
    });
  } else {
    console.log("No DATABASE_URL found, trying local Docker MySQL on port 3307...");
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: 'root',
      database: 'minisitio_local'
    });
  }
  
  console.log("Connected successfully!\n");
  
  for (const q of queries) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`QUERY ${q.name}`);
    console.log(`${'='.repeat(80)}`);
    try {
      const [rows] = await connection.execute(q.sql);
      if (Array.isArray(rows) && rows.length === 0) {
        console.log("(no results)");
      } else if (Array.isArray(rows)) {
        console.log(JSON.stringify(rows, null, 2));
      } else {
        console.log(JSON.stringify(rows, null, 2));
      }
    } catch (err) {
      console.error(`ERROR: ${err.message}`);
    }
  }
  
  await connection.end();
  console.log("\n\nAll queries completed.");
}

main().catch(err => {
  console.error("Connection error:", err.message);
  process.exit(1);
});
