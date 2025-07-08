const Budget = require("../models/Budget.model");

exports.getBudget = async (req, res) => {
  try {
    const campaignId = req.user.campaign_id;

    if(!campaignId) {
        return res.status(404).json({ message: "لم يتم العثور على ميزانية لهذه الحملة." });
    }

    const budget = await Budget.findOne({ where: { campaign_id: campaignId } });

    if (!budget) {
      return res.status(404).json({ message: "لم يتم العثور على ميزانية لهذه الحملة." });
    }

    res.status(200).json({
      data:budget
    });
  } catch (err) {
    console.error("خطأ في جلب الميزانية:", err);
    res.status(500).json({ message: "فشل في جلب الميزانية", error: err.message });
  }
};
