const { ElectionCenter, User, sequelize } = require('../models');
const District = require('../models/District.model'); 
const Governorate = require('../models/Governate.model');
const Subdistrict = require('../models/Subdistrict.model');

// Create one or many districts with duplicate name check
exports.createDistricts = async (req, res) => {
  try {
    const data = req.body;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({ message: "No data provided" });
    }

    const records = Array.isArray(data) ? data : [data];

    // Extract governorate_ids from all records
    const governorateIds = records.map(r => r.governorate_id).filter(id => id !== undefined);

    // Check if all governorate_ids exist
    const existingGovernorates = await Governorate.findAll({
      where: { id: governorateIds }
    });

    const existingIds = existingGovernorates.map(g => g.id);

    const invalidIds = governorateIds.filter(id => !existingIds.includes(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: "Invalid governorate_id(s) provided", invalidIds });
    }

    // Check duplicate names like before
    const names = records.map(r => r.name);
    const existingDistricts = await District.findAll({ where: { name: names } });
    const existingNames = existingDistricts.map(d => d.name);

    const filteredRecords = records.filter(r => !existingNames.includes(r.name));

    if (filteredRecords.length === 0) {
      return res.status(409).json({ message: "All provided districts already exist", duplicates: existingNames });
    }

    const newDistricts = await District.bulkCreate(filteredRecords);

    res.status(201).json({
      data: newDistricts,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to create districts", error: err.message });
  }
};


// Get all districts
exports.getAllDistricts = async (req, res) => {
  try {
    const districts = await District.findAll({
      attributes :[
        'id',
        'name',
      
        [sequelize.col('Governorate.name'), 'governorate'],
      ],
      include: [
        {
          model: Governorate,
          attributes: []


        },
        {
          model: Subdistrict,
          attributes: ['id'], // Only fetch id to save bandwidth
        },
       
        {
          model: ElectionCenter,
          attributes: ['id'],
        },
        {
          model: User , 
         attributes: ['id' , "confirmed_voting"] }

      ],
      group: ['Governorate.name']
    });

    // Add subdistricts_count in JS
    const data = districts.map(dist => {
      const obj = dist.get({ plain: true });
      obj.subdistricts_count = obj.Subdistricts ? obj.Subdistricts.length : 0;
      obj.election_centers_count = obj.ElectionCenters ? obj.ElectionCenters.length : 0;
        obj.users_count = obj.Users ? obj.Users.length : 0;
        obj.confirmed_voting_users_count = obj.Users 
        ? obj.Users.filter(user => user.confirmed_voting === true).length 
        : 0;
      delete obj.Subdistricts; // Remove array if you only want the count
      delete obj.ElectionCenters;
      delete obj.Users;

      return obj;
    });

    res.json({ data:data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch districts", error: err.message });
  }
};

// Get district by ID
exports.getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;

    const district = await District.findOne({
      where: { id },
      attributes: [
        'id',
        'name',
        [sequelize.col('Governorate.name'), 'governorate']
      ],
      include: [
        {
          model: Governorate,
          attributes: []
        },
        {
          model: Subdistrict,
          attributes: ['id']
        },
        {
          model: ElectionCenter,
          attributes: ['id']
        },
        {
          model: User,
          attributes: ['id', 'confirmed_voting']
        }
      ]
    });

    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    const obj = district.get({ plain: true });

    obj.subdistricts_count = obj.Subdistricts?.length || 0;
    obj.election_centers_count = obj.ElectionCenters?.length || 0;
    obj.users_count = obj.Users?.length || 0;
    obj.confirmed_voting_users_count = obj.Users
      ? obj.Users.filter(user => user.confirmed_voting === true).length
      : 0;

    delete obj.Subdistricts;
    delete obj.ElectionCenters;
    delete obj.Users;

    res.json({ data: obj });
  } catch (err) {
    console.error("Get district by ID error:", err);
    res.status(500).json({ message: "Failed to retrieve district", error: err.message });
  }
};

// Update district by ID
exports.updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, governorate_id } = req.body;
    const district = await District.findByPk(id);

    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    // Check if name is changed and unique
    if (name && name !== district.name) {
      const existing = await District.findOne({ where: { name } });
      if (existing) {
        return res.status(409).json({ message: "District name already exists" });
      }
      district.name = name;
    }

    if (governorate_id !== undefined) {
      district.governorate_id = governorate_id;
    }

    await district.save();

    res.json({ data: district });

  } catch (err) {
    res.status(500).json({ message: "Failed to update district", error: err.message });
  }
};

// Delete district by ID
exports.deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const district = await District.findByPk(id);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }
    await district.destroy();
    res.json({ message: "District deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete district", error: err.message });
  }
};

// Delete all districts
exports.deleteAllDistricts = async (req, res) => {
  try {
    await District.destroy({ truncate: true, cascade: true });
    res.json({ message: "All districts deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete all districts", error: err.message });
  }
};
