const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Location = sequelize.define("Location", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8), 
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8), 
    allowNull: false,
  },
}, {
  tableName: "locations",
  timestamps: true,
});

module.exports = Location;
