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
const initModels = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // ========== علاقات المحافظات والاقضية والنواحي ==========
    Governorate.hasMany(District, { foreignKey: "governorate_id" });
    Governorate.hasMany(Subdistrict , { foreignKey: "governorate_id" });
    District.belongsTo(Governorate, { foreignKey: "governorate_id" });
    Subdistrict.belongsTo(Governorate , {foreignKey: 'governorate_id'})

    District.hasMany(Subdistrict, { foreignKey: "district_id" });
    Subdistrict.belongsTo(District, { foreignKey: "district_id" });

    // ========== علاقات ElectionCenter مع Governorate, District, Subdistrict ==========
    ElectionCenter.belongsTo(Governorate, { foreignKey: "governorate_id" });
    Governorate.hasMany(ElectionCenter, { foreignKey: "governorate_id" });

    ElectionCenter.belongsTo(District, { foreignKey: "district_id" });
    District.hasMany(ElectionCenter, { foreignKey: "district_id" });

    ElectionCenter.belongsTo(Subdistrict, { foreignKey: "subdistrict_id" });
    Subdistrict.hasMany(ElectionCenter, { foreignKey: "subdistrict_id" });

    // ========== علاقة ElectionCenter مع Center Manager ==========
    ElectionCenter.belongsTo(User, { as: "center_manager", foreignKey: "center_manager_id" });
    User.hasOne(ElectionCenter, { foreignKey: "center_manager_id" });

    // ========== علاقة User مع ElectionCenter كمركز ناخب ==========
    User.belongsTo(ElectionCenter, { foreignKey: "election_center_id" });
    ElectionCenter.hasMany(User, { foreignKey: "election_center_id" });

    // 
    User.belongsTo(Governorate, { foreignKey: "governorate_id" });
    Governorate.hasMany(User, { foreignKey: "governorate_id" });

    User.belongsTo(District, { foreignKey: "district_id" });
    District.hasMany(User, { foreignKey: "district_id" });

    User.belongsTo(Subdistrict, { foreignKey: "subdistrict_id" });
    Subdistrict.hasMany(User, { foreignKey: "subdistrict_id" });

    // ========== علاقة Coordinator مع User ==========
    Coordinator.belongsTo(User, { foreignKey: "user_id" });
    User.hasOne(Coordinator, { foreignKey: "user_id" });

    // ========== علاقة N:N بين Coordinator و ElectionCenter ==========
    Coordinator.belongsToMany(ElectionCenter, {
      through: "CoordinatorElectionCenter",
      foreignKey: "coordinator_id",
    });

    ElectionCenter.belongsToMany(Coordinator, {
      through: "CoordinatorElectionCenter",
      foreignKey: "election_center_id",
    });

        // DistrictManager belongs to Governorate
    DistrictManager.belongsTo(Governorate, { foreignKey: "governorate_id" });
    Governorate.hasMany(DistrictManager, { foreignKey: "governorate_id" });

    // DistrictManager belongs to District
    DistrictManager.belongsTo(District, { foreignKey: "district_id" });
    District.hasMany(DistrictManager, { foreignKey: "district_id" });

    // DistrictManager belongs to ElectionCenter
    DistrictManager.belongsTo(ElectionCenter, { foreignKey: "election_centers_id" });
    ElectionCenter.hasMany(DistrictManager, { foreignKey: "election_centers_id" });
    // 


    // Station 
    Station.belongsTo(ElectionCenter, { foreignKey: "election_center_id" });
    ElectionCenter.hasMany(Station, { foreignKey: "election_center_id" });

    // Tapes
    Tapes.belongsTo(Station, { foreignKey: "station_id" });
    Station.hasMany(Tapes, { foreignKey: "station_id" });

    Tapes.belongsTo(ElectionCenter , { foreignKey: "election_center_id" });
    ElectionCenter.hasMany(Tapes, { foreignKey: "election_center_id" });



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
  Tapes
};
