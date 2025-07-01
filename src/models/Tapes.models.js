const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
  status : {
    type: DataTypes.ENUM('مقبول', 'مرفوض' , 'قيد المراجعة'),
    defaultValue: 'قيد المراجعة'

  },
  added_by : {
    type: DataTypes.INTEGER ,
    allowNull:true,
    references: {
      model: "users",
      key: "id",
      },
  }
} , {
  tableName: 'Tapes',
  timestamps: true


});

module.exports = Tapes;
