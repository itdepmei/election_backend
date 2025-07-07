const Notification = require("../models/Notification");
const User = require("../models/User");
const NotificationRecipient = require("../models/NotificationRecipient");
const { Op } = require("sequelize");

exports.createNotification = async (req, res) => {
  try {
    const { name, description, type = "معلومات", send_to = "all" } = req.body;
    // نسوي الاشعار
    const notification = await Notification.create({
      name,
      description,
      type,
      send_to,
    });

    // نختار اليوزرز
    const userWhereClause =
      send_to === "all" ? {} : { role: send_to };

    const users = await User.findAll({
      where: userWhereClause,
      attributes: ["id"],
    });

    // نجيب المستخدمين
    const recipients = users.map((user) => ({
      user_id: user.id,
      notification_id: notification.id,
      read: false,
    }));

    // نسويهم

    await NotificationRecipient.bulkCreate(recipients);

    res.status(201).json({
      notification_id: notification.id,
      recipients_count: recipients.length,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({
      message: "Failed to create notification",
      error: err.message,
    });
  }
};
