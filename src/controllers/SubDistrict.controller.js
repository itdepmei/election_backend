// Subdistrict Controllers
const Subdistrict = require("../models/Subdistrict.model");
const District = require("../models/District.model");
const Governorate = require("../models/Governate.model");
const ElectionCenter = require("../models/ElectionCenter.model");
const { User } = require("../models");
const sequelize = require("../config/database");

exports.createSubdistricts = async (req, res) => {
  try {
    const data = req.body;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({ message: "No data provided" });
    }

    const records = Array.isArray(data) ? data : [data];

    // Validate district existence
    for (const item of records) {
      const district = await District.findByPk(item.district_id);
      if (!district) {
        return res
          .status(400)
          .json({ message: `District not found with id: ${item.district_id}` });
      }
    }

    for (const item of records) {
      const governorate = await Governorate.findByPk(item.governorate_id);
      if (!governorate) {
        return res
          .status(400)
          .json({
            message: `Governorate not found with id: ${item.governorate_id}`,
          });
      }
    }

    const newSubdistricts = await Subdistrict.bulkCreate(records, {
      ignoreDuplicates: true,
    });
    res.status(201).json({ data: newSubdistricts });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create subdistricts", error: err.message });
  }
};

exports.getAllSubdistricts = async (req, res) => {
  try {
    const subdistricts = await Subdistrict.findAll({
      attributes: ["id", "name" ,         [sequelize.col('Governorate.name'), 'governorate'],
          [sequelize.col('District.name'), 'district'],
],
      include: [
        {
          model: District,
          attributes: [],
        
        },
        {
          model: Governorate,
          attributes: [],
        },
        {
          model: ElectionCenter,
          attributes: ["id"], // Only need id for counting
        },
        { model: User, attributes: ["id", "confirmed_voting"] },
      ],
      group : ['Governorate.name' , 'District.name']
    });

    // Add election_centers_count in JS
    const data = subdistricts.map((sub) => {
      const obj = sub.get({ plain: true });
      obj.election_centers_count = obj.ElectionCenters
        ? obj.ElectionCenters.length
        : 0;
      obj.users_count = obj.Users ? obj.Users.length : 0;
      obj.confirmed_voting_users_count = obj.Users
        ? obj.Users.filter((user) => user.confirmed_voting === true).length
        : 0;
      delete obj.ElectionCenters;
      delete obj.Users;

      return obj;
    });

    res.json({ data: data });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve subdistricts", error: err.message });
  }
};

exports.getSubdistrictById = async (req, res) => {
  try {
    const { id } = req.params;

    const subdistrict = await Subdistrict.findOne({
      where: { id },
      attributes: [
        'id',
        'name',
        [sequelize.col('District.name'), 'district_name'],
        [sequelize.col('Governorate.name'), 'governorate_name']
      ],
      include: [
        {
          model: District,
          attributes: []
        },
        {
          model: Governorate,
          attributes: []
        },
        {
          model: ElectionCenter,
          attributes: ['id'] // For counting only
        },
        {
          model: User,
          attributes: ['id', 'confirmed_voting']
        }
      ]
    });

    if (!subdistrict) {
      return res.status(404).json({ message: "Subdistrict not found" });
    }

    const plainSub = subdistrict.get({ plain: true });

    plainSub.election_centers_count = plainSub.ElectionCenters?.length || 0;
    plainSub.users_count = plainSub.Users?.length || 0;
    plainSub.confirmed_voting_users_count = plainSub.Users
      ? plainSub.Users.filter(user => user.confirmed_voting === true).length
      : 0;

    delete plainSub.ElectionCenters;
    delete plainSub.Users;

    res.json({ data: plainSub });

  } catch (err) {
    console.error("Get subdistrict by ID error:", err);
    res.status(500).json({
      message: "Failed to retrieve subdistrict",
      error: err.message,
    });
  }
};


exports.updateSubdistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, district_id } = req.body;

    const subdistrict = await Subdistrict.findByPk(id);
    if (!subdistrict) {
      return res.status(404).json({ message: "Subdistrict not found" });
    }

    if (district_id) {
      const district = await District.findByPk(district_id);
      if (!district) {
        return res.status(400).json({ message: "District not found" });
      }
    }

    await subdistrict.update({ name, district_id });
    res.json({ data: subdistrict });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update subdistrict", error: err.message });
  }
};

exports.deleteSubdistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const subdistrict = await Subdistrict.findByPk(id);
    if (!subdistrict) {
      return res.status(404).json({ message: "Subdistrict not found" });
    }
    await subdistrict.destroy();
    res.json({ message: "Subdistrict deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete subdistrict", error: err.message });
  }
};

exports.deleteAllSubdistricts = async (req, res) => {
  try {
    await Subdistrict.destroy({ where: {}, truncate: true });
    res.json({ message: "All subdistricts deleted" });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Failed to delete all subdistricts",
        error: err.message,
      });
  }
};
