const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const Coordinator = require("../models/Coordinator.model");
const DistrictManager = require("../models/DistrictManager.model");
const {
  stripPasswordFromArray,
  stripPassword,
} = require("../utils/stripPassword");
const District = require("../models/District.model");
const Governate = require("../models/Governate.model");
const ElectionCenter = require("../models/ElectionCenter.model");
const Subdistrict = require("../models/Subdistrict.model");
const CoordinatorElectionCenter = require("../models/CoordinatorElectionCenter");
const DistrictManagerElectionCenter = require("../models/DistrictManagerElectionCenter");
const sequelize = require('../config/database');
// Admin: Add a new user

exports.adminAddUser = async (req, res) => {
  const t = await sequelize.transaction(); // start transaction

  try {
    const {
      email,
      phone_number,
      password,
      first_name,
      second_name,
      last_name,
      role,
      is_active,
      birth_year,
      election_center_id,
      election_centers_id = [],
      district_id,
      governorate_id,
      subdistrict_id,
      has_voted,
      confirmed_voting,
      has_updated_card,
      can_vote,
    } = req.body;

    const profileImageFile =
      req.files && req.files["profile_image"]
        ? req.files["profile_image"][0].filename
        : null;
    const identityImageFile =
      req.files && req.files["identity_image"]
        ? req.files["identity_image"][0].filename
        : null;
    const cardImageFile =
      req.files && req.files["voting_card_image"]
        ? req.files["voting_card_image"][0].filename
        : null;

    // Role validation
    const validRoles = [
      "voter",
      "observer",
      "coordinator",
      "center_manager",
      "district_manager",
      "finance_auditor",
      "system_admin",
    ];
    if (!validRoles.includes(role)) {
      await t.rollback();
      return res.status(400).json({
        message: "ادخل دور صحيح",
      });
    }

    if (!phone_number || !password) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "الرجاء ادخال رقم الهاتف و كلمة المرور" });
    }

    const existingUser = await User.findOne({ where: { phone_number }, transaction: t });
    if (existingUser) {
      await t.rollback();
      return res.status(409).json({ message: "رقم الهاتف موجود" });
    }

    if (election_center_id) {
      const existingCenter = await ElectionCenter.findOne({
        where: { id: election_center_id },
        transaction: t,
      });
      if (!existingCenter) {
        await t.rollback();
        return res.status(404).json({ message: "لا يوجد مركز انتخابي" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create(
      {
        email,
        phone_number,
        password_hash: hashedPassword,
        first_name,
        second_name,
        last_name,
        birth_year,
        role,
        election_center_id: election_center_id || null,
        profile_image: profileImageFile || null,
        identity_image: identityImageFile || null,
        voting_card_image: cardImageFile || null,
        added_by: req.user.id, 
        governorate_id: governorate_id || null,
        district_id: district_id || null,
        subdistrict_id: subdistrict_id || null,
        has_voted: has_voted || false,
        has_updated_card: has_updated_card || false,
        confirmed_voting: confirmed_voting || false,
        can_vote: can_vote || false,
        is_active: is_active !== undefined ? is_active : true,
        registration_type: "admin_created",
        confirmed_voting: false,
      },
      { transaction: t }
    );

    if (role === "coordinator") {
      try {
        const coordinator = await Coordinator.create(
          {
            user_id: newUser.id,
          },
          { transaction: t }
        );

        if (Array.isArray(election_centers_id)) {
          for (const centerId of election_centers_id) {
            try {
              await CoordinatorElectionCenter.create(
                {
                  coordinator_id: coordinator.id,
                  election_center_id: centerId,
                },
                { transaction: t }
              );
            } catch (err) {
              await t.rollback();
              return res.status(400).json({
                message: "خطأ في اضافة المرتكز",
                error: err.message,
              });
            }
          }
        }
      } catch (err) {
        await t.rollback();
        return res.status(400).json({
          message: "خطأ في اضافة المراكز",
          error: err.message,
        });
      }
    }

    if (role === "district_manager") {
      const districtManager = await DistrictManager.create(
        {
          user_id: newUser.id,
          governorate_id,
          district_id,
        },
        { transaction: t }
      );

      if (Array.isArray(election_centers_id)) {
        for (const centerId of election_centers_id) {
          await DistrictManagerElectionCenter.create(
            {
              district_manager_id: districtManager.id,
              election_center_id: centerId,
            },
            { transaction: t }
          );
        }
      }
    }

    await t.commit(); // commit transaction
    res.status(201).json({ data: stripPassword(newUser) });
  } catch (err) {
    await t.rollback(); // rollback on error
    res.status(500).json({ message: "فشل في اضافة مستخدم", error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: District,
          attributes: ["id", "name"],
        },
        {
          model: Subdistrict,
          attributes: ["id", "name"],
        },
        {
          model: ElectionCenter,
          attributes: ["id", "name"],
        },
      ],
    });
    res.json({ data: stripPasswordFromArray(users) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في جلب المستخدمين", error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: District,
          attributes: ["id", "name"],
        },
        {
          model: Subdistrict,
          attributes: ["id", "name"],
        },
        {
          model: ElectionCenter,
          attributes: ["id", "name"],
        },
      ],
    });

    res.json({ data: stripPassword(user) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في جلب المستخدمين", error: err.message });
  }
};

exports.getAllUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.findAll({
      where: { role },
      include: [
        {
          model: District,
          attributes: ["id", "name"],
        },
        {
          model: Subdistrict,
          attributes: ["id", "name"],
        },
        {
          model: ElectionCenter,
          attributes: ["id", "name"],
        },
      ],
    });
    if (!role) {
      return res.status(400).json({ message: "الدور مطلوب" });
    }
    res.json({ data: stripPasswordFromArray(users) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في جلب المستخدمين", error: err.message });
  }
};

// Admin: Update any user
exports.adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    const {
      email,
      phone_number,
      first_name,
      second_name,
      last_name,
      role,
      is_active,
      birth_year,
      election_center_id,
      district_id,
      governorate_id,
      subdistrict_id,
      has_voted,
      confirmed_voting,
      has_updated_card,
      can_vote,
      identity_image,
      profile_image,
      voting_card_image,
    } = req.body;

    const profileImageFile = req.files?.profile_image?.[0]?.filename || null;
    const identityImageFile = req.files?.identity_image?.[0]?.filename || null;
    const cardImageFile = req.files?.voting_card_image?.[0]?.filename || null;

    // Check if new phone_number is unique (if provided and changed)
    if (phone_number && phone_number !== user.phone_number) {
      const existing = await User.findOne({ where: { phone_number } });
      if (existing) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
    }

    // Build update object dynamically
    const updateData = {
      first_name,
      second_name,
      last_name,
      phone_number,
      email,
      birth_year,
      role,
      election_center_id,
      is_active,
      has_voted,
      confirmed_voting,
      district_id,
      governorate_id,
      subdistrict_id,
      has_updated_card,
      can_vote,

      profile_image: profileImageFile || profile_image || user.profile_image,
      identity_image:
        identityImageFile || identity_image || user.identity_image,
      voting_card_image:
        cardImageFile || voting_card_image || user.voting_card_image,
    };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    await user.update(updateData);

    const fullUser = await User.findByPk(user.id);

    res.status(200).json({ data: stripPassword(fullUser) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تحديث المستخدم", error: err.message });
  }
};

// Admin: Delete any user
exports.adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "لا يمكن لادمن ان يحذف ادمن " });
    }

    await user.destroy();
    res.json({ message: "تم حذف المستخدم بنجاح" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في حذف المستخدم", error: err.message });
  }
};

exports.deleteAllUsers = async (req, res) => {
  try {
    await User.destroy({ where: {} });
    res.json({ message: "تم حذف جميع المستخدمين بنجاح" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في حذف المستخدمين", error: err.message });
  }
};
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    user.is_active = !user.is_active;
    await user.save();
    res.json({
      data: stripPassword(user),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تغيير فعالية المستخدم", error: err.message });
  }
};

exports.setAdminRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { makeAdmin } = req.body; // true to assign, false to revoke
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "لم يتم ايجاد المستخدم" });
    }
    user.role = makeAdmin ? "system_admin" : "user";
    await user.save();
    res.json({ data: stripPassword(user) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تعيين دور admin", error: err.message });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole } = req.body;
    if (!req.body) {
      return res.status(400).json({ message: "ادخل المعلومات المطلوبة" });
    }

    if (!newRole) {
      return res.status(400).json({ message: "ادخل الدور" });
    }

    const validRoles = [
      "voter",
      "observer",
      "coordinator",
      "center_manager",
      "district_manager",
      "finance_auditor",
      "system_admin",
    ];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        message: "الدور غير موجود",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    user.role = newRole;
    await user.save();

    res.json({ data: stripPassword(user) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "لا يمكن تحديث دور المستخدم", error: err.message });
  }
};

// confirm-voting
exports.confirmVoting = async (req, res) => {
  try {
    const userId = req.params.id; // ID of the user to confirm
    const confirmerRole = req.user.role; // assuming req.user is set by auth middleware

    // Only allow roles higher than 'voter'
    const allowedRoles = [
      "observer",
      "coordinator",
      "center_manager",
      "district_manager",
      "finance_auditor",
      "system_admin",
    ];
    if (!allowedRoles.includes(confirmerRole)) {
      return res
        .status(403)
        .json({ message: "ليس لديك صلاحية لتاكيد التصويت" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    user.confirmed_voting = true;
    await user.save();

    res.json({ data: user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تأكيد التصويت", error: err.message });
  }
};
