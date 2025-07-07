const Payment = require("../models/Payment.model");
const User = require("../models/user.model");

// 🧾 Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { user_id, amount, description } = req.body;

    const payment = await Payment.create({
      user_id,
      amount,
      title,
      description,
      added_by,
    });

    res.status(201).json({ message: "تمت إضافة الدفعة بنجاح", data: payment });
  } catch (err) {
    console.error("خطأ في إنشاء الدفعة:", err);
    res
      .status(500)
      .json({ message: "فشل في إنشاء الدفعة", error: err.message });
  }
};

// 📋 Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const records = await Payment.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "second_name", "last_name"],
        },
        {
          model: User,
          as: "AddedBy",
          attributes: ["id", "first_name", "second_name", "last_name"],
        },
      ],
      order: [["payment_date", "DESC"]],
    });

    const data = records.map((record) => {
      const plain = record.get({ plain: true });

      const userName = [
        record.User?.first_name,
        record.User?.second_name,
        record.User?.last_name,
      ]
        .filter(Boolean)
        .join(" ");
      const addedByName = [
        record.AddedBy?.first_name,
        record.AddedBy?.second_name,
        record.AddedBy?.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        ...plain,
        paid_by: userName || "غير معروف",
        added_by_user: addedByName || "غير معروف",
      };
    });

    res.json({ data });
  } catch (err) {
    console.error("خطأ في جلب الدفعات:", err);
    res.status(500).json({ message: "فشل في جلب الدفعات", error: err.message });
  }
};

// 🔍 Get single payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "second_name", "last_name"],
        },
        {
          model: User,
          as: "AddedBy",
          attributes: ["id", "first_name", "second_name", "last_name"],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: "الدفعة غير موجودة" });
    }

    const plain = payment.get({ plain: true });
    plain.paid_by =
      [
        payment.User?.first_name,
        payment.User?.second_name,
        payment.User?.last_name,
      ]
        .filter(Boolean)
        .join(" ") || "غير معروف";
    plain.added_by_user =
      [
        payment.AddedBy?.first_name,
        payment.AddedBy?.second_name,
        payment.AddedBy?.last_name,
      ]
        .filter(Boolean)
        .join(" ") || "غير معروف";

    delete plain.User;
    delete plain.AddedBy;

    res.json({ data: plain });
  } catch (err) {
    console.error("خطأ في جلب الدفعة:", err);
    res.status(500).json({ message: "فشل في جلب الدفعة", error: err.message });
  }
};

// ✏️ Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, title, amount, payment_date, description } = req.body;

    const [affected] = await Payment.update(
      { user_id, amount, payment_date, description, title },
      { where: { id } }
    );

    if (affected === 0) {
      return res
        .status(404)
        .json({ message: "الدفعة غير موجودة أو لم يتم تعديلها" });
    }

    const updated = await Payment.findByPk(id);
    res.json({ message: "تم التحديث بنجاح", data: updated });
  } catch (err) {
    console.error("خطأ في تحديث الدفعة:", err);
    res
      .status(500)
      .json({ message: "فشل في تحديث الدفعة", error: err.message });
  }
};

// ❌ Delete a payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Payment.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({ message: "الدفعة غير موجودة" });
    }

    res.json({ message: "تم حذف الدفعة بنجاح" });
  } catch (err) {
    console.error("خطأ في حذف الدفعة:", err);
    res.status(500).json({ message: "فشل في حذف الدفعة", error: err.message });
  }
};
