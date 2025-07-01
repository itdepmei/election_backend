const Governorate = require("../models/Governate.model");
const District = require("../models/District.model");
const Subdistrict = require("../models/Subdistrict.model");
const ElectionCenter = require("../models/ElectionCenter.model");
const { User } = require("../models");
const { addLog } = require("../utils/Logger");

// POST - Create one or many governorates
// إنشاء المحافظات
exports.createGovernorates = async (req, res) => {
  try {
    const data = req.body;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({ message: "لم يتم إرسال بيانات" });
    }

    const records = Array.isArray(data) ? data : [data];

    const names = records.map((r) => r.name);
    const codes = records.map((r) => r.code);

    const existing = await Governorate.findAll({
      where: { name: names, code: codes },
    });

    const existingNames = existing.map((g) => g.name);
    const existingCodes = existing.map((g) => g.code);

    const filteredRecords = records.filter(
      (r) => !existingNames.includes(r.name) && !existingCodes.includes(r.code)
    );

    if (filteredRecords.length === 0) {
      return res.status(409).json({
        message: "جميع المحافظات المدخلة موجودة مسبقاً",
        duplicateNames: existingNames,
        duplicateCodes: existingCodes,
      });
    }

    const newGovernorates = await Governorate.bulkCreate(filteredRecords);
    await addLog({
      first_name: req.user?.first_name || "",
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name || "",
      action: "اضافة",
      message: `تم اضافة محافظة: ${filteredRecords
        .map((r) => r.name)
        .join(", ")}`,
    });

    res.status(201).json({
      data: newGovernorates,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في إنشاء المحافظات", error: err.message });
  }
};

// جلب جميع المحافظات مع الإحصائيات
exports.getGovernorates = async (req, res) => {
  try {
    const governorates = await Governorate.findAll({
      include: [
        { model: District, attributes: ["id"] },
        { model: Subdistrict, attributes: ["id"] },
        { model: ElectionCenter, attributes: ["id"] },
        { model: User, attributes: ["id", "confirmed_voting"] },
      ],
    });

    const data = governorates.map((gov) => {
      const obj = gov.get({ plain: true });
      obj.districts_count = obj.Districts ? obj.Districts.length : 0;
      obj.subdistricts_count = obj.Subdistricts ? obj.Subdistricts.length : 0;
      obj.election_centers_count = obj.ElectionCenters
        ? obj.ElectionCenters.length
        : 0;
      obj.users_count = obj.Users ? obj.Users.length : 0;
      obj.confirmed_voting_users_count = obj.Users
        ? obj.Users.filter((user) => user.confirmed_voting === true).length
        : 0;

      delete obj.Districts;
      delete obj.Subdistricts;
      delete obj.ElectionCenters;
      delete obj.Users;
      return obj;
    });

    res.json({ data });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في جلب المحافظات", error: err.message });
  }
};

// جلب محافظة حسب المعرّف مع الإحصائيات
exports.getGovernorateById = async (req, res) => {
  try {
    const { id } = req.params;

    const governorate = await Governorate.findByPk(id, {
      include: [
        { model: District, attributes: ["id"] },
        { model: Subdistrict, attributes: ["id"] },
        { model: ElectionCenter, attributes: ["id"] },
        { model: User, attributes: ["id", "confirmed_voting"] },
      ],
    });

    if (!governorate) {
      return res.status(404).json({ message: "المحافظة غير موجودة" });
    }

    const obj = governorate.get({ plain: true });

    obj.districts_count = obj.Districts?.length || 0;
    obj.subdistricts_count = obj.Subdistricts?.length || 0;
    obj.election_centers_count = obj.ElectionCenters?.length || 0;
    obj.users_count = obj.Users?.length || 0;
    obj.confirmed_voting_count =
      obj.Users?.filter((user) => user.confirmed_voting).length || 0;

    delete obj.Districts;
    delete obj.Subdistricts;
    delete obj.ElectionCenters;
    delete obj.Users;

    res.json({ data: obj });
  } catch (err) {
    res.status(500).json({
      message: "فشل في جلب بيانات المحافظة",
      error: err.message,
    });
  }
};

// تعديل محافظة
exports.updateGovernorate = async (req, res) => {
  try {
    const { id } = req.params;
    const governorate = await Governorate.findByPk(id);

    if (!governorate) {
      return res.status(404).json({ message: "المحافظة غير موجودة" });
    }

    await governorate.update(req.body);
    await addLog({
      first_name: req.user?.first_name || "",
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name || "",

      action: "تعديل",
      message: `تم تحديث المحافظة ${governorate.name} بنجاح`,
    });

    res.json({ data: governorate });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تعديل بيانات المحافظة", error: err.message });
  }
};

// حذف محافظة واحدة
exports.deleteGovernorate = async (req, res) => {
  try {
    const { id } = req.params;
    const governorate = await Governorate.findByPk(id);

    if (!governorate) {
      return res.status(404).json({ message: "المحافظة غير موجودة" });
    }

    await governorate.destroy();
    res.json({ message: "تم حذف المحافظة بنجاح" });
    await governorate.destroy();

    // Log the DELETE action
    await addLog({
      first_name: req.user?.first_name || "",
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name || "",

      action: "حذف",
      message: `تم حذف محافظة ${governorate.name} بنجاح`,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في حذف المحافظة", error: err.message });
  }
};

// حذف جميع المحافظات
exports.deleteAllGovernorates = async (req, res) => {
  try {
    await Governorate.destroy({ where: {} });
    res.json({ message: "تم حذف جميع المحافظات بنجاح" });
    await governorate.destroy();

    // Log the DELETE action
    await addLog({
      first_name: req.user?.first_name || "",
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name || "",
      action: "حذف",
      message: `تم حذف جميع الملاحظات`,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في حذف جميع المحافظات", error: err.message });
  }
};
