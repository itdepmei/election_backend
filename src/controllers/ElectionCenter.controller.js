const ElectionCenter = require('../models/ElectionCenter.model')
const Station = require('../models/Station.model');
const User = require('../models/user.model');
const Governorate = require('../models/Governate.model');
const District = require('../models/District.model');
const Subdistrict = require('../models/Subdistrict.model');

const { fn, col, literal } = require('sequelize');

exports.createElectionCenters = async (req, res) => {
  try {
    const input = req.body;

    const records = Array.isArray(input) ? input : [input];

    if (records.length === 0) {
      return res.status(400).json({ message: "القائمة المرسلة فارغة" });
    }

    for (const [index, record] of records.entries()) {
      const { governorate_id, district_id, subdistrict_id } = record;

      // تحقق من وجود القضاء وتبعيتَه للمحافظة
      const district = await District.findOne({ where: { id: district_id } });
      if (!district) {
        return res.status(400).json({
          message: `القضاء بالمعرف ${district_id} غير موجود (سطر ${index + 1})`
        });
      }
      if (district.governorate_id !== governorate_id) {
        return res.status(400).json({
          message: `القضاء لا ينتمي إلى المحافظة المحددة (سطر ${index + 1})`
        });
      }

      // تحقق من وجود الناحية وتبعيتها للقضاء والمحافظة
      const subdistrict = await Subdistrict.findOne({ where: { id: subdistrict_id } });
      if (!subdistrict) {
        return res.status(400).json({
          message: `الناحية بالمعرف ${subdistrict_id} غير موجودة (سطر ${index + 1})`
        });
      }
      if (
        subdistrict.district_id !== district_id ||
        subdistrict.governorate_id !== governorate_id
      ) {
        return res.status(400).json({
          message: `الناحية لا تنتمي للقضاء أو المحافظة المحددة (سطر ${index + 1})`
        });
      }
    }

    // بعد التحقق من جميع السجلات:
    if (Array.isArray(input)) {
      const createdCenters = await ElectionCenter.bulkCreate(input, { validate: true });
      res.status(201).json({ data: createdCenters });
    } else {
      const createdCenter = await ElectionCenter.create(input);

      
      res.status(201).json({ data: createdCenter });
    }
  } catch (err) {
    console.error("Create ElectionCenter Error:", err);
    res.status(500).json({
      message: "فشل في إنشاء مركز/مراكز الاقتراع",
      error: err.message
    });
  }
};


exports.getElectionCenters = async (req, res) => {
  try {
    const centers = await ElectionCenter.findAll({
      attributes: [
        'id',
        'name',
        'code',
        'address',
        'supply_code',
        'supply_name',
        'registration_center_code',
        'registration_center_name',
        [col('Governorate.name'), 'governorate_name'],
        [col('District.name'), 'district_name'],
        [col('Subdistrict.name'), 'subdistrict_name'],
        [col('center_manager.first_name'), 'center_manager_first_name'],
        [col('center_manager.last_name'), 'center_manager_last_name'],
      ],
      include: [
        {
          model: Station,
          attributes: ['id'], // we'll count them in JS
          required: false,
        },
        {
          model: User,
          attributes: ['id'],
          required: false,
        },
        { model: Governorate, attributes: [] },
        { model: District, attributes: [] },
        { model: Subdistrict, attributes: [] },
        { model: User, as: 'center_manager', attributes: [] },
      ],
    });

    const data = centers.map((center) => {
      const plain = center.get({ plain: true });

      plain.stations_count = center.Stations?.length || 0;
      plain.users_count = center.Users?.length || 0;

      plain.center_manager_name =
        plain.center_manager_first_name && plain.center_manager_last_name
          ? `${plain.center_manager_first_name} ${plain.center_manager_last_name}`
          : null;

      delete plain.center_manager_first_name;
      delete plain.center_manager_last_name;
      delete plain.Stations;
      delete plain.Users;

      return plain;
    });

    res.json({ data });
  } catch (err) {
    console.error("Error fetching election centers:", err);
    res.status(500).json({ message: "فشل في جلب مراكز الاقتراع", error: err.message });
  }
};



exports.getElectionCenterById = async (req, res) => {
  try {
    const { id } = req.params;

    const center = await ElectionCenter.findOne({
      where: { id },
      attributes: [
        'id',
        'name',
        'code',
        'address',
        'supply_code',
        'supply_name',
        'registration_center_code',
        'registration_center_name',
        [col('Governorate.name'), 'governorate_name'],
        [col('District.name'), 'district_name'],
        [col('Subdistrict.name'), 'subdistrict_name'],
        [col('center_manager.first_name'), 'center_manager_first_name'],
        [col('center_manager.last_name'), 'center_manager_last_name'],
      ],
      include: [
        {
          model: Station,
          attributes: ['id'], // Needed for count
          required: false,
        },
        {
          model: User,
          attributes: ['id'], // Needed for count
          required: false,
        },
        { model: Governorate, attributes: [] },
        { model: District, attributes: [] },
        { model: Subdistrict, attributes: [] },
        { model: User, as: 'center_manager', attributes: [] }
      ]
    });

    if (!center) {
      return res.status(404).json({
        message: `لم يتم العثور على مركز الاقتراع بالمعرف ${id}`
      });
    }

    const result = center.get({ plain: true });

    result.stations_count = center.Stations?.length || 0;
    result.users_count = center.Users?.length || 0;

    result.center_manager_name = result.center_manager_first_name && result.center_manager_last_name
      ? `${result.center_manager_first_name} ${result.center_manager_last_name}`
      : null;

    delete result.center_manager_first_name;
    delete result.center_manager_last_name;
    delete result.Stations;
    delete result.Users;

    res.json({ data: result });
  } catch (err) {
    console.error("Error fetching election center by ID:", err);
    res.status(500).json({
      message: "فشل في جلب مركز الاقتراع",
      error: err.message
    });
  }
};


exports.updateElectionCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const center = await ElectionCenter.findByPk(id);

    if (!center) {
      return res.status(404).json({ message: `لم يتم العثور على مركز الاقتراع بالمعرف ${id}` });
    }

    await center.update(updates);

    res.json({ data: center });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "فشل في تحديث مركز الاقتراع", error: err.message });
  }
};

exports.deleteElectionCenter = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ElectionCenter.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: `لم يتم العثور على مركز الاقتراع بالمعرف ${id}` });
    }

    res.json({ message: `تم حذف مركز الاقتراع بالمعرف ${id} بنجاح` });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "فشل في حذف مركز الاقتراع", error: err.message });
  }
};

exports.deleteElectionCentersBulk = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "يرجى إرسال قائمة معرفات للحذف" });
    }

    const deletedCount = await ElectionCenter.destroy({
      where: { id: ids }
    });

    res.json({ message: `تم حذف ${deletedCount} مركز اقتراع` });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({ message: "فشل في حذف مراكز الاقتراع", error: err.message });
  }
};

exports.deleteAllElectionCenters = async (req, res) => {
  try {
    const deletedCount = await ElectionCenter.destroy({
      where: {},
      truncate: true
    });

    res.json({ message: `تم حذف جميع مراكز الاقتراع (${deletedCount} سجل)` });
  } catch (err) {
    console.error("Delete all error:", err);
    res.status(500).json({ message: "فشل في حذف جميع مراكز الاقتراع", error: err.message });
  }
};
