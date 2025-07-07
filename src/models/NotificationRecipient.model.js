const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NotificationRecipient = sequelize.define("NotificationRecipient", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notification_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "notification_recipients",
  timestamps: true,
});

module.exports = NotificationRecipient;
