// Subdistrict Controllers
const Subdistrict = require("../models/Subdistrict.model");
const District = require("../models/District.model");
const Governorate = require("../models/Governate.model");
const ElectionCenter = require("../models/ElectionCenter.model");
const { User } = require("../models");
const sequelize = require("../config/database");
const { addLog } = require("../utils/Logger");

exports.createSubdistricts = async (req, res) => {
  try {
    const data = req.body;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({ message: "لم يتم إرسال أي بيانات" });
    }

    const records = Array.isArray(data) ? data : [data];

    // تحقق من الأقضية دفعة وحدة
    const invalidDistrict = await Promise.all(
      records.map(async (item) => {
        const district = await District.findByPk(item.district_id);
        return district ? null : item.district_id;
      })
    ).then(results => results.find(id => id !== null));

    if (invalidDistrict) {
      return res.status(400).json({ message: `القضاء غير موجود بالمعرّف: ${invalidDistrict}` });
    }

    // تحقق من المحافظات دفعة وحدة
    const invalidGovernorate = await Promise.all(
      records.map(async (item) => {
        const governorate = await Governorate.findByPk(item.governorate_id);
        return governorate ? null : item.governorate_id;
      })
    ).then(results => results.find(id => id !== null));

    if (invalidGovernorate) {
      return res.status(400).json({ message: `المحافظة غير موجودة بالمعرّف: ${invalidGovernorate}` });
    }

    const newSubdistricts = await Subdistrict.bulkCreate(records, {
      ignoreDuplicates: true,
    });

    await addLog({
      fullname: req.user?.full_name || "مستخدم مجهول",
      action: "إضافة",
      message: `تم إنشاء ${newSubdistricts.name} ناحية`,
    });

    res.status(201).json({ data: newSubdistricts });
  } catch (err) {
    res.status(500).json({ message: "فشل في إنشاء النواحي", error: err.message });
  }
};


exports.getAllSubdistricts = async (req, res) => {
  try {
    const subdistricts = await Subdistrict.findAll({
      attributes: [
        "id",
        "name",
        [sequelize.col("Governorate.name"), "governorate"],
        [sequelize.col("District.name"), "district"],
      ],
      include: [
        { model: District, attributes: [] },
        { model: Governorate, attributes: [] },
        { model: ElectionCenter, attributes: ["id"] },
        { model: User, attributes: ["id", "confirmed_voting"] },
      ],
      group: ["Subdistrict.id", "Governorate.name", "District.name"],
    });

    const data = subdistricts.map((sub) => {
      const obj = sub.get({ plain: true });
      obj.election_centers_count = obj.ElectionCenters?.length || 0;
      obj.users_count = obj.Users?.length || 0;
      obj.confirmed_voting_users_count = obj.Users
        ? obj.Users.filter((user) => user.confirmed_voting === true).length
        : 0;

      delete obj.ElectionCenters;
      delete obj.Users;
      return obj;
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({
      message: "فشل في جلب قائمة النواحي",
      error: err.message,
    });
  }
};

exports.getSubdistrictById = async (req, res) => {
  try {
    const { id } = req.params;

    const subdistrict = await Subdistrict.findOne({
      where: { id },
      attributes: [
        "id",
        "name",
        [sequelize.col("District.name"), "district_name"],
        [sequelize.col("Governorate.name"), "governorate_name"],
      ],
      include: [
        { model: District, attributes: [] },
        { model: Governorate, attributes: [] },
        { model: ElectionCenter, attributes: ["id"] },
        { model: User, attributes: ["id", "confirmed_voting"] },
      ],
    });

    if (!subdistrict) {
      return res.status(404).json({ message: "الناحية غير موجودة" });
    }

    const plainSub = subdistrict.get({ plain: true });

    plainSub.election_centers_count = plainSub.ElectionCenters?.length || 0;
    plainSub.users_count = plainSub.Users?.length || 0;
    plainSub.confirmed_voting_users_count = plainSub.Users
      ? plainSub.Users.filter((user) => user.confirmed_voting === true).length
      : 0;

    delete plainSub.ElectionCenters;
    delete plainSub.Users;

    res.json({ data: plainSub });
  } catch (err) {
    console.error("خطأ في جلب الناحية حسب المعرّف:", err);
    res.status(500).json({
      message: "فشل في جلب معلومات الناحية",
      error: err.message,
    });
  }
};

exports.updateSubdistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, district_id } = req.body;

    const subdistrict = await Subdistrict.findByPk(id);
    if (!subdistrict) {
      return res.status(404).json({ message: "الناحية غير موجودة" });
    }

    if (district_id) {
      const district = await District.findByPk(district_id);
      if (!district) {
        return res.status(400).json({ message: "القضاء غير موجود" });
      }
    }

    await subdistrict.update({ name, district_id });
    await addLog({
      fullname: req.user?.full_name || "مستخدم مجهول",
      action: "تعديل",
      message: `تم تعديل الناحية: ${subdistrict.name}`,
    });

    res.status(200).json({ data: subdistrict });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تحديث الناحية", error: err.message });
  }
};

exports.deleteSubdistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const subdistrict = await Subdistrict.findByPk(id);
    if (!subdistrict) {
      return res.status(404).json({ message: "الناحية غير موجودة" });
    }
    await subdistrict.destroy();
    await addLog({
      fullname: req.user?.full_name || "مستخدم مجهول",
      action: "حذف",
      message: `تم حذف الناحية: ${subdistrict.name} `,
    });

    res.status(205).json({ message: "تم حذف الناحية بنجاح" });
  } catch (err) {
    res.status(500).json({
      message: "فشل في حذف الناحية",
      error: err.message,
    });
  }
};

exports.deleteAllSubdistricts = async (req, res) => {
  try {
    await Subdistrict.destroy({ where: {}, truncate: true });
    await addLog({
      fullname: req.user?.full_name || "مستخدم مجهول",
      action: "حذف الكل",
      message: "تم حذف جميع النواحي من النظام",
    });

    res.status(205).json({ message: "تم حذف جميع النواحي" });
  } catch (err) {
    res.status(500).json({
      message: "فشل في حذف جميع النواحي",
      error: err.message,
    });
  }
};
