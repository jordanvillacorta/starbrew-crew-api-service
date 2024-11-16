const { Sequelize } = require('sequelize');
const config = require('../config/db');

const sequelize = new Sequelize(config);

const models = {
    DataModel: require('./DataModel')(sequelize, Sequelize.DataTypes),
    AiModel: require('./AiModel')(sequelize, Sequelize.DataTypes),
};

module.exports = { sequelize, ...models };
