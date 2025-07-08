const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NotificationRecipient = sequelize.define("NotificationRecipient", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
     references: {
        model: "users",
        key: "id",
      },
  },
  notification_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
     references: {
        model: "notifications",
        key: "id",
      },
  },
  isRead: {
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
