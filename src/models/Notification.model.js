const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notificiation = sequelize.define(
  "Notification",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("نجاح", "خطأ", "تحذير" , "معلومات"),
      defaultValue: "معلومات",
    },
    send_to : {
    type: DataTypes.ENUM(  'voter',
      'observer',
      'coordinator',
      'center_manager',
      'district_manager',
      'finance_auditor',
      'system_admin', 
      "owner", "all"),
      defaultValue : "all"
      

    }
  },
  {
    tableName: "notifications",
    timestamps: true,
  }
);

module.exports = Notificiation;

