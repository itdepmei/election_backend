const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coordinator = sequelize.define('Coordinator', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,

    references: {
      model: 'users',
      key: 'id',
    },
  },
  election_centers_id :{
    type: DataTypes.INTEGER,
    allowNull: false,

    references: {
        model: 'election_centers',
        key: 'id',
        },
  },
}, {
  sequelize,
  modelName: 'Coordinator',
  tableName: 'coordinators',
  timestamps: true, 
});

module.exports = Coordinator;
