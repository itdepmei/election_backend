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
      first_name: req.user?.first_name || "",
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name || "",
      campaign_id: req.user?.campaign_id || null,
      action: "إضافة",
      message: `تم إنشاء ناحية`,
    });

    res.status(201).json({ data: newSubdistricts });
  } catch (err) {
    res.status(500).json({ message: "فشل في إنشاء النواحي", error: err.message });
  }
};


exports.getAllSubdistricts = async (req, res) => {
  try {
    const subdistricts = await Subdistrict.findAll({
      attributes: ["id", "name"],
      include: [
        { model: District, attributes: ["id", "name"] },
        { model: Governorate, attributes: ["id", "name"] },
        { model: ElectionCenter, attributes: ["id"] },
        { model: User, attributes: ["id", "confirmed_voting"] },
      ],
    });

    const data = subdistricts.map((sub) => {
      const obj = sub.get({ plain: true });

      obj.district = obj.District
        ? { id: obj.District.id, name: obj.District.name }
        : null;

      obj.governorate = obj.Governorate
        ? { id: obj.Governorate.id, name: obj.Governorate.name }
        : null;

      obj.election_centers_count = obj.ElectionCenters?.length || 0;
      obj.users_count = obj.Users?.length || 0;
      obj.confirmed_voting_users_count = obj.Users
        ? obj.Users.filter((user) => user.confirmed_voting === true).length
        : 0;

      delete obj.District;
      delete obj.Governorate;
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
      attributes: ["id", "name"],
      include: [
        { model: District, attributes: ["id", "name"] },
        { model: Governorate, attributes: ["id", "name"] },
        { model: ElectionCenter, attributes: ["id"] },
        { model: User, attributes: ["id", "confirmed_voting"] },
      ],
    });

    if (!subdistrict) {
      return res.status(404).json({ message: "الناحية غير موجودة" });
    }

    const plainSub = subdistrict.get({ plain: true });

    plainSub.district = plainSub.District
      ? { id: plainSub.District.id, name: plainSub.District.name }
      : null;

    plainSub.governorate = plainSub.Governorate
      ? { id: plainSub.Governorate.id, name: plainSub.Governorate.name }
      : null;

    plainSub.election_centers_count = plainSub.ElectionCenters?.length || 0;
    plainSub.users_count = plainSub.Users?.length || 0;
    plainSub.confirmed_voting_users_count = plainSub.Users
      ? plainSub.Users.filter((user) => user.confirmed_voting === true).length
      : 0;

    delete plainSub.District;
    delete plainSub.Governorate;
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

exports.getSubdistrictsByDistrictId = async (req, res) => {
  const {id } = req.params;
  try {
    const subdistricts = await Subdistrict.findAll({
      where: { district_id: id },
      attributes: ["id", "name"],
      include: [
        { model: District, attributes: ["id", "name"] },
        { model: Governorate, attributes: ["id", "name"] },
        { model: ElectionCenter, attributes: ["id"] },
        { model: User, attributes: ["id", "confirmed_voting"] },
      ],
    });

    const data = subdistricts.map((sub) => {
      const obj = sub.get({ plain: true });

      obj.district = obj.District
        ? { id: obj.District.id, name: obj.District.name }
        : null;

      obj.governorate = obj.Governorate
        ? { id: obj.Governorate.id, name: obj.Governorate.name }
        : null;

      obj.election_centers_count = obj.ElectionCenters?.length || 0;
      obj.users_count = obj.Users?.length || 0;
      obj.confirmed_voting_users_count = obj.Users
        ? obj.Users.filter((user) => user.confirmed_voting === true).length
        : 0;

      delete obj.District;
      delete obj.Governorate;
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
      first_name: req.user?.first_name || "",
      last_name: req.user?.last_name || "",
      second_name: req.user?.second_name || "",
      campaign_id: req.user?.campaign_id || null, 
      action: "تعديل",
      message: `تم تعديل الناحية: ${subdistrict.name}`,
    });

    res.status(200).json({ data: subdistrict });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تعديل الناحية", error: err.message });
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
      first_name: req.user?.first_name || "",
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name || "",
      campaign_id: req.user?.campaign_id || null,
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
      first_name: req.user?.first_name || "",
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name || "",
      campaign_id: req.user?.campaign_id || null,
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
