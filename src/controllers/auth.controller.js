const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const {
  stripPasswordFromArray,
  stripPassword,
} = require("../utils/stripPassword");
const ElectionCenter = require("../models/ElectionCenter.model");
const { addLog } = require("../utils/Logger");

// REGISTER
exports.register = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {
        phone_number,
        password,
        birth_year,
        email,
        first_name,
        second_name,
        last_name,
        can_vote,
        has_updated_card,
        has_voted,
        election_center_id,
        role,
        address , 
        voting_card_number,
        station_id
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

      const existingUser = await User.findOne({ where: { phone_number } });
      if (existingUser) {
        return res.status(409).json({ message: "رقم الهاتف مستخدم" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      if (election_center_id) {
        const exisitingCenter = await ElectionCenter.findOne({
          where: { id: election_center_id },
        });
        if (!exisitingCenter) {
          return res.status(404).json({ message: "المركز غير موجود" });
        }
      }

      const newUser = await User.create({
        email: email || "",
        phone_number,
        password_hash: hashedPassword,
        first_name,
        second_name,
        last_name,
        birth_year,
        can_vote,
        has_updated_card,
        election_center_id,
        has_voted,
        role: role || "voter",
        address ,
        voting_card_number,
        station_id,
        // election_center_id: election_center_id || null,
        profile_image: profileImageFile || null,
        identity_image: identityImageFile || null,
        voting_card_image: cardImageFile || null,
        // is_active: is_active !== undefined ? is_active : true,
        confirmed_voting: false,
      });

      const token = jwt.sign(
        {
          id: newUser.id,
          phone_number: newUser.phone_number,
          role: newUser.role,
          election_center_id: newUser.election_center_id,
          first_name: newUser.first_name,
          second_name: newUser.second_name,
          last_name: newUser.last_name,
          campaign_id: newUser.campaign_id || null,
        
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      await addLog({
        first_name: newUser.first_name || "",
        second_name: newUser.second_name || "",
        last_name: newUser.last_name || "",
        action: "اضافة",
        message: `تم تسجيل مستخدم جديد برقم الهاتف: ${newUser.phone_number}`,
      });



      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({ data: stripPassword(newUser), token: token });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "فشل في تسجيل المستخدم", error: err.message });
    }
  },
];

exports.login = [
  body("password").notEmpty().withMessage("Password is required"),


  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phone_number, password } = req.body;
      console.log("Login attempt for:", phone_number , password);
      const user = await User.findOne({ where: { phone_number } });

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res
          .status(401)
          .json({ message: "رقم الهاتف او كلمة السر غير صحيحة" });
      }

      const token = jwt.sign(
        { id: user.id, phone_number: user.phone_number, role: user.role , election_center_id: user.election_center_id  , first_name: user.first_name, second_name: user.second_name, last_name: user.last_name , campaign_id: user.campaign_id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );



      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // لو تشتغلين بدون HTTPS في شبكة داخلية
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ data: stripPassword(user), token: token });
    } catch (err) {
      res
        .status(500)
        .json({ message: "فشل في تسجيل الدخول", error: err.message });
    }
  },
];

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  addLog({
    first_name: req.user?.first_name || "",
    second_name: req.user?.second_name || "",
    last_name: req.user?.last_name || "",
    campaign_id: req.user?.campaign_id || null,
    action: "تسجيل خروج",
    message: `تم تسجيل خروج المستخدم`,
  });

  res.json({ message: "تم تسجيل الخروج بنجاح" });
};

exports.updateMe = async (req, res) => {
  try {
    const user = req.user;

    // Destructure all editable fields
    const {
      email,
      first_name,
      second_name,
      last_name,
      phone_number,
      birth_year,
      role,
      election_center_id,
      governorate_id,
      district_id,
      subdistrict_id,
      can_vote,
      has_updated_card,
      has_voted,
      is_active,
      profile_image,
      identity_image,
      voting_card_image,
      voting_card_number, 
      address , 
      station_id
    } = req.body;

    const profileImageFile = req.files?.profile_image?.[0]?.filename || null;
    const identityImageFile = req.files?.identity_image?.[0]?.filename || null;
    const cardImageFile = req.files?.voting_card_image?.[0]?.filename || null;

    // Check if new phone_number is unique
    if (phone_number && phone_number !== user.phone_number) {
      const existing = await User.findOne({ where: { phone_number } });
      if (existing) {
        return res.status(409).json({ message: "رقم الهاتف مستخدم" });
      }
    }

    // Build update object dynamically
    const updateData = {};

    // Only include fields that are not undefined
    const fields = {
      email,
      first_name,
      second_name,
      last_name,
      phone_number,
      birth_year,
      role,
      election_center_id,
      governorate_id,
      district_id,
      subdistrict_id,
      can_vote,
      has_updated_card,
      has_voted,
      is_active,
      station_id,
      address,
      voting_card_number,
      station_id,
      profile_image: profileImageFile || profile_image || user.profile_image,
      identity_image:
        identityImageFile || identity_image || user.identity_image,
      voting_card_image:
        cardImageFile || voting_card_image || user.voting_card_image,
    };

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    await user.update(updateData);

    const fullUser = await User.findByPk(user.id);
    await addLog({
      first_name: req.user?.first_name || "",
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name || "",
      campaign_id: user.campaign_id || null,

      action: "تعديل",
      message: `تم تعديل بيانات المستخدم : ${user.fullname}`,
    });

    const token = jwt.sign(
        { id: fullUser.id, phone_number: fullUser.phone_number, role: fullUser.role , election_center_id: fullUser.election_center_id  , first_name: fullUser.first_name, second_name: fullUser.second_name, last_name: fullUser.last_name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ data: stripPassword(fullUser), token: token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تعديل المستخدم", error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "يجب ادخال كلمة السر القديمة والجديدة" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "كلمة السر القديمة غير صحيحة" });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    const token = jwt.sign(
      { id: user.id, phone_number: user.phone_number, role: user.role , election_center_id: user.election_center_id  , first_name: user.first_name, second_name: user.second_name, last_name: user.last_name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    await addLog({
      first_name: req.user?.first_name || "",
      second_name: req.user?.second_name || "",
      last_name: req.user?.last_name || "",
      campaign_id: user.campaign_id || null,
      action: "تعديل",
      message: `تم تغيير كلمة مرور المستخدم : ${user.fullname}`,
    });

    res.status(200).json({ data: stripPassword(user), token: token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في تغيير كلمة السر", error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.status(200).json({ data: stripPassword(user) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "فشل في جلب المعلومات", error: err.message });
  }
};
