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

const Log = require("./log.model");

const initModels = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

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
    User.hasOne(Coordinator, { foreignKey: "user_id", onDelete: "SET NULL" });

    // ========== علاقة N:N بين Coordinator و ElectionCenter ==========
    Coordinator.belongsToMany(ElectionCenter, {
      through: CoordinatorElectionCenter,
      foreignKey: "coordinator_id",
            onDelete: "SET NULL"

    });

    ElectionCenter.belongsToMany(Coordinator, {
      through: CoordinatorElectionCenter,
      foreignKey: "election_center_id",
            onDelete: "SET NULL"

    });

    // DistrictManager belongs to Governorate
    DistrictManager.belongsTo(Governorate, { foreignKey: "governorate_id" ,       onDelete: "SET NULL"
});
    Governorate.hasMany(DistrictManager, { foreignKey: "governorate_id" ,       onDelete: "SET NULL"
 });

    // DistrictManager belongs to District
    DistrictManager.belongsTo(District, { foreignKey: "district_id" ,       onDelete: "SET NULL"
});
    District.hasMany(DistrictManager, { foreignKey: "district_id" ,       onDelete: "SET NULL"
});

    // DistrictManager belongs to ElectionCenter
    DistrictManager.belongsTo(ElectionCenter, {
      foreignKey: "election_centers_id",
      onDelete: "SET NULL",
    });
    ElectionCenter.hasMany(DistrictManager, {
      foreignKey: "election_centers_id",
      onDelete: "SET NULL",
    });
    //

    // Station
    Station.belongsTo(ElectionCenter, { foreignKey: "election_center_id" ,       onDelete: "SET NULL"
});
    ElectionCenter.hasMany(Station, { foreignKey: "election_center_id" ,       onDelete: "SET NULL"
 });

    // Tapes
    Tapes.belongsTo(Station, { foreignKey: "station_id"  ,       onDelete: "SET NULL"
});
    Station.hasMany(Tapes, { foreignKey: "station_id" ,       onDelete: "SET NULL"
});

    Tapes.belongsTo(ElectionCenter, { foreignKey: "election_center_id" , onDelete: "SET NULL" });
    ElectionCenter.hasMany(Tapes, { foreignKey: "election_center_id" , onDelete: "SET NULL" });

    //
Coordinator.belongsTo(User, { foreignKey: "user_id", onDelete: "SET NULL" });
User.hasMany(Coordinator, { foreignKey: "user_id", onDelete: "SET NULL" });

Coordinator.belongsToMany(ElectionCenter, {
      through: CoordinatorElectionCenter,
      foreignKey: "election_center_id",
      onDelete : "SET NULL"
    });
    ElectionCenter.belongsToMany(Coordinator, {
      through: CoordinatorElectionCenter,
      foreignKey: "election_center_id",
            onDelete : "SET NULL"

    });
    ElectionCenter.belongsToMany(Coordinator, {
  through: "CoordinatorElectionCenter",
  foreignKey: "election_center_id",
});
Coordinator.belongsToMany(ElectionCenter, {
  through: "CoordinatorElectionCenter",
  foreignKey: "coordinator_id",
});


    DistrictManager.belongsTo(User, { foreignKey: "user_id" ,       onDelete : "SET NULL"
});
    DistrictManager.belongsToMany(ElectionCenter, {
      through: DistrictManagerElectionCenter,
      foreignKey: "district_manager_id",
            onDelete : "SET NULL"

    });

    ElectionCenter.belongsToMany(DistrictManager, {
      through: DistrictManagerElectionCenter,
      foreignKey: "election_center_id",
      onDelete : "SET NULL"
    });

    await sequelize.sync();
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
};
