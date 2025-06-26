const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Governorate = require('./Governate.model');

const Subdistrict = sequelize.define('Subdistrict', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'districts',
      key: 'id'
    }
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
  tableName: 'subdistricts',
  timestamps: false
});

module.exports = Subdistrict;
