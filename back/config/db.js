const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dbConfig = {
    host: 'db',
    port: 3306,
    database: process.env.DB_NAME || 'minisitio_local',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
};

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    dialect: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    timezone: '-03:00',
    logging: isProduction ? false : console.log,
    dialectOptions: {
        charset: 'utf8mb4',
    },
    pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000,
    },
});

module.exports = sequelize;
