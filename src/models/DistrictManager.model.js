const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DistrictManager = sequelize.define(
  "DistrictManager",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "district_managers",
    timestamps: false,
  }
);

module.exports = DistrictManager;
