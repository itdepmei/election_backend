const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ElectionCenter = require("./ElectionCenter.model");
const Station = require("./Station.model");

const Tapes = sequelize.define("Tapes", {
  election_center_id: {
    type: DataTypes.INTEGER,
    references: {
      model: "election_centers",
      key: "id",
    },
  },
  station_id: {
    type: DataTypes.INTEGER,
    references: {
      model: "stations",
      key: "id",
    },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  tape_image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  notes : {
    type: DataTypes.STRING,
    allowNull: true,
  },
} , {
  tableName: 'Tapes',
  timestamps: false


});

module.exports = Tapes;
