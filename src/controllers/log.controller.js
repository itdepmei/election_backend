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
    const log = await Log.findAll(); 

    res.status(200).json({ data: log });
  } catch (err) {
    res.status(500).json({
      message: "فشل في الوصول إلى السجل",
      error: err.message,
    });
  }
};
