const ElectionCenter = require('../models/ElectionCenter.model')
const Station = require('../models/Station.model');
const User = require('../models/user.model');
const Governorate = require('../models/Governate.model');
const District = require('../models/District.model');
const Subdistrict = require('../models/Subdistrict.model');

const { fn, col, literal } = require('sequelize');

exports.createElectionCenters = async (req, res) => {
  try {
    const input = req.body;

    // Check if input is an array (bulk insert) or a single object
    if (Array.isArray(input)) {
      if (input.length === 0) {
        return res.status(400).json({ message: "Empty array provided" });
      }

      const createdCenters = await ElectionCenter.bulkCreate(input, { validate: true });
      res.status(201).json({ data: createdCenters });
    } else {
      const createdCenter = await ElectionCenter.create(input);
      res.status(201).json({data: createdCenter });
    }
  } catch (err) {
    console.error("Create ElectionCenter Error:", err);
    res.status(500).json({ message: "Failed to create election center(s)", error: err.message });
  }
};


exports.getElectionCenters = async (req, res) => {
  try {
    const centers = await ElectionCenter.findAll({
      attributes: [
        'id',
        'name',
        'code',
        'address',
        'supply_code',
        'supply_name',
        'registration_center_code',
        'registration_center_name',
        [fn('COUNT', col('Stations.id')), 'stations_count'],
        [fn('COUNT', col('Users.id')), 'users_count'],
        [col('Governorate.name'), 'governorate_name'],
        [col('District.name'), 'district_name'],
        [col('Subdistrict.name'), 'subdistrict_name'],
        [col('center_manager.first_name'), 'center_manager_first_name'],
        [col('center_manager.last_name'), 'center_manager_last_name'],
      ],
      include: [
        { model: Station, attributes: [], required: false },
        { model: User, attributes: [], required: false },
        { model: Governorate, attributes: [] },
        { model: District, attributes: [] },
        { model: Subdistrict, attributes: [] },
        { model: User, as: 'center_manager', attributes: [] }
      ],
      group: [
        'ElectionCenter.id',
        'Governorate.id',
        'District.id',
        'Subdistrict.id',
        'center_manager.id'
      ]
    });

    // Convert to plain JSON and rename center_manager field to a full name string
    const data = centers.map(c => {
      const center = c.get({ plain: true });
      center.center_manager_name = center.center_manager_first_name && center.center_manager_last_name
        ? `${center.center_manager_first_name} ${center.center_manager_last_name}`
        : null;

      delete center.center_manager_first_name;
      delete center.center_manager_last_name;

      return center;
    });

    res.json({ data });
  } catch (err) {
    console.error("Error fetching election centers:", err);
    res.status(500).json({ message: "Failed to fetch election centers", error: err.message });
  }
};

exports.getElectionCenterById = async (req, res) => {
  try {
    const { id } = req.params;

    const center = await ElectionCenter.findOne({
      where: { id },
      attributes: [
        'id',
        'name',
        'code',
        'address',
        'supply_code',
        'supply_name',
        'registration_center_code',
        'registration_center_name',
        [fn('COUNT', col('Stations.id')), 'stations_count'],
        [fn('COUNT', col('Users.id')), 'users_count'],
        [col('Governorate.name'), 'governorate_name'],
        [col('District.name'), 'district_name'],
        [col('Subdistrict.name'), 'subdistrict_name'],
        [col('center_manager.first_name'), 'center_manager_first_name'],
        [col('center_manager.last_name'), 'center_manager_last_name'],
      ],
      include: [
        { model: Station, attributes: [], required: false },
        { model: User, attributes: [], required: false },
        { model: Governorate, attributes: [] },
        { model: District, attributes: [] },
        { model: Subdistrict, attributes: [] },
        { model: User, as: 'center_manager', attributes: [] }
      ],
      group: [
        'ElectionCenter.id',
        'Governorate.id',
        'District.id',
        'Subdistrict.id',
        'center_manager.id'
      ]
    });

    if (!center) {
      return res.status(404).json({ message: `Election center with ID ${id} not found` });
    }

    const result = center.get({ plain: true });

    result.center_manager_name = result.center_manager_first_name && result.center_manager_last_name
      ? `${result.center_manager_first_name} ${result.center_manager_last_name}`
      : null;

    delete result.center_manager_first_name;
    delete result.center_manager_last_name;

    res.json({ data: result });
  } catch (err) {
    console.error("Error fetching election center by ID:", err);
    res.status(500).json({ message: "Failed to fetch election center", error: err.message });
  }
};

exports.updateElectionCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const center = await ElectionCenter.findByPk(id);

    if (!center) {
      return res.status(404).json({ message: `Election center with ID ${id} not found` });
    }

    await center.update(updates);

    res.json({  data: center });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update election center", error: err.message });
  }
}

exports.deleteElectionCenter = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ElectionCenter.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: `Election center with ID ${id} not found` });
    }

    res.json({ message: `Election center with ID ${id} deleted successfully` });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete election center", error: err.message });
  }
};

exports.deleteElectionCentersBulk = async (req, res) => {
  try {
    const { ids } = req.body; 

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Please provide an array of IDs to delete" });
    }
    const deletedCount = await ElectionCenter.destroy({
      where: { id: ids }
    });

    res.json({ message: `Deleted ${deletedCount} election center(s)` });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({ message: "Failed to delete election centers", error: err.message });
  }
};

exports.deleteAllElectionCenters = async (req, res) => {
  try {
    const deletedCount = await ElectionCenter.destroy({
      where: {},
      truncate: true 
    });

    res.json({ message: `All election centers deleted (${deletedCount} record(s))` });
  } catch (err) {
    console.error("Delete all error:", err);
    res.status(500).json({ message: "Failed to delete all election centers", error: err.message });
  }
};
