const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const {
  stripPasswordFromArray,
  stripPassword,
} = require("../utils/stripPassword");
const District = require("../models/District.model");
const ElectionCenter = require("../models/ElectionCenter.model");
const Subdistrict = require("../models/Subdistrict.model");
const sequelize = require("../config/database");
const { addLog } = require("../utils/Logger");
const Campaign = require("../models/Campain.model");
const DistrictManager = require("../models/DistrictManager.model");
const Station = require("../models/Station.model");
// Admin: Add a new user
exports.adminAddUser = async (req, res) => {
  const t = await sequelize.transaction(); 

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
      district_id,
      governorate_id,
      subdistrict_id,
      has_voted,
      confirmed_voting,
      has_updated_card,
      can_vote,
      added_by , 
      station_id,
      address , 
      voting_card_number
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
      "owner",
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

    const existingUser = await User.findOne({
      where: { phone_number },
      transaction: t,
    });
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
        added_by,
        governorate_id: governorate_id || null,
        district_id: district_id || null,
        subdistrict_id: subdistrict_id || null,
        has_voted: has_voted || false,
        has_updated_card: has_updated_card || false,
        confirmed_voting: confirmed_voting || false,
        can_vote: can_vote || false,
        is_active: is_active !== undefined ? is_active : true,
        confirmed_voting: false,
        campaign_id: req.user.campaign_id,
        address,
        voting_card_number,
        station_id

      },
      { transaction: t }
    );

    if (role === "owner") {
      const campaign = await Campaign.create(

        { transaction: t }
      );

      await newUser.update({ campaign_id: campaign.id }, { transaction: t });
    }
    
      await addLog({
        first_name: newUser.first_name || "",
        second_name: newUser.second_name || "",
        last_name: newUser.last_name || "",
        campaign_id: req.user.campaign_id || null,
        action: "اضافة",
        message: `تم تسجيل مستخدم جديد برقم الهاتف: ${newUser.phone_number}`,
      });



    await t.commit();
    res.status(201).json({ data: stripPassword(newUser) });
  } catch (err) {
    await t.rollback();
    res
      .status(500)
      .json({ message: "فشل في اضافة مستخدم", error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { campaign_id: req.user.campaign_id },
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
        {
          model : Station , 
          attributes: ["id", "name"],
        }
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
      where: { id , campaign_id: req.user.campaign_id },
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
        { model : Station,
          attributes: ["id", "name"],

        }
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
      where: { role , campaign_id: req.user.campaign_id },
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
        { model : Station,
          attributes: ["id", "name"],
          }
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

exports.getAllConfirmedVoters = async (req, res) => {
  campaignId = req.user.campaign_id;
  try {
    const users = await User.findAll({
      where: { confirmed_voting: true, campaign_id: campaignId },
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
        {
          model: Station,
          attributes: ["id", "name"],
        }
      ],
    });
    res.json({ data: stripPasswordFromArray(users) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في جلب الناخبين المؤكدين", error: err.message });
  }
};

// Admin: Update any user
exports.adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requestBody = req.user;
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
      voting_card_number,
      address,
      added_by,
      station_id
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
      voting_card_number,
      address,
      added_by,
      station_id,
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
    
      await addLog({
        first_name: requestBody.first_name || "",
        second_name: requestBody.second_name || "",
        last_name: requestBody.last_name || "",
        campaign_id: requestBody.campaign_id || null,
        action: "تعديل",
        message: `تم تعديل بيانات المستخدم برقم الهاتف: ${user.phone_number}`,
      });

    res.status(200).json({ data: stripPassword(fullUser) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تعديل المستخدم", error: err.message });
  }
};

// Admin: Delete any user
exports.adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requestBody = req.user;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "لا يمكن لادمن ان يحذف ادمن " });
    }

    await user.destroy();
    await addLog({
      first_name: requestBody.first_name || "",
      second_name: requestBody.second_name || "",
      last_name: requestBody.last_name || "",
      action: "حذف",
      message: `تم حذف المستخدم برقم الهاتف: ${user.phone_number}`,
    });
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

    await addLog({
      first_name: req.user.first_name || "",
      second_name: req.user.second_name || "",
      last_name: req.user.last_name || "",
      campaign_id: req.user.campaign_id || null,
      action: "حذف",
      message: "تم حذف جميع المستخدمين",
    });

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
    await addLog({
      first_name: req.user.first_name || "",
      second_name: req.user.second_name || "",
      last_name: req.user.last_name || "",
      campaign_id: req.user.campaign_id || null,
      action: "تعديل ",
      message: `تم ${makeAdmin ? "تعيين" : "إلغاء"} دور admin للمستخدم برقم الهاتف: ${user.phone_number}`,
    });
    res.json({ data: stripPassword(user) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تعيين دور admin", error: err.message });
  }
};

exports.changeUserRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { newRole, election_centers_id } = req.body;

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
      return res.status(400).json({ message: "الدور غير موجود" });
    }

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const previousRole = user.role;
    user.role = newRole;
    await user.save({ transaction });

    // === Handle District Manager Logic ===
    if (newRole === "district_manager") {
      const exists = await DistrictManager.findOne({ where: { user_id: user.id }, transaction });
      if (!exists) {
        await DistrictManager.create({ user_id: user.id }, { transaction });
      }
    }

    // === Clean up previous role side-tables ===
    if (previousRole === "coordinator" && newRole !== "coordinator") {
      await Coordinator.destroy({ where: { user_id: user.id }, transaction });
    }

    if (previousRole === "district_manager" && newRole !== "district_manager") {
      await DistrictManager.destroy({ where: { user_id: user.id }, transaction });
    }

    await addLog({
      first_name: req.user.first_name || "",
      second_name: req.user.second_name || "",
      last_name: req.user.last_name || "",
      campaign_id: req.user.campaign_id || null,
      action: "تعديل ",
      message: `تم تغيير دور المستخدم برقم الهاتف: ${user.phone_number} إلى ${newRole}`,
    });

    await transaction.commit();

    return res.json({ data: stripPassword(user) });
  } catch (err) {
    await transaction.rollback();
    console.error("🚨 Failed to change user role:", err);
    return res.status(500).json({
      message: "لا يمكن تعديل دور المستخدم",
      error: err.message,
    });
  }
};


// confirm-voting
exports.confirmVoting = async (req, res) => {
  try {
    const userId = req.params.id; // ID of the user to confirm
    const confirmerRole = req.user.role; // req.user is set by auth middleware

    // Only allow roles higher than 'voter'
    const allowedRoles = [
      "observer",
      "coordinator",
      "center_manager",
      "district_manager",
      "finance_auditor",
      "system_admin",
      "owner",
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

    user.confirmed_voting = !user.confirmed_voting; // Toggle confirmed_voting status
    await user.save();

    await addLog({
      first_name: req.user.first_name || "",
      second_name: req.user.second_name || "",
      last_name: req.user.last_name || "",
      campaign_id: req.user.campaign_id || null,
      action: "تعديل ",
      message: `تم تأكيد تصويت المستخدم برقم الهاتف: ${user.phone_number}`,
    });


    res.json({ data: stripPassword(user) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تأكيد التصويت", error: err.message });
  }
};

// hasVoted 
exports.HasVoted = async (req, res) => {
  try {
    const userId = req.user.id; // ID of the user to confirm

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    user.has_voted = !user.has_voted; // Toggle confirmed_voting status
    await user.save();

    await addLog({
      first_name: req.user.first_name || "",
      second_name: req.user.second_name || "",
      last_name: req.user.last_name || "",
      campaign_id: req.user.campaign_id || null,
      action: "تعديل ",
      message: `تم تسجيل تصويت المستخدم برقم الهاتف: ${user.phone_number}`,
    });


    res.json({ data: stripPassword(user) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تأكيد التصويت", error: err.message });
  }
};

