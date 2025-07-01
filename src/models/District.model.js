const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const District = sequelize.define('District', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  governorate_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'governorates',
      key: 'id'
    }

  },
  

}, {
  tableName: 'districts',
  timestamps: false
});

module.exports = District;
