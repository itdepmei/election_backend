const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Payment = sequelize.define("Payment", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  amount: {
    type: DataTypes.INTEGER, 
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  added_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;
