const Notification = require("../models/Notification.model");
const User = require("../models/user.model");
const NotificationRecipient = require("../models/NotificationRecipient.model");

exports.createNotification = async (req, res) => {
  try {
    const { name, message, type = "معلومات", send_to = "all" } = req.body;
    // نسوي الاشعار
    const notification = await Notification.create({
      name,
      message,
      type,
      send_to,
    });

    // نختار اليوزرز
    const userWhereClause = send_to === "all" ? {} : { role: send_to };

    const users = await User.findAll({
      where: userWhereClause,
      attributes: ["id"],
    });

    // نجيب المستخدمين
    const recipients = users.map((user) => ({
      user_id: user.id,
      notification_id: notification.id,
      isRead: false,
    }));

    // نسويهم

    await NotificationRecipient.bulkCreate(recipients);

    const io = req.app.get("io");
    io.emit("new-notification", {
      id: notification.id,
      name,
      message,
      type,
      send_to,
      createdAt: notification.createdAt,
    });

    res.status(201).json({
      data: notification,
      recipients: recipients,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({
      message: "Failed to create notification",
      error: err.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notification_id } = req.params;
    const user_id = req.user.id;

    const updated = await NotificationRecipient.update(
      {
        isRead: true,
        read_at: new Date(),
      },
      {
        where: {
          user_id,
          notification_id,
        },
      }
    );

    if (updated[0] === 0) {
      return res
        .status(404)
        .json({ message: "Notification not found for user" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark-as-read error:", err);
    res.status(500).json({ message: "Failed to update read status" });
  }
};
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({ data: notifications });
  } catch (err) {
    console.error("خطأ في جلب الإشعارات:", err);
    res
      .status(500)
      .json({ message: "فشل في جلب الإشعارات", error: err.message });
  }
};

exports.getNotificationsByUserId = async (req, res) => {
  const { isRead } = req.query;

  try {
    const whereClause = { user_id: req.user.id };
    if (typeof isRead !== "undefined") {
      whereClause.isRead = isRead === "true";
    }

    const records = await NotificationRecipient.findAll({
      where: whereClause,
      include: [
        {
          model: Notification,
          attributes: ["name", "message", "type", "send_to", "createdAt"],
        },
      ],
      order: [[Notification, "createdAt", "DESC"]],
    });

    const data = records.map((rec) => ({
      notification_id: rec.notification_id,
      isRead: rec.isRead,
      read_at: rec.read_at,
      ...rec.get("Notification", { plain: true }), // safe spreading
    }));

    res.json({ data: data });
  } catch (err) {
    console.error("فشل في جلب إشعارات المستخدم:", err);
    res
      .status(500)
      .json({ message: "فشل في جلب الإشعارات", error: err.message });
  }
};

exports.deleteAllRecords = async (req, res) => {
  try {
    // The `truncate: true` option removes all rows and resets auto-increment counters
    await NotificationRecipient.destroy({ where: {} });
    // now truncate notifications table
    await Notification.destroy({ where: {} });

    res.json({ message: "تم حذف جميع الاشعارات بنجاح " });
  } catch (err) {
    console.error("خطأ في حذف جميع السجلات:", err);
    res
      .status(500)
      .json({ message: "فشل في حذف جميع السجلات", error: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  const { notification_id } = req.params;
  try {
    await NotificationRecipient.destroy({
      where: { notification_id: notification_id },
    });
    await Notification.destroy({ where: { id: notification_id } });

    res.json({ message: "تم حذف  الاشعار بنجاح " });
  } catch (err) {
    console.error("خطأ في حذف الاشعار:", err);
    res
      .status(500)
      .json({ message: "فشل في حذف جميع السجل", error: err.message });
  }
};
