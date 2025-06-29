const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DistrictManager = sequelize.define('DistrictManager', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,


    references: {
      model: 'users',
      key: 'id',
    },
  },

  governorate_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null so ON DELETE SET NULL works
    references: {
      model: 'governorates',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },

  district_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'districts',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },

}, {
  tableName: 'district_managers',
  timestamps: false,
});

module.exports = DistrictManager;