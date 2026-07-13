require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

async function getConnection() {
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (dbUrl) {
    console.log('Conectando via DATABASE_URL...');
    const url = new URL(dbUrl);
    return mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.replace('/', ''),
      ssl: { rejectUnauthorized: false },
      multipleStatements: true,
      connectTimeout: 30000,
    });
  }
  console.log('Conectando via .env (localhost)...');
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'minisitio_local',
    multipleStatements: true,
    connectTimeout: 30000,
  });
}

async function tableExists(conn, tableName) {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  );
  return rows[0].cnt > 0;
}

async function runSqlFile(conn, filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ${label}: arquivo não encontrado: ${filePath}`);
    return;
  }
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  if (statements.length === 0) return;
  console.log(`  ${label}: executando ${statements.length} comando(s)...`);
  for (const stmt of statements) {
    try {
      await conn.execute(stmt + ';');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log(`  ${label}: registro já existe (ignorado)`);
      } else {
        console.warn(`  ${label}: aviso: ${err.message}`);
      }
    }
  }
}

async function ensureTables(conn) {
  console.log('\nVerificando/criando tabelas...');

  await conn.execute(`CREATE TABLE IF NOT EXISTS uf (
    id_uf INT AUTO_INCREMENT PRIMARY KEY,
    sigla_uf VARCHAR(2) NOT NULL,
    nome_uf VARCHAR(150) NOT NULL,
    id_pais INT NOT NULL DEFAULT 10
  )`);

  await conn.execute(`CREATE TABLE IF NOT EXISTS caderno (
    codCaderno INT AUTO_INCREMENT PRIMARY KEY,
    codUf INT NOT NULL,
    UF VARCHAR(2) NOT NULL,
    nomeCaderno VARCHAR(255) NOT NULL,
    nomeCadernoFriendly VARCHAR(255),
    descImagem VARCHAR(255),
    cep_inicial VARCHAR(20),
    cep_final VARCHAR(20),
    isCapital INT DEFAULT 0,
    legenda TEXT,
    basico INT DEFAULT 0,
    completo INT DEFAULT 0,
    total INT DEFAULT 0
  )`);

  await conn.execute(`CREATE TABLE IF NOT EXISTS atividade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    atividade TEXT NOT NULL,
    nomeAmigavel TEXT NOT NULL,
    corTitulo TEXT DEFAULT '#ffffff',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  await conn.execute(`CREATE TABLE IF NOT EXISTS anuncio (
    codAnuncio INT AUTO_INCREMENT PRIMARY KEY,
    codUsuario INT,
    codTipoAnuncio VARCHAR(150),
    codAtividade INT,
    codCaderno INT,
    codUf VARCHAR(10),
    descAnuncio VARCHAR(255),
    descTelefone VARCHAR(50),
    descCelular VARCHAR(30),
    descEmailComercial VARCHAR(255),
    descImagem TEXT,
    activate INT DEFAULT 1,
    moderacao VARCHAR(100),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    dueDate DATETIME
  )`);

  await conn.execute(`CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descCPFCNPJ VARCHAR(150),
    descNome VARCHAR(255),
    descEmail VARCHAR(255),
    senha VARCHAR(255),
    codTipoUsuario VARCHAR(10),
    ativo INT DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('  Tabelas verificadas/criadas com sucesso');
}

async function main() {
  console.log('=== SEED COMPLETO MINISITIO ===\n');

  let conn;
  try {
    conn = await getConnection();
    console.log('Conectado ao banco!\n');

    // 1. Garantir que as tabelas existem
    await ensureTables(conn);

    // 2. Seed UF
    console.log('\nPopulando UFs...');
    const ufSqlPath = path.resolve(__dirname, 'seed_uf.sql');
    if (fs.existsSync(ufSqlPath)) {
      await runSqlFile(conn, ufSqlPath, 'UFs');
    } else {
      const ufFullPath = path.resolve(__dirname, 'uf_full.sql');
      await runSqlFile(conn, ufFullPath, 'UFs (full)');
    }

    // 3. Seed cadernos (cidades)
    console.log('\nPopulando cadernos/cidades...');
    const cadernoPath = path.resolve(__dirname, 'caderno_full_fixed.sql');
    await runSqlFile(conn, cadernoPath, 'Cadernos');

    console.log('\n=== SEED CONCLUÍDO ===');
    process.exit(0);
  } catch (err) {
    console.error('\nERRO:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}

main();
