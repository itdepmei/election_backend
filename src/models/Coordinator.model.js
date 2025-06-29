const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coordinator = sequelize.define('Coordinator', {
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
}, {
  sequelize,
  modelName: 'Coordinator',
  tableName: 'coordinators',
  timestamps: true, 
});

module.exports = Coordinator;
