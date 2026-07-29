'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

const config = (() => {
  const hasEnvDbConfig = process.env.DB_HOST || process.env.DB_PORT || process.env.DB_USER || process.env.DB_PASSWORD || process.env.DB_NAME;

  if (hasEnvDbConfig) {
    return {
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false
    };
  }

  try {
    return require(
      path.join(__dirname, '..', 'config', 'config.json')
    )[env];
  } catch (error) {
    return require('../config/database');
  }
})();

const db = {};

let sequelize;

if (process.env.NODE_ENV === 'production' || process.env.DB_HOST) {
  // Conexão direta via variáveis de ambiente para produção (Render + TiDB)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 4000, // Porta 4000 do TiDB Cloud
      dialect: 'mysql',
      dialectOptions: {
        ssl: {
          rejectUnauthorized: true // Obrigatório para o TiDB Cloud
        }
      },
      logging: false
    }
  );
}
 else if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable],
    config
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(
      path.join(__dirname, file)
    )(
      sequelize,
      Sequelize.DataTypes
    );

    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;