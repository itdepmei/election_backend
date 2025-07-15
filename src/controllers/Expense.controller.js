const Expense = require('../models/Expense.model');
const User = require('../models/user.model'); // if you want to join who added it
const Budget = require("../models/Budget.model");

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, description } = req.body;
    const campaignId = req.user.campaign_id;

    const budget = await Budget.findOne({ where: { campaign_id: campaignId } });

    if (!budget) {
      return res.status(400).json({ message: "لا توجد ميزانية لهذه الحملة بعد." });
    }

    if (budget.remaining_balance < amount) {
      return res.status(400).json({ message: "الرصيد المتاح لا يكفي لتسجيل هذا المصروف." });
    }

    const expense = await Expense.create({
      amount,
      description,
      title,
      campaign_id: campaignId,
      added_by: req.user.id,
    });

    budget.total_expenses += amount;
    budget.remaining_balance = budget.total_capital - budget.total_expenses;
    await budget.save();

    await addLog({
      first_name: req.user?.first_name || "",
      last_name: req.user?.last_name || "",
      second_name: req.user?.second_name || "",
      campaign_id: req.user?.campaign_id || null,
      action: "إضافة ",
      message: `تم إضافة مصروف بقيمة ${amount} للحملة`,
    });

    res.status(201).json({
      data: { expense, budget },
    });
  } catch (err) {
    console.error("خطأ في إضافة المصروف:", err);
    res
      .status(500)
      .json({ message: "فشل في إضافة المصروف", error: err.message });
  }
};

//  Get All Expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const records = await Expense.findAll({
      where: { campaign_id: req.user.campaign_id },
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

//  Get Expense by ID
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

//  Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, title } = req.body;

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ message: "المصروف غير موجود" });
    }

    const updatedExpense = await expense.update({
      amount: amount !== undefined ? amount : expense.amount,
      description: description !== undefined ? description : expense.description,
      title: title !== undefined ? title : expense.title,
    });

    await addLog({
      first_name: req.user?.first_name || "",
      last_name: req.user?.last_name || "",
      second_name: req.user?.second_name || "",
      campaign_id: req.user?.campaign_id || null,
      action: "تعديل",
      message: `تم تعديل المصروف بقيمة ${amount} للحملة`,
    });

    res.json({ message: "تم التعديل بنجاح", data: updatedExpense });
  } catch (err) {
    console.error("خطأ في التعديل:", err);
    res.status(500).json({ message: "فشل في تعديل المصروف", error: err.message });
  }
};


exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. جلب المصروف أولًا
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ message: "المصروف غير موجود" });
    }

    const campaignId = expense.campaign_id;
    const amount = expense.amount;

    await expense.destroy();

    const budget = await Budget.findOne({ where: { campaign_id: campaignId } });

    if (budget) {
      budget.total_expenses -= amount;
      budget.remaining_balance = budget.total_capital - budget.total_expenses;

      
      budget.total_expenses = Math.max(0, budget.total_expenses);
      budget.remaining_balance = Math.max(0, budget.remaining_balance);

      await budget.save();
    }
    await addLog({
      first_name: req.user?.first_name || "",
      last_name: req.user?.last_name || "",
      second_name: req.user?.second_name || "",
      campaign_id: req.user?.campaign_id || null, 
      action: "حذف",
      message: `تم حذف المصروف بقيمة ${amount} للحملة`,
    });
  

    res.json({ message: "تم حذف المصروف وتعديل الميزانية بنجاح" });
  } catch (err) {
    console.error("خطأ في الحذف:", err);
    res.status(500).json({ message: "فشل في حذف المصروف", error: err.message });
  }
};
