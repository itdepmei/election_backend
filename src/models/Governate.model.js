const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Governorate = sequelize.define('Governorate', {
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
