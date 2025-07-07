const Expense = require('../models/Expense.model');
const User = require('../models/user.model'); // if you want to join who added it

exports.createExpense = async (req, res) => {
  try {
    const { amount, description } = req.body;

    const expense = await Expense.create({
      amount,
      description,
      title,
      added_by : req.user.id,
    });

    res.status(201).json({ data: expense });
  } catch (err) {
    console.error("خطأ في إضافة المصروف:", err);
    res.status(500).json({ message: "فشل في إضافة المصروف", error: err.message });
  }
};

// 📃 Get All Expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const records = await Expense.findAll({
      include: {
        model: User,
        attributes: ['id', 'first_name', 'second_name', 'last_name'],
      },
    });

    const data = records.map((record) => {
      const plain = record.get({ plain: true });

      const nameParts = [
        record.User?.first_name,
        record.User?.second_name,
        record.User?.last_name,
      ].filter(Boolean);

      plain.added_by_user = nameParts.join(" ") || "غير معروف";

      delete plain.User;
      return plain;
    });

    res.json({ data });
  } catch (err) {
    console.error("خطأ في جلب المصروفات:", err);
    res.status(500).json({ message: "فشل في جلب المصروفات", error: err.message });
  }
};

// 🔍 Get Expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id, {
      include: {
        model: User,
        attributes: ['id', 'first_name', 'second_name', 'last_name'],
      },
    });

    if (!expense) {
      return res.status(404).json({ message: "المصروف غير موجود" });
    }

    const plain = expense.get({ plain: true });

    const nameParts = [
      expense.User?.first_name,
      expense.User?.second_name,
      expense.User?.last_name,
    ].filter(Boolean);

    plain.added_by_user = nameParts.join(" ") || "غير معروف";
    delete plain.User;

    res.json({ data: plain });
  } catch (err) {
    console.error("خطأ في جلب المصروف:", err);
    res.status(500).json({ message: "فشل في جلب المصروف", error: err.message });
  }
};

// ✏️ Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description , title} = req.body;

    const [affected] = await Expense.update(
      { amount, description , title },
      { where: { id } }
    );

    if (affected === 0) {
      return res.status(404).json({ message: "المصروف غير موجود أو لم يتم التحديث" });
    }

    const updated = await Expense.findByPk(id);
    res.json({ message: "تم التحديث بنجاح", data: updated });
  } catch (err) {
    console.error("خطأ في التحديث:", err);
    res.status(500).json({ message: "فشل في تحديث المصروف", error: err.message });
  }
};

// ❌ Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Expense.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "المصروف غير موجود" });
    }

    res.json({ message: "تم حذف المصروف بنجاح" });
  } catch (err) {
    console.error("خطأ في الحذف:", err);
    res.status(500).json({ message: "فشل في حذف المصروف", error: err.message });
  }
};
