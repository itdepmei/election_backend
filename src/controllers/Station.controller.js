const { Tapes, ElectionCenter } = require("../models");
const Station = require("../models/Station.model");
const sequelize = require("../config/database");
const { addLog } = require("../utils/Logger");

exports.createStations = async (req, res) => {
  try {
    const input = req.body;

    if (Array.isArray(input)) {
      if (input.length === 0) {
        return res.status(400).json({ message: "تم إرسال قائمة فارغة" });
      }

      const created = await Station.bulkCreate(input, { validate: true });
      await addLog({
        fullname: req.user?.full_name || "مستخدم مجهول",
        action: "إضافة",
        message: `تم إنشاء ${created.length} محطة `,
      });
      return res.status(201).json({ data: created });
    } else {
      const created = await Station.create(input);
      await addLog({
        fullname: req.user?.full_name || "مستخدم مجهول",
        action: "إضافة",
        message: `تم إنشاء  محطة `,
      });

      return res.status(201).json({ data: created });
    }
  } catch (err) {
    console.error("Create Station Error:", err);
    res
      .status(500)
      .json({ message: "فشل في إنشاء المحطة/المحطات", error: err.message });
  }
};

exports.getStations = async (req, res) => {
  try {
    const stations = await Station.findAll({
      attributes: [
        "id",
        "name",
        "code",
        "election_center_id",
        [sequelize.fn("COUNT", sequelize.col("Tapes.id")), "tape_count"],
      ],
      include: [
        {
          model: Tapes,
          attributes: [],
          required: false,
        },
        {
          model: ElectionCenter,
          attributes: ["id", "name"],
          required: false,
        },
      ],
      group: ["Station.id"],
    });

    res.json({ data: stations });
  } catch (err) {
    console.error("Get stations error:", err);
    res.status(500).json({
      message: "فشل في جلب المحطات",
      error: err.message,
    });
  }
};

exports.getStationById = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await Station.findByPk(id, {
      include: [
        {
          model: ElectionCenter,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!station) {
      return res
        .status(404)
        .json({ message: `لم يتم العثور على محطة بالمعرّف ${id}` });
    }

    res.json({ data: station });
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب المحطة", error: err.message });
  }
};


exports.getStationByCenterId = async (req, res) => {
  try {
    const { id } = req.params;

    const stations = await Station.findAll({
      attributes: [
        "id",
        "name",
        "code",
        "election_center_id",
        [sequelize.fn("COUNT", sequelize.col("Tapes.id")), "tape_count"],
            "createdAt",   // تضيفهم صراحة لو تبي
    "updatedAt",

      ],
      where: { election_center_id: id },
      include: [
        {
          model: Tapes,
          attributes: [],
          required: false,
        },
      ],
      group: ["Station.id"],
    });

    res.json({ data: stations });
  } catch (err) {
    console.error("Error fetching stations by center ID:", err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب المحطات", error: err.message });
  }
};


exports.updateStation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "معرّف المحطة غير صالح" });
    }

    const updates = req.body;

    const station = await Station.findByPk(id);
    if (!station) {
      return res
        .status(404)
        .json({ message: `لم يتم العثور على محطة بالمعرّف ${id}` });
    }

    await station.update(updates);
    await addLog({
      fullname: req.user?.full_name || "مستخدم مجهول",
      action: "تعديل",
      message: `تم تعديل محطة: ${station.name} (ID: ${station.id})`,
    });

    res.status(200).json({ data: station });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تحديث المحطة", error: err.message });
  }
};

exports.deleteStation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "معرّف المحطة غير صالح" });
    }

    const deleted = await Station.destroy({ where: { id } });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: `لم يتم العثور على محطة بالمعرّف ${id}` });
    }

    await addLog({
      fullname: req.user?.full_name || "مستخدم مجهول",
      action: "حذف",
      message: `تم حذف محطة بالمعرف ${id}`,
    });

    res.status(204).json({ message: `تم حذف المحطة بالمعرّف ${id}` });
  } catch (err) {
    res.status(500).json({ message: "فشل في حذف المحطة", error: err.message });
  }
};

exports.deleteAllStations = async (req, res) => {
  try {
    await Station.destroy({ where: {}, truncate: true }); // يحذف الكل ويعيد العدادات
    await addLog({
      fullname: req.user?.full_name || "مستخدم مجهول",
      action: "حذف الكل",
      message: "تم حذف جميع المحطات من النظام",
    });

    res.status(205).json({
      message: "تم حذف جميع المحطات بنجاح",
    });
  } catch (err) {
    console.error("Delete all stations error:", err);
    res.status(500).json({
      message: "فشل في حذف جميع المحطات",
      error: err.message,
    });
  }
};
