/**
 * migrate-passwords.js
 * 
 * MIGRAÇÃO ÚNICA: Converte senhas plain-text existentes para bcrypt hash.
 * 
 * Uso: node back/migrate-passwords.js
 * 
 * ATENÇÃO: Execute apenas UMA vez. O script detecta automaticamente
 * senhas já hashadas (prefixo $2a$) e as pula.
 */

const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load .env from correct location
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'minisitio_local',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3307,
        dialect: 'mysql',
        logging: false,
    }
);

const Users = sequelize.define('usuario', {
    codUsuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    descNome: DataTypes.STRING,
    descEmail: DataTypes.STRING,
    senha: DataTypes.STRING,
    ativo: DataTypes.STRING,
}, { tableName: 'usuario', timestamps: false });

const BCRYPT_ROUNDS = 10;

async function migrate() {
    console.log('=== Migração de Senhas: plain-text → bcrypt ===\n');

    try {
        await sequelize.authenticate();
        console.log('✓ Conectado ao banco de dados\n');

        // Find all users
        const users = await Users.findAll();
        console.log(`✓ Total de usuários encontrados: ${users.length}\n`);

        let migrated = 0;
        let skipped = 0;
        let errors = 0;

        for (const user of users) {
            const currentPassword = user.senha;

            if (!currentPassword) {
                console.log(`  ⚠ ${user.descNome || user.codUsuario} — senha vazia, pulando`);
                skipped++;
                continue;
            }

            // Already hashed? Skip.
            if (currentPassword.startsWith('$2a$') || currentPassword.startsWith('$2b$')) {
                console.log(`  ✓ ${user.descNome || user.codUsuario} — já hashada, pulando`);
                skipped++;
                continue;
            }

            // Hash the plain-text password
            try {
                const hashed = await bcrypt.hash(currentPassword, BCRYPT_ROUNDS);
                await Users.update(
                    { senha: hashed },
                    { where: { codUsuario: user.codUsuario } }
                );
                console.log(`  🔒 ${user.descNome || user.codUsuario} — migrada com sucesso`);
                migrated++;
            } catch (err) {
                console.log(`  ✗ ${user.descNome || user.codUsuario} — ERRO: ${err.message}`);
                errors++;
            }
        }

        console.log('\n=== Resultado ===');
        console.log(`  Migradas: ${migrated}`);
        console.log(`  Puladas:  ${skipped}`);
        console.log(`  Erros:    ${errors}`);
        console.log('\n✓ Migração concluída!\n');

    } catch (err) {
        console.error('✗ Erro na migração:', err.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

migrate();
