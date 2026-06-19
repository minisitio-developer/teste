/**
 * backup-database.js
 * 
 * Script de backup automático do banco de dados MySQL.
 * Uso: node back/backup-database.js
 * 
 * Configurável via variáveis de ambiente:
 *   BACKUP_DIR - diretório de destino (default: ./backups)
 *   BACKUP_RETENTION_DAYS - dias para manter backups (default: 30)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, 'backups');
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3307';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_NAME = process.env.DB_NAME || 'minisitio_local';

function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        console.log(`✓ Diretório de backup criado: ${BACKUP_DIR}`);
    }
}

function createBackup() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup_${DB_NAME}_${timestamp}.sql.gz`;
    const filepath = path.join(BACKUP_DIR, filename);

    const cmd = `mysqldump -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} | gzip > "${filepath}"`;

    try {
        console.log(`Iniciando backup: ${filename}`);
        execSync(cmd, { stdio: 'pipe' });

        const stats = fs.statSync(filepath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`✓ Backup concluído: ${filename} (${sizeMB} MB)`);

        return filepath;
    } catch (err) {
        console.error(`✗ Erro no backup: ${err.message}`);
        return null;
    }
}

function cleanOldBackups() {
    const now = Date.now();
    const cutoff = now - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    let removed = 0;

    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup_') && f.endsWith('.sql.gz'));

    for (const file of files) {
        const filepath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filepath);
        if (stats.mtimeMs < cutoff) {
            fs.unlinkSync(filepath);
            console.log(`  Removido: ${file}`);
            removed++;
        }
    }

    if (removed > 0) {
        console.log(`✓ ${removed} backup(s) antigo(s) removido(s) (>${RETENTION_DAYS} dias)`);
    }
}

// Executar
ensureBackupDir();
const result = createBackup();
if (result) {
    cleanOldBackups();
    console.log('✓ Processo de backup finalizado.');
} else {
    process.exit(1);
}
