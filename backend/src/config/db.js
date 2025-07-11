// backend/src/config/db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Usamos console.debug para loguear las consultas SQL
const logSql = (sql) => console.debug(`[SQL] ${sql}`);

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: logSql,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
    },
    define: {
      timestamps: true,
      paranoid: true,
      underscored: true
    }
  }
);

module.exports = sequelize;
