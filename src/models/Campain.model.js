const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

  const Campaign = sequelize.define('Campaign', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  }, {
    tableName: 'campaigns',
    timestamps: true,
  });


module.exports = Campaign