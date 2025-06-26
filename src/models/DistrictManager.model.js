const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DistrictManager = sequelize.define('DistrictManager', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  governorate_id: { // محافظة
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'governorates',
      key: 'id'
    }
  },
  district_id: { // قضاء
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'districts',
      key: 'id'
    }
  },
  election_centers_id: { // المراكز
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'election_centers',
      key: 'id'
    }
  }
}, {
  tableName: 'district_managers',
  timestamps: true
});

module.exports = DistrictManager;