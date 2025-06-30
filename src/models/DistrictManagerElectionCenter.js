const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const DistrictManagerElectionCenter = sequelize.define("DistrictManagerElectionCenter", {
  district_manager_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'district_managers',
      key: 'id',
    },
    primaryKey: true,
  },
  election_center_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'election_centers',
      key: 'id',
    },
    primaryKey: true,
  },
}, {
  tableName: "District_managers_centers",
  timestamps: false,
  uniqueKeys: {
    short_unique: { // اسم بسيط قصير
      fields: ['district_manager_id', 'election_center_id']
    }
  }
});

module.exports = DistrictManagerElectionCenter