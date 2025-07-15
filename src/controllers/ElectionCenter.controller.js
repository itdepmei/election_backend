const ElectionCenter = require('../models/ElectionCenter.model')
const Station = require('../models/Station.model');
const User = require('../models/user.model');
const Governorate = require('../models/Governate.model');
const District = require('../models/District.model');
const Subdistrict = require('../models/Subdistrict.model');

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
      ],
      include: [
        {
          model: Station,
          attributes: ['id'], // used for counting
          required: false,
        },
        {
          model: User,
          attributes: ['id'], // users in center
          required: false,
        },
        {
          model: Governorate,
          attributes: ['id', 'name'],
        },
        {
          model: District,
          attributes: ['id', 'name'],
        },
        {
          model: Subdistrict,
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'center_manager',
          attributes: ['first_name', 'last_name'],
        },
      ],
    });

    const data = centers.map((center) => {
      const plain = center.get({ plain: true });

      plain.governorate = plain.Governorate
        ? { id: plain.Governorate.id, name: plain.Governorate.name }
        : null;

      plain.district = plain.District
        ? { id: plain.District.id, name: plain.District.name }
        : null;

      plain.subdistrict = plain.Subdistrict
        ? { id: plain.Subdistrict.id, name: plain.Subdistrict.name }
        : null;

      // ✅ Count related records
      plain.stations_count = plain.Stations?.length || 0;
      plain.users_count = plain.Users?.length || 0;

      // ✅ Combine manager name
      plain.center_manager_name =
        plain.center_manager?.first_name && plain.center_manager?.last_name
          ? `${plain.center_manager.first_name} ${plain.center_manager.last_name}`
          : null;

      // 🚮 Clean up
      delete plain.Governorate;
      delete plain.District;
      delete plain.Subdistrict;
      delete plain.Stations;
      delete plain.Users;
      delete plain.center_manager;

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
      ],
      include: [
        {
          model: Station,
          attributes: ['id'], // for counting
          required: false,
        },
        {
          model: User,
          attributes: ['id'], // for counting
          required: false,
        },
        {
          model: Governorate,
          attributes: ['id', 'name'],
        },
        {
          model: District,
          attributes: ['id', 'name'],
        },
        {
          model: Subdistrict,
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'center_manager',
          attributes: ['first_name', 'last_name'],
        },
      ],
    });

    if (!center) {
      return res.status(404).json({
        message: `لم يتم العثور على مركز الاقتراع بالمعرف ${id}`,
      });
    }

    const result = center.get({ plain: true });

    // ✅ Add nested region info
    result.governorate = result.Governorate
      ? { id: result.Governorate.id, name: result.Governorate.name }
      : null;

    result.district = result.District
      ? { id: result.District.id, name: result.District.name }
      : null;

    result.subdistrict = result.Subdistrict
      ? { id: result.Subdistrict.id, name: result.Subdistrict.name }
      : null;

    // ✅ Combine center manager name
    result.center_manager_name =
      result.center_manager?.first_name && result.center_manager?.last_name
        ? `${result.center_manager.first_name} ${result.center_manager.last_name}`
        : null;

    // ✅ Count related records
    result.stations_count = result.Stations?.length || 0;
    result.users_count = result.Users?.length || 0;

    // 🧹 Clean up
    delete result.Governorate;
    delete result.District;
    delete result.Subdistrict;
    delete result.center_manager;
    delete result.Stations;
    delete result.Users;

    res.json({ data: result });
  } catch (err) {
    console.error("Error fetching election center by ID:", err);
    res.status(500).json({
      message: "فشل في جلب مركز الاقتراع",
      error: err.message,
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
    res.status(500).json({ message: "فشل في تعديل مركز الاقتراع", error: err.message });
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
