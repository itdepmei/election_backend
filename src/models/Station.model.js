const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Station = sequelize.define(
  "Station",
  {
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    election_center_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "election_centers",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Station",
    tableName: "stations",
    underscored: true,
    timestamps: true,
  }
);

module.exports = Station;
