const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

let dbConfig;

if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
    const url = new URL(process.env.DATABASE_URL || process.env.MYSQL_URL);
    dbConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        database: url.pathname.replace('/', ''),
        username: url.username,
        password: url.password,
    };
} else {
    const missing = [];
    if (!process.env.DB_HOST) missing.push('DB_HOST');
    if (!process.env.DB_USER) missing.push('DB_USER');
    if (!process.env.DB_PASSWORD) missing.push('DB_PASSWORD');
    if (!process.env.DB_NAME) missing.push('DB_NAME');
    if (missing.length > 0) {
        throw new Error(`Missing required env vars: ${missing.join(', ')}`);
    }
    dbConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };
}

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    dialect: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    timezone: '-03:00',
    logging: false,
    dialectOptions: {
        charset: 'utf8mb4',
        ssl: isProduction ? { require: true, rejectUnauthorized: false } : false,
    },
    pool: {
        max: 20,
        min: 2,
        acquire: 30000,
        idle: 10000,
        evict: 10000,
    },
    retry: {
        max: 5,
        match: [/ETIMEDOUT/, /ECONNREFUSED/, /ER_LOCK_DEADLOCK/, /SequelizeConnectionError/],
    },
});

module.exports = sequelize;
