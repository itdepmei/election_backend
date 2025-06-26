const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Governorate = sequelize.define('Governorate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code:{
    type: DataTypes.STRING(10),
    allowNull:true
    
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,

  }
}, {
  tableName: 'governorates',
  timestamps: false
});

module.exports = Governorate;
