const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ElectionCenter = sequelize.define('ElectionCenter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "اسم المركز"
  },
  governorate_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'governorates',
      key: 'id'
    }
  },
  district_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'districts',
      key: 'id'
    }
  },
  subdistrict_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'subdistricts',
      key: 'id'
    }
  },
  center_manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  code: {
    type: DataTypes.STRING,
    comment: "رمز مركز الاقتراع"
  },
  address: {
    type: DataTypes.STRING
  },
  supply_code: {
    type: DataTypes.STRING
  },
  supply_name: {
    type: DataTypes.STRING
  },
  registration_center_code: {
    type: DataTypes.STRING
  },
  registration_center_name: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'election_centers',
  timestamps: false
});

module.exports = ElectionCenter;
