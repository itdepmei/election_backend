const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const CoordinatorElectionCenter = sequelize.define("CoordinatorElectionCenter", {
  coordinator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'coordinators',
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
  tableName: "coordinator_election_centers",
  timestamps: false,
  uniqueKeys: {
    short_unique: { // اسم بسيط قصير
      fields: ['coordinator_id', 'election_center_id']
    }
  }
});

module.exports = CoordinatorElectionCenter