const Tapes = require("../models/Tapes.models");
const Station = require("../models/Station.model");
const ElectionCenter = require("../models/ElectionCenter.model");
const District = require('../models/District.model')
const Governorate = require('../models/Governate.model')
const {addLog } = require('../utils/Logger')
const sequelize = require("../config/database");
const User = require('../models/user.model')
const { formatTape } = require('../utils/formatTape');

exports.createTapes = async (req, res) => {
  try {
    const body = req.body;
    const dataArray = Array.isArray(body) ? body : [body];

    for (const item of dataArray) {
      if (!item || !item.election_center_id || !item.station_id || !item.date) {
        return res
          .status(400)
          .json({ message: "بعض الحقول الأساسية مفقودة في بيانات الشريط" });
      }
    }

    const files = req.files?.tape_image || [];
    const tapesToCreate = dataArray.map((item, index) => ({
      election_center_id: item.election_center_id,
      station_id: item.station_id,
      date: item.date,
      tape_image: files[index]?.filename || null,
      notes: item.notes || null,
      status : item.status || "قيد المراجعة",
      added_by : req.user.id ,
    }));


    const tapes = await Tapes.bulkCreate(tapesToCreate, { validate: true });

    

    await addLog({
      first_name: req.user?.first_name || "" ,
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name  || "",
      campaign_id: req.user.campaign_id || null,
      action: "إضافة",
      message: `تم إنشاء ${tapes.length} شريط
      `,
    });

    res.status(201).json({ data: tapes });
  } catch (err) {
    console.error("خطأ أثناء إنشاء الأشرطة:", err);
    res
      .status(500)
      .json({ message: "فشل في إنشاء الأشرطة", error: err.message });
  }
};


exports.getTapes = async (req, res) => {
  try {
    const tapes = await Tapes.findAll({
      attributes: {
        exclude: ['election_center_id', 'station_id', 'user_id'],
      },
      include: [
        { model: Station, attributes: ["id", "name"] },
        { model: ElectionCenter, attributes: ["id", "name"] },
        {
          model: User,
          attributes: ["first_name", "second_name", "last_name"],
        },
      ],
    });

    if (!tapes.length) {
      return res.status(404).json({ message: "لا توجد أشرطة" });
    }

    const formatted = tapes.map(formatTape);
    res.json({ data: formatted });
  } catch (err) {
    console.error("خطأ في جلب الأشرطة:", err);
    res.status(500).json({ message: "فشل في جلب الأشرطة", error: err.message });
  }
};

exports.getTapeById = async (req, res) => {
  try {
    const tape = await Tapes.findByPk(req.params.id, {
      attributes: {
        exclude: ['election_center_id', 'station_id', 'user_id'],
      },
      include: [
        { model: Station, attributes: ["id", "name"] },
        { model: ElectionCenter, attributes: ["id", "name"] },
        {
          model: User,
          attributes: ["first_name", "second_name", "last_name"],
        },
      ],
    });

    if (!tape) {
      return res.status(404).json({ message: "الشريط غير موجود" });
    }

   
    res.json({ data: formatTape(tape) });
  } catch (err) {
    console.error("خطأ في جلب الشريط حسب المعرّف:", err);
    res.status(500).json({ message: "فشل في جلب الشريط", error: err.message });
  }
};


exports.getTapesByCenterId = async (req, res) => {
  try {
    const { id } = req.params;
    const tapes = await Tapes.findAll({
      where: { election_center_id: id },
      attributes: {
        exclude: ['election_center_id', 'station_id', 'user_id'],
      },
      include: [
        {

          model: User,
          attributes: ["first_name", "second_name", "last_name"],
        },
        {
          model: Station,
          attributes: ["id", "name"],

        },
        {
          model: ElectionCenter,
          attributes: ["id", "name"],
          },
      ],
    });

    if (!tapes.length) {
      return res.status(404).json({ message: "لا توجد أشرطة في هذا المركز الانتخابي" });
    }
    // res.json({ data: formatTape(tapes) });


    res.json({ data: tapes.map(formatTape) });

  } catch (err) {
    console.error("خطأ في جلب الأشرطة حسب المركز:", err);
    res.status(500).json({ message: "فشل في جلب الأشرطة حسب المركز", error: err.message });
  }
};

exports.getTapesByStationId = async (req, res) => {
  try {
    const { id } = req.params;

    const tapes = await Tapes.findAll({
      where: { station_id: id },
      attributes: {
        exclude: ['election_center_id', 'station_id', 'user_id'],
      },
      include: [
        {
          model: User,
          attributes: ["first_name", "second_name", "last_name"],
        },
        {
          model: Station,
          attributes: ["id", "name"],
          },
          {
            model: ElectionCenter,
            attributes: ["id", "name"],
            },
            
      ],
    });

    if (!tapes.length) {
      return res.status(404).json({ message: "لا توجد أشرطة في هذه المحطة" });
    }

  

    res.json({ data: tapes.map(formatTape) });
  } catch (err) {
    console.error("خطأ في جلب الأشرطة حسب المحطة:", err);
    res.status(500).json({ message: "فشل في جلب الأشرطة حسب المحطة", error: err.message });
  }
};


exports.updateTape = async (req, res) => {
  try {
    const tape = await Tapes.findByPk(req.params.id);

    if (!tape) {
      return res.status(404).json({ message: "الشريط غير موجود" });
    }

    const { election_center_id, station_id, date, notes ,status } = req.body;

    const newTapeImage =
      req.files?.tape_image?.[0]?.filename || tape.tape_image;

    const updateData = {
      election_center_id: election_center_id || tape.election_center_id,
      station_id: station_id || tape.station_id,
      date: date || tape.date,
      tape_image: newTapeImage,
      notes: notes || tape.notes,
      status: status || tape.status
    };

    await tape.update(updateData);
    await addLog({
      first_name: req.user?.first_name || "" ,
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name  || "",
      campaign_id: req.user.campaign_id || null,
      action: "تعديل",
      message: `تم تعديل الشريط (ID: ${tape.id})`,
    });

    res.json({ data: tape });
  } catch (err) {
    console.error("خطأ في تعديل الشريط:", err);
    res
      .status(500)
      .json({ message: "فشل في تعديل الشريط", error: err.message });
  }
};

exports.deleteTape = async (req, res) => {
  try {
    const deleted = await Tapes.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ message: "الشريط غير موجود" });
    }

    await addLog({
      first_name: req.user?.first_name || "" ,
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name  || "",
      campaign_id: req.user.campaign_id || null,
      action: "حذف",
      message: `تم حذف الشريط (ID: ${req.params.id})`,
    });

    res.status(205).json({ message: "تم حذف الشريط بنجاح" });
  } catch (err) {
    console.error("خطأ في حذف الشريط:", err);
    res.status(500).json({ message: "فشل في حذف الشريط", error: err.message });
  }
};

exports.deleteAllTapes = async (req, res) => {
  try {
    await Tapes.destroy({ where: {}, truncate: true });
    await addLog({
      first_name: req.user?.first_name || "" ,
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name  || "",
      campaign_id: req.user.campaign_id || null,
      action: "حذف الكل",
      message: "تم حذف جميع الأشرطة من النظام",
    });

    res.status(205).json({ message: "تم حذف جميع الأشرطة" });
  } catch (err) {
    console.error("خطأ في حذف جميع الأشرطة:", err);
    res
      .status(500)
      .json({ message: "فشل في حذف جميع الأشرطة", error: err.message });
  }
};


exports.getTapesStats = async (req, res) => {

  try {
    const total = await Tapes.count();

    const per_governorate = await Tapes.findAll({
  attributes: [
    [sequelize.col("ElectionCenter.governorate_id"), "governorate_id"],
    [sequelize.col("ElectionCenter->Governorate.name"), "governorate_name"],
    [sequelize.fn("COUNT", sequelize.col("Tapes.id")), "count"],
  ],
  include: [
    {
      model: ElectionCenter,
      attributes: [],
      include: [
        {
          model: Governorate , 
          attributes: [],
        },
      ],
    },
  ],
  group: ["ElectionCenter.governorate_id", "ElectionCenter->Governorate.name"],
  raw: true,
});


const per_district = await Tapes.findAll({
  attributes: [
    [sequelize.col("ElectionCenter->District.id"), "district_id"],
    [sequelize.col("ElectionCenter->District.name"), "district_name"],
    [sequelize.fn("COUNT", sequelize.col("Tapes.id")), "count"],
  ],
  include: [
    {
      model: ElectionCenter,
      attributes: [],
      include: [
        {
          model: District,
          attributes: [],
        },
      ],
    },
  ],
  group: ["ElectionCenter.District.id", "ElectionCenter.District.name"],
  raw: true,
});


    const by_status = await Tapes.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      group: ["status"],
    });

    const per_station = await Tapes.findAll({
      attributes: [
        "station_id",
        [sequelize.fn("COUNT", sequelize.col("station_id")), "count"],
      ],
      include: [
        {
          model: Station,
          attributes: ["name"],
        },
      ],
      group: ["station_id", "Station.id", "Station.name"],
    });

    const per_election_center = await Tapes.findAll({
      attributes: [
        "election_center_id",
        [sequelize.fn("COUNT", sequelize.col("election_center_id")), "count"],
      ],
      include: [
        {
          model: ElectionCenter,
          attributes: ["name"],
        },
      ],
      group: ["election_center_id", "ElectionCenter.id", "ElectionCenter.name"],
    });

    const last_tape_added = await Tapes.findOne({
      order: [["date", "DESC"]],
      attributes: ["id", "date"],
    });

    // Count tapes from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last_7_days = await Tapes.count({
      where: {
        date: {
          [require("sequelize").Op.gte]: sevenDaysAgo,
        },
      },
    });

    res.status(200).json({
      total,
      by_status,
      per_station,
      per_election_center,
      last_tape_added,
      last_7_days,
        per_district,
  per_governorate,

    });
  } catch (err) {
    console.error("خطأ في جلب إحصائيات الأشرطة:", err);
    res.status(500).json({
      message: "فشل في جلب إحصائيات الأشرطة",
      error: err.message,
    });
  }
};


exports.toggleTapeStatus = async (req, res) => {
  
  const tapeId = req.params.id;
  const { status } = req.body; 

  try {
    const tape = await Tapes.findByPk(tapeId);

    if (!tape) {
      return res.status(404).json({ message: "الشريط غير موجود" });
    }

    if (!['مقبول', 'مرفوض', 'قيد المراجعة'].includes(status)) {
      return res.status(400).json({ message: "الحالة غير صالحة" });
      }

    tape.status = status;

    await tape.save();

    await addLog({
      first_name: req.user?.first_name || "",
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name || "",
      campaign_id: req.user?.campaign_id || null,
      action: "تعديل",
      message: `تم تغيير حالة الشريط إلى ${status}`,
    });

    

    res.status(200).json({ data: tape });
  } catch (err) {
    console.error("خطأ أثناء تحديث الحالة:", err);
    res.status(500).json({ message: "فشل في تحديث الحالة", error: err.message });
  }
};
