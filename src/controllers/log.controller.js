const Log = require("../models/log.model");

exports.createLog = async (req, res) => {
  try {
    const { fullname, action, message } = req.body;

    const log = await Log.create({ fullname, action, message });

    res.status(201).json({ message: "تم تسجيل السجل", data: log });
  } catch (err) {
    res.status(500).json({ message: "فشل في إنشاء السجل", error: err.message });
  }
};
exports.getLog = async (req, res) => {
  try {
    let logs;

    if (req.user.role === "system_admin") {
      // يرجع كل السجلات بدون شرط
      logs = await Log.findAll();
    } else {
      // يرجع السجلات الخاصة بالحملة فقط
      logs = await Log.findAll({
        where: { campaign_id: req.user.campaign_id },
      });
    }

    res.status(200).json({ data: logs });
  } catch (err) {
    res.status(500).json({
      message: "فشل في الوصول إلى السجل",
      error: err.message,
    });
  }
};

exports.getLogById = async (req, res) => {
  try {
    const campaignId = req.user.campaign_id;
    const log = await Log.findAll({
      where: { campaign_id: campaignId },
      });
    if (!log) {
      return res.status(404).json({ message: "السجل غير موجود" });
    }
    res.status(200).json({ data: log });
  }
  catch (err) {
    res.status(500).json({ message: "فشل في الوصول إلى السجل", error: err.message });
  }
}

exports.deleteLog = async (req, res) => {
  try {
    const logs = await Log.truncate();
    if (!logs) {
      return res.status(404).json({ message: "السجل غير موجود" });
    }
    res.status(200).json({ message: "تم حذف السجل بنجاح" });
  }
  catch (err) {
    res.status(500).json({ message: "فشل في حذف السجل", error: err.message });
  }
}