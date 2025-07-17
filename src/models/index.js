const sequelize = require("../config/database");

const User = require("./user.model");
const ElectionCenter = require("./ElectionCenter.model");
const Coordinator = require("./Coordinator.model");
const Governorate = require("./Governate.model");
const District = require("./District.model");
const Subdistrict = require("./Subdistrict.model");
const DistrictManager = require("./DistrictManager.model");
const Station = require("./Station.model");
const Tapes = require("./Tapes.models");
const CoordinatorElectionCenter = require("./CoordinatorElectionCenter");
const DistrictManagerElectionCenter = require("./DistrictManagerElectionCenter");
const Campaign = require("./Campain.model");
const Log = require("./log.model");
const FinanceCapital = require("./FinanceCapital.model");
const Expense = require("./Expense.model");
const NotificationRecipient = require("./NotificationRecipient.model");
const Notificiation = require("./Notification.model");
const Budget = require("./Budget.model");

const initModels = async () => {
  try {
    await sequelize.authenticate();

    // ========== علاقات المحافظات والاقضية والنواحي ==========
    Governorate.hasMany(District, {
      foreignKey: "governorate_id",
      onDelete: "CASCADE",
    });
    Governorate.hasMany(Subdistrict, {
      foreignKey: "governorate_id",
      onDelete: "CASCADE",
    });
    District.belongsTo(Governorate, {
      foreignKey: "governorate_id",
      onDelete: "CASCADE",
    });
    Subdistrict.belongsTo(Governorate, {
      foreignKey: "governorate_id",
      onDelete: "CASCADE",
    });

    District.hasMany(Subdistrict, {
      foreignKey: "district_id",
      onDelete: "CASCADE",
    });
    Subdistrict.belongsTo(District, {
      foreignKey: "district_id",
      onDelete: "CASCADE",
    });

    // ========== علاقات ElectionCenter مع Governorate, District, Subdistrict ==========
    ElectionCenter.belongsTo(Governorate, {
      foreignKey: "governorate_id",
      onDelete: "CASCADE",
    });
    Governorate.hasMany(ElectionCenter, {
      foreignKey: "governorate_id",
      onDelete: "CASCADE",
    });

    ElectionCenter.belongsTo(District, {
      foreignKey: "district_id",
      onDelete: "CASCADE",
    });
    District.hasMany(ElectionCenter, {
      foreignKey: "district_id",
      onDelete: "CASCADE",
    });

    ElectionCenter.belongsTo(Subdistrict, {
      foreignKey: "subdistrict_id",
      onDelete: "CASCADE",
    });
    Subdistrict.hasMany(ElectionCenter, {
      foreignKey: "subdistrict_id",
      onDelete: "CASCADE",
    });

    // ========== علاقة ElectionCenter مع Center Manager ==========
    ElectionCenter.belongsTo(User, {
      as: "center_manager",
      foreignKey: "center_manager_id",
      onDelete: "SET NULL",
    });
    User.hasOne(ElectionCenter, {
      foreignKey: "center_manager_id",
      onDelete: "SET NULL",
    });

    // ========== علاقة User مع ElectionCenter كمركز ناخب ==========
    User.belongsTo(ElectionCenter, {
      foreignKey: "election_center_id",
      onDelete: "SET NULL",
    });
    ElectionCenter.hasMany(User, {
      foreignKey: "election_center_id",
      onDelete: "SET NULL",
    });

    //
    User.belongsTo(Governorate, {
      foreignKey: "governorate_id",
      onDelete: "SET NULL",
    });
    Governorate.hasMany(User, {
      foreignKey: "governorate_id",
      onDelete: "SET NULL",
    });

    User.belongsTo(District, {
      foreignKey: "district_id",
      onDelete: "SET NULL",
    });
    District.hasMany(User, { foreignKey: "district_id", onDelete: "SET NULL" });

    User.belongsTo(Subdistrict, {
      foreignKey: "subdistrict_id",
      onDelete: "SET NULL",
    });
    Subdistrict.hasMany(User, {
      foreignKey: "subdistrict_id",
      onDelete: "SET NULL",
    });

    // ========== علاقة Coordinator مع User ==========
    Coordinator.belongsTo(User, {
      foreignKey: "user_id",
      onDelete: "SET NULL",
    });

    // ========== علاقة N:N بين Coordinator و ElectionCenter ==========

    // Station
    Station.belongsTo(ElectionCenter, {
      foreignKey: "election_center_id",
      onDelete: "SET NULL",
    });
    ElectionCenter.hasMany(Station, {
      foreignKey: "election_center_id",
      onDelete: "SET NULL",
    });

    // Tapes
    Tapes.belongsTo(Station, {
      foreignKey: "station_id",
      onDelete: "CASCADE",
    });
    Station.hasMany(Tapes, { foreignKey: "station_id", onDelete: "CASCADE" });

    Tapes.belongsTo(ElectionCenter, {
      foreignKey: "election_center_id",
      onDelete: "CASCADE",
    });
    ElectionCenter.hasMany(Tapes, {
      foreignKey: "election_center_id",
      onDelete: "CASCADE",
    });

    Tapes.belongsTo(User, { foreignKey: "added_by", onDelete: "SET NULL" });

    User.hasMany(Tapes, { foreignKey: "added_by", onDelete: "SET NULL" });
    User.belongsTo(Campaign, {
  foreignKey: 'campaign_id',
});

// Campaign has many users
Campaign.hasMany(User, {
  foreignKey: 'campaign_id',
});

    

    //
    Coordinator.belongsTo(User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    User.hasMany(Coordinator, { foreignKey: "user_id", onDelete: "CASCADE" });

    Coordinator.belongsToMany(ElectionCenter, {
      through: CoordinatorElectionCenter,
      foreignKey: "coordinator_id",
      otherKey: "election_center_id",
      onDelete: "CASCADE",
    });

    ElectionCenter.belongsToMany(Coordinator, {
      through: CoordinatorElectionCenter,
      foreignKey: "election_center_id",
      otherKey: "coordinator_id",
      onDelete: "CASCADE",
    });

    DistrictManager.belongsTo(User, {
      foreignKey: "user_id",
      onDelete: "SET NULL",
    });

    DistrictManager.belongsToMany(ElectionCenter, {
      through: DistrictManagerElectionCenter,
      foreignKey: "district_manager_id",
      otherKey: "election_center_id",
    });
    ElectionCenter.belongsToMany(DistrictManager, {
      through: DistrictManagerElectionCenter,
      foreignKey: "election_center_id",
      otherKey: "district_manager_id",
    });

    /// finance

    FinanceCapital.belongsTo(User, {
      foreignKey: "added_by",
      onDelete: "CASCADE",
      
    });

    User.hasMany(FinanceCapital, {
      foreignKey: "added_by",
      onDelete: "CASCADE",
    });

    Expense.belongsTo(User, {
      foreignKey: "added_by",
      onDelete: "SET NULL",
    });

    User.hasMany(Expense, {
      foreignKey: "added_by",
      onDelete: "SET NULL",
    });

    Campaign.hasMany(FinanceCapital, { foreignKey: "campaign_id" });
    Campaign.hasMany(Expense, { foreignKey: "campaign_id" });
    Campaign.hasMany(Budget, { foreignKey: "campaign_id" });



    /// notification
    NotificationRecipient.belongsTo(Notificiation, {
      foreignKey: "notification_id",
      onDelete: "CASCADE",
    });
    Notificiation.hasMany(NotificationRecipient, {
      foreignKey: "notification_id",
      onDelete: "CASCADE",
    });

    NotificationRecipient.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
User.hasMany(NotificationRecipient, {
  foreignKey: "user_id",
});


    
await sequelize.sync({ alter: true });
    console.log("✅ Models synced");
  } catch (err) {
    console.log("❌ DB Error:", err);
  }
};

module.exports = {
  initModels,
  sequelize,
  User,
  ElectionCenter,
  Coordinator,
  Governorate,
  District,
  Subdistrict,
  DistrictManager,
  Station,
  Tapes,
  Notificiation,
  NotificationRecipient,
};
