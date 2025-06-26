const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const {
  stripPasswordFromArray,
  stripPassword,
} = require("../utils/stripPassword");
const  ElectionCenter  = require("../models");


// REGISTER
exports.register = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  async (req, res) => {
    console.log("Request body:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      console.log(req.body);
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
        return res.status(409).json({ message: "phone number already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      if (election_center_id) {
        const exisitingCenter = await ElectionCenter.findOne({
          where: { id: election_center_id },
        });
        if (!exisitingCenter) {
          return res.status(404).json({ message: "Election Center not found" });
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
        role: "voter",
        // election_center_id: election_center_id || null,
        profile_image: profileImageFile || null,
        identity_image: identityImageFile || null,
        voting_card_image: cardImageFile || null,
        // is_active: is_active !== undefined ? is_active : true,
        registration_type: "self_registered",
        confirmed_voting: false,
      });

      const token = jwt.sign(
        {
          id: newUser.id,
          phone_number: newUser.phone_number,
          role: newUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({ data: stripPassword(newUser), token: token });
      console.log("res", res.cookie);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Registration failed", error: err.message });
    }
  },
];

exports.login = [
  body("phone_number")
    .isMobilePhone("any")
    .withMessage("Invalid phone number format"),
  body("password").notEmpty().withMessage("Password is required"),

  async (req, res) => {
    console.log("Request body:", req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phone_number, password } = req.body;
      const user = await User.findOne({ where: { phone_number } });

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res
          .status(401)
          .json({ message: "Invalid phone number or password" });
      }

      const token = jwt.sign(
        { id: user.id, phone_number: user.phone_number, role: user.role },
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
      res.status(500).json({ message: "Login failed", error: err.message });
    }
  },
];

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
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
    } = req.body;

    const profileImageFile = req.files?.profile_image?.[0]?.filename || null;
    const identityImageFile = req.files?.identity_image?.[0]?.filename || null;
    const cardImageFile = req.files?.voting_card_image?.[0]?.filename || null;

    // Check if new phone_number is unique
    if (phone_number && phone_number !== user.phone_number) {
      const existing = await User.findOne({ where: { phone_number } });
      if (existing) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
    }

    // Build update object dynamically
    const updateData = {
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
      registration_type: user.registration_type,
      confirmed_voting: user.confirmed_voting,

      profile_image: profileImageFile || profile_image || user.profile_image,
      identity_image:
        identityImageFile || identity_image || user.identity_image,
      voting_card_image:
        cardImageFile || voting_card_image || user.voting_card_image,
    };

    // Remove undefined so we don’t accidentally overwrite with undefined
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    await user.update(updateData);

    const fullUser = await User.findByPk(user.id);

    const token = jwt.sign(
      {
        id: fullUser.id,
        phone_number: fullUser.phone_number,
        role: fullUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ data: stripPassword(fullUser), token:token

     });
  } catch (err) {
    console.error("UpdateMe Error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    const token = jwt.sign(
      { id: user.id, phone_number: user.phone_number, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ data: stripPassword(user), token: token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to change password", error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ data: stripPassword(user) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve user", error: err.message });
  }
};
