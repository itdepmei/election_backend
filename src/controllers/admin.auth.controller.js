const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const Coordinator = require("../models/Coordinator.model");
const DistrictManager = require("../models/DistrictManager.model");
const {
  stripPasswordFromArray,
  stripPassword,
} = require("../utils/stripPassword");
const { District, Subdistrict, ElectionCenter } = require("../models");

// Admin: Add a new user

exports.adminAddUser = async (req, res) => {
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
      return res
        .status(400)
        .json({
          message: `Invalid role. Allowed roles: ${validRoles.join(", ")}`,
        });
    }

    if (!phone_number || !password) {
      return res
        .status(400)
        .json({ message: "Phone number and password are required" });
    }

    const existingUser = await User.findOne({ where: { phone_number } });
    if (existingUser) {
      return res.status(409).json({ message: "Phone number already exists" });
    }

    if (election_center_id) {
      const exisitingCenter = await ElectionCenter.findOne({
        where: { id: election_center_id },
      });
      if (!exisitingCenter) {
        return res.status(404).json({ message: "Election Center not found" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
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

      is_active: is_active !== undefined ? is_active : true,
      registration_type: "admin_created",
      confirmed_voting: false,
    });

    if (role === "coordinator") {
      const coordinator = await Coordinator.create({
        user_id: newUser.id,
      });

      if (Array.isArray(election_centers_id)) {
        for (const centerId of election_centers_id) {
          await CoordinatorElectionCenter.create({
            coordinator_id: coordinator.id,
            election_center_id: centerId,
          });
        }
      }
    }

    if (role === "district_manager") {
      const districtManager = await DistrictManager.create({
        user_id: newUser.id,
        governorate_id,
        district_id,
      });

      if (Array.isArray(election_centers_id)) {
        for (const centerId of election_centers_id) {
          await DistrictManagerElectionCenter.create({
            district_manager_id: districtManager.id,
            election_center_id: centerId,
          });
        }
      }
    }

    res.status(201).json({ data: stripPassword(newUser) });
  } catch (err) {
    res.status(500).json({ message: "Failed to add user", error: err.message });
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
      .json({ message: "Failed to retrieve users", error: err.message });
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
      .json({ message: "Failed to retrieve user", error: err.message });
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
      return res.status(400).json({ message: "Role is required" });
    }
    res.json({ data: stripPasswordFromArray(users) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve users", error: err.message });
  }
};

// Admin: Update any user
exports.adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const {
      first_name,
      second_name,
      last_name,
      phone_number,
      email,
      birth_year,
      role,
      election_center_id,
      is_active,
      profile_image,
      identity_image,
      voting_card_image,
      has_voted,
      confirmed_voting,
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
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// Admin: Delete any user
exports.adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res
        .status(403)
        .json({ message: "You cannot delete another admin" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: err.message });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.is_active = !user.is_active;
    await user.save();
    res.json({
      data: stripPassword(user),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to toggle is_active", error: err.message });
  }
};

exports.setAdminRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { makeAdmin } = req.body; // true to assign, false to revoke
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.role = makeAdmin ? "system_admin" : "user";
    await user.save();
    res.json({ data: stripPassword(user) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update role", error: err.message });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole } = req.body;
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    if (!newRole) {
      return res.status(400).json({ message: "New role is required" });
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
        message: `Invalid role. Allowed roles: ${validRoles.join(", ")}`,
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = newRole;
    await user.save();

    res.json({ data: stripPassword(user) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to change user role", error: err.message });
  }
};

// confirm-voting
exports.confirmVoting = async (req, res) => {
  try {
    const { userId } = req.params; // ID of the user to confirm
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
        .json({ message: "Not authorized to confirm voting" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.confirmed_voting = true;
    await user.save();

    res.json({ data: user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to confirm voting", error: err.message });
  }
};
