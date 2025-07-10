const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Budget = sequelize.define("Budget", {
  campaign_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: "campaigns",
      key: "id",
    },
  },
  total_capital: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  total_expenses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  remaining_balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "budgets",
  timestamps: true,
});

module.exports = Budget;
