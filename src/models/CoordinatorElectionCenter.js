const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const CoordinatorElectionCenter = sequelize.define("CoordinatorElectionCenter", {
  coordinator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'coordinators',
      key: 'id',
    },
  },
  election_center_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'election_centers',
      key: 'id',
    },
  },
}, {
  tableName: "coordinator_election_centers",
  timestamps: false,
  uniqueKeys: {
    coordinator_election_unique: {
      fields: ['coordinator_id', 'election_center_id']
    }
  }
});



module.exports = CoordinatorElectionCenter