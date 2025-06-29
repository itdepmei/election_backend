// models/Log.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // adjust path as needed

const Log = sequelize.define("Log", {
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "User name is required" },
      notEmpty: { msg: "User name cannot be empty" },
    },
  },

  action: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "Action is required" },
      notEmpty: { msg: "Action cannot be empty" },
    },
  },

  message: {
    type: DataTypes.STRING(1000),
    allowNull: false,
    validate: {
      notNull: { msg: "Message is required" },
      notEmpty: { msg: "Message cannot be empty" },
    },
  },
}, {
  timestamps: true, 
  tableName: "logs", 
});

module.exports = Log;
