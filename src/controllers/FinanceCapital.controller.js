const FinanceCapital = require("../models/FinanceCapital.model");
const User = require("../models/user.model");

// 📥 Create
const Budget = require("../models/Budget.model");

exports.createCapital = async (req, res) => {
  try {
    const { amount, title, description } = req.body;
    const campaignId = req.user.campaign_id;


    if(!campaignId) {
       res
      .status(400)
      .json({ message: "لا تنتمي لحملة", error: err.message });

    }

    // 1. أنشئ رأس المال
    const capital = await FinanceCapital.create({
      amount,
      description,
      title,
      added_by: req.user.id,
      campaign_id: campaignId,
    });

    

    // 2. تحقق من وجود budget مرتبط بالحملة
    let budget = await Budget.findOne({ where: { campaign_id: campaignId } });

    if (!budget) {
      // إذا لم يكن موجود، أنشئ واحد جديد
      budget = await Budget.create({
        campaign_id: campaignId,
        total_capital: amount,
        total_expenses: 0,
        remaining_balance: amount,
      });
    } else {
      // إذا موجود، حدّث رأس المال والرصيد المتبقي
      budget.total_capital += amount;
      budget.remaining_balance = budget.total_capital - budget.total_expenses;
      await budget.save();
    }

    res.status(201).json({
      message: "تمت إضافة رأس المال وتحديث الميزانية",
      data: { capital },
    });
  } catch (err) {
    console.error("خطأ في إضافة رأس المال:", err);
    res
      .status(500)
      .json({ message: "فشل في إضافة رأس المال", error: err.message });
  }
};

// 📃 Get All
exports.getAllCapitals = async (req, res) => {
  try {
    const records = await FinanceCapital.findAll({
      include: {
        model: User,
        attributes: ["id", "first_name", "second_name", "last_name"],
      },
    });

    const data = records.map((record) => {
      const plain = record.get({ plain: true });

      if (record.User) {
        const nameParts = [
          record.User.first_name,
          record.User.second_name,
          record.User.last_name,
        ].filter(Boolean);
        plain.added_by_user = nameParts.join(" ");
      } else {
        plain.added_by_user = "";
      }

      delete plain.User;
      return plain;
    });

    res.json({ data });
  } catch (err) {
    console.error("خطأ في جلب رؤوس الأموال:", err);
    res
      .status(500)
      .json({ message: "فشل في جلب رؤوس الأموال", error: err.message });
  }
};

// 🔍 Get By ID
exports.getCapitalById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await FinanceCapital.findByPk(id, {
      include: {
        model: User,
        attributes: ["id", "first_name", "second_name", "last_name"],
      },
    });

    if (!record) {
      return res.status(404).json({ message: "السجل غير موجود" });
    }

    const plain = record.get({ plain: true });
    if (record.User) {
      const nameParts = [
        record.User.first_name,
        record.User.second_name,
        record.User.last_name,
      ].filter(Boolean); // removes null/undefined/empty
      plain.added_by_user = nameParts.join(" ");
    } else {
      plain.added_by_user = "";
    }

    delete plain.User;

    res.json({ data: plain });
  } catch (err) {
    console.error("خطأ في جلب السجل:", err);
    res.status(500).json({ message: "فشل في جلب السجل", error: err.message });
  }
};

// ✏️ Update
exports.updateCapital = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount,title, description } = req.body;

    const [affectedRows] = await FinanceCapital.update(
      { amount, description,title, added_by: req.user.id },
      { where: { id } }
    );

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "السجل غير موجود أو لم يتم التحديث" });
    }

    // 🔁 Optional: Fetch the updated record
    const updatedRecord = await FinanceCapital.findByPk(id);

    res.json({ data: updatedRecord });
  } catch (err) {
    console.error("خطأ في التحديث:", err);
    res.status(500).json({ message: "فشل في تحديث السجل", error: err.message });
  }
};

// ❌ Delete
exports.deleteCapital = async (req, res) => {
  try {
    const { id } = req.params;
    const capital = await FinanceCapital.findByPk(id);

    if (!capital) {
      return res.status(404).json({ message: "السجل غير موجود" });
    }

    const campaignId = capital.campaign_id;
    const amount = capital.amount;

    await capital.destroy();

    const budget = await Budget.findOne({ where: { campaign_id: campaignId } });

    if (budget) {
      budget.total_capital -= amount;
      budget.remaining_balance = Math.max(0, budget.total_capital - budget.total_expenses);
      await budget.save();
    }

    res.json({ message: "تم الحذف بنجاح وتحديث الميزانية" });
  } catch (err) {
    console.error("خطأ في الحذف:", err);
    res.status(500).json({ message: "فشل في حذف السجل", error: err.message });
  }
};

exports.deleteAllCapital = async (req, res) => {
  try {
    const deleted = await FinanceCapital.destroy({ truncate: true });

    if (!deleted) {
      return res.status(404).json({ message: "السجل غير موجود" });
    }

    res.json({ message: "تم الحذف الجميع بنجاح" });
  } catch (err) {
    console.error("خطأ في الحذف:", err);
    res.status(500).json({ message: "فشل في حذف السجل", error: err.message });
  }
};
