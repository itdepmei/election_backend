// models/DistrictManagerElectionCenter.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DistrictManagerElectionCenter = sequelize.define("DistrictManagerElectionCenter", {
  district_manager_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'district_managers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  election_center_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'election_centers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: "district_manager_center",
  timestamps: false,
  uniqueKeys: {
    district_election_unique: {
      fields: ['district_manager_id', 'election_center_id']
    }
  }
});


module.exports = DistrictManagerElectionCenter;
