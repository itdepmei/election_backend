const { ElectionCenter, User, sequelize } = require("../models");
const District = require("../models/District.model");
const Governorate = require("../models/Governate.model");
const Subdistrict = require("../models/Subdistrict.model");

// Create one or many districts with duplicate name check
// إنشاء أقضية
exports.createDistricts = async (req, res) => {
  try {
    const data = req.body;
    console.log("create", req.body);

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({ message: "لم يتم تزويد بيانات" });
    }

    const records = Array.isArray(data) ? data : [data];

    const governorateIds = records
      .map((r) => r.governorate_id)
      .filter((id) => id !== undefined);

    const existingGovernorates = await Governorate.findAll({
      where: { id: governorateIds },
    });

    const existingIds = existingGovernorates.map((g) => g.id);

    const invalidIds = governorateIds.filter((id) => !existingIds.includes(id));
    if (invalidIds.length > 0) {
      return res
        .status(400)
        .json({ message: "المحافظات التالية غير موجودة", invalidIds });
    }

    const names = records.map((r) => r.name);
    const existingDistricts = await District.findAll({
      where: { name: names },
    });
    const existingNames = existingDistricts.map((d) => d.name);

    const filteredRecords = records.filter(
      (r) => !existingNames.includes(r.name)
    );

    if (filteredRecords.length === 0) {
      return res
        .status(409)
        .json({
          message: "جميع الأسماء المدخلة موجودة مسبقًا",
          duplicates: existingNames,
        });
    }

    const newDistricts = await District.bulkCreate(filteredRecords);

    res.status(201).json({
      data: newDistricts,
    });
    await addLog({
      fullname: req.user?.full_name || "مستخدم مجهول",
      action: "إضافة",
      message: `تم إنشاء ${newDistricts.length} قضاء جديد`,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في إنشاء الأقضية", error: err.message });
  }
};

// جلب جميع الأقضية
exports.getAllDistricts = async (req, res) => {
  try {
    const districts = await District.findAll({
      attributes: [
        "id",
        "name",
        [sequelize.col("Governorate.name"), "governorate"],
      ],
      include: [
        { model: Governorate, attributes: [] },
        { model: Subdistrict, attributes: ["id"] },
        { model: ElectionCenter, attributes: ["id"] },
        { model: User, attributes: ["id", "confirmed_voting"] },
      ],
    });

    const data = districts.map((dist) => {
      const obj = dist.get({ plain: true });
      obj.subdistricts_count = obj.Subdistricts?.length || 0;
      obj.election_centers_count = obj.ElectionCenters?.length || 0;
      obj.users_count = obj.Users?.length || 0;
      obj.confirmed_voting_users_count = obj.Users
        ? obj.Users.filter((user) => user.confirmed_voting === true).length
        : 0;
      delete obj.Subdistricts;
      delete obj.ElectionCenters;
      delete obj.Users;
      return obj;
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب الأقضية", error: err.message });
  }
};

// جلب قضاء بواسطة ID
exports.getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;

    const district = await District.findOne({
      where: { id },
      attributes: [
        "id",
        "name",
        [sequelize.col("Governorate.name"), "governorate"],
      ],
      include: [
        { model: Governorate, attributes: [] },
        { model: Subdistrict, attributes: ["id"] },
        { model: ElectionCenter, attributes: ["id"] },
        { model: User, attributes: ["id", "confirmed_voting"] },
      ],
    });

    if (!district) {
      return res.status(404).json({ message: "القضاء غير موجود" });
    }

    const obj = district.get({ plain: true });
    obj.subdistricts_count = obj.Subdistricts?.length || 0;
    obj.election_centers_count = obj.ElectionCenters?.length || 0;
    obj.users_count = obj.Users?.length || 0;
    obj.confirmed_voting_users_count = obj.Users
      ? obj.Users.filter((user) => user.confirmed_voting === true).length
      : 0;

    delete obj.Subdistricts;
    delete obj.ElectionCenters;
    delete obj.Users;

    res.json({ data: obj });
   
  } catch (err) {
    console.error("خطأ أثناء جلب القضاء:", err);
    res.status(500).json({ message: "فشل في جلب القضاء", error: err.message });
  }
};

// تعديل قضاء
exports.updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, governorate_id } = req.body;
    const district = await District.findByPk(id);

    if (!district) {
      return res.status(404).json({ message: "القضاء غير موجود" });
    }

    if (name && name !== district.name) {
      const existing = await District.findOne({ where: { name } });
      if (existing) {
        return res.status(409).json({ message: "اسم القضاء موجود مسبقًا" });
      }
      district.name = name;
    }

    if (governorate_id !== undefined) {
      district.governorate_id = governorate_id;
    }

    await district.save();
     await addLog({
      fullname: req.user?.full_name || "مستخدم مجهول",
      action: "تعديل",
      message: `تم تعديل القضاء: ${district.name}`,
    });

    res.json({ data: district });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تعديل القضاء", error: err.message });
  }
};

// حذف قضاء
exports.deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const district = await District.findByPk(id);
    if (!district) {
      return res.status(404).json({ message: "القضاء غير موجود" });
    }
    await district.destroy();
    res.json({ message: "تم حذف القضاء بنجاح" });
     await addLog({
      fullname: req.user?.full_name || "مستخدم مجهول",
      action: "حذف",
      message: `تم حذف القضاء: ${district.name}`,
    });
  } catch (err) {
    res.status(500).json({ message: "فشل في حذف القضاء", error: err.message });
  }
};

// حذف كل الأقضية
exports.deleteAllDistricts = async (req, res) => {
  try {
    await District.destroy({ truncate: true, cascade: true });
    res.json({ message: "تم حذف جميع الأقضية بنجاح" });
    await addLog({
  fullname: req.user?.full_name || "مستخدم مجهول",
  action: "حذف الكل",
  message: `تم حذف جميع الأقضية`,
});

  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في حذف جميع الأقضية", error: err.message });
  }
};
