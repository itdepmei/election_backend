const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Expense = sequelize.define(
  "Expense",
  {
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    added_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    campaign_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'campaigns',
      key: 'id',
    },
  },

  },
  {
    tableName: "expenses",
    timestamps: true,
  }
);

module.exports = Expense;
