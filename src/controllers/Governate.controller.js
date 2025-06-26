const Governorate = require('../models/Governate.model');
const District = require('../models/District.model');
const Subdistrict = require('../models/Subdistrict.model');
const ElectionCenter = require('../models/ElectionCenter.model');
const { User } = require('../models');

// POST - Create one or many governorates
exports.createGovernorates = async (req, res) => {
  try {
    const data = req.body;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({ message: "No data provided" });
    }

    const records = Array.isArray(data) ? data : [data];

    const names = records.map(r => r.name);

    const existing = await Governorate.findAll({
      where: { name: names }
    });

    const existingNames = existing.map(g => g.name);

    
    // Filter out duplicates from records
    const filteredRecords = records.filter(r => !existingNames.includes(r.name));

    if (filteredRecords.length === 0) {
      return res.status(409).json({ message: "All provided governorates already exist", duplicates: existingNames });
    }

    const newGovernorates = await Governorate.bulkCreate(filteredRecords);

    res.status(201).json({ 
      created: newGovernorates,
      duplicates: existingNames
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to create governorates", error: err.message });
  }
};

// GET - Get all or by ID
// exports.getGovernorates = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (id) {
//       const governorate = await Governorate.findByPk(id);
//       if (!governorate) return res.status(404).json({ message: "Governorate not found" });
//       return res.json({ data: governorate });
//     }

//     const all = await Governorate.findAll();
//     res.json({ data: all });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch governorates", error: err.message });
//   }
// };


exports.getGovernorates = async (req, res) => {
  try {
    const governorates = await Governorate.findAll({
      include: [
        { model: District, attributes: ['id'] },
        { model: Subdistrict, attributes: ['id'] },
        { model: ElectionCenter, attributes: ['id'] },
        {model: User , attributes: ['id' , "confirmed_voting"] }

      ]
    });

    const data = governorates.map(gov => {
      const obj = gov.get({ plain: true });
      obj.districts_count = obj.Districts ? obj.Districts.length : 0;
      obj.subdistricts_count = obj.Subdistricts ? obj.Subdistricts.length : 0;
      obj.election_centers_count = obj.ElectionCenters ? obj.ElectionCenters.length : 0;
      obj.users_count = obj.Users ? obj.Users.length : 0;
        obj.confirmed_voting_users_count = obj.Users 
        ? obj.Users.filter(user => user.confirmed_voting === true).length 
        : 0;

      delete obj.Districts;
      delete obj.Subdistricts;
      delete obj.ElectionCenters;
      delete obj.Users;
      return obj;
    });

    res.json({ data: data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch governorates", error: err.message });
  }
};
// GET - Governorate by ID with counts
exports.getGovernorateById = async (req, res) => {
  try {
    const { id } = req.params;

    const governorate = await Governorate.findByPk(id, {
      include: [
        {
          model: District,
          attributes: ['id'], // just for count
        },
        {
          model: Subdistrict,
          attributes: ['id'], // just for count
        },
        {
          model: ElectionCenter,
          attributes: ['id'], // just for count
        },
        {
          model: User,
          attributes: ['id' , "confirmed_voting"] // just for count
        }

      ]
    });

    if (!governorate) {
      return res.status(404).json({ message: "Governorate not found" });
    }

    const obj = governorate.get({ plain: true });

    obj.districts_count = obj.Districts ? obj.Districts.length : 0;
    obj.subdistricts_count = obj.Subdistricts ? obj.Subdistricts.length : 0;
    obj.election_centers_count = obj.ElectionCenters ? obj.ElectionCenters.length : 0;
    obj.users_count = obj.Users ? obj.Users.length : 0;
    obj.confirmed_voting_count = obj.Users ? obj.Users.filter(user =>
      user.confirmed_voting).length : 0;

    // Clean the response by removing arrays
    delete obj.Districts;
    delete obj.Subdistricts;
    delete obj.ElectionCenters;
    delete obj.Users;

    res.json({ data: obj });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve governorate",
      error: err.message
    });
  }
};

// PUT - Update governorate by ID
exports.updateGovernorate = async (req, res) => {
  try {
    const { id } = req.params;
    const governorate = await Governorate.findByPk(id);

    if (!governorate) return res.status(404).json({ message: "Governorate not found" });

    await governorate.update(req.body);
    res.json({ data: governorate });
  } catch (err) {
    res.status(500).json({ message: "Failed to update governorate", error: err.message });
  }
};

// DELETE - One by ID
exports.deleteGovernorate = async (req, res) => {
  try {
    const { id } = req.params;
    const governorate = await Governorate.findByPk(id);
    if (!governorate) return res.status(404).json({ message: "Governorate not found" });

    await governorate.destroy();
    res.json({ message: "Governorate deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete governorate", error: err.message });
  }
};

// DELETE - All
exports.deleteAllGovernorates = async (req, res) => {
  try {
    await Governorate.destroy({ where: {} });
    res.json({ message: "All governorates deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete all governorates", error: err.message });
  }
};
