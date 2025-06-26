const Tapes  = require("../models/Tapes.models");
const Station = require('../models/Station.model')
const ElectionCenter = require('../models/ElectionCenter.model')

exports.createTapes = async (req, res) => {
  try {
    const body = req.body;

    // Normalize input to array
    const dataArray = Array.isArray(body) ? body : [body];

    // Validate input
    for (const item of dataArray) {
      if (!item || !item.election_center_id || !item.station_id || !item.date) {
        return res.status(400).json({ message: "Missing required fields in tape data" });
      }
    }

    // Normalize files
    const files = req.files?.tape_image || [];

    // Construct tape data with image
    const tapesToCreate = dataArray.map((item, index) => ({
      election_center_id: item.election_center_id,
      station_id: item.station_id,
      date: item.date,
      tape_image: files[index]?.filename || null,
      notes: item.notes || null,
    }));

    const tapes = await Tapes.bulkCreate(tapesToCreate, { validate: true });

    res.status(201).json({ data: tapes });
  } catch (err) {
    console.error('Create Tapes Error:', err);
    res.status(500).json({ message: 'Failed to create tapes', error: err.message });
  }
};



exports.getTapes = async (req, res) => {
  try {

    
    const tapes = await Tapes.findAll({
      include: [
        { model: Station, attributes: ['id', 'name'] },
        { model: ElectionCenter, attributes: ['id', 'name'] }
      ]
    });

    if (!tapes.length) {
        return res.status(404).json({ message: 'No tapes found' });
        }
    res.json({ data: tapes });
  } catch (err) {
    console.error('Get Tapes Error:', err);
    res.status(500).json({ message: 'Failed to fetch tapes', error: err.message });
  }
};

exports.getTapeById = async (req, res) => {
  try {
    const tape = await Tapes.findByPk(req.params.id, {
      include: [
        { model: Station, attributes: ['id', 'name'] },
        { model: ElectionCenter, attributes: ['id', 'name'] }
      ]
    });

    if (!tape) {
      return res.status(404).json({ message: 'Tape not found' });
    }

    res.json({ data: tape });
  } catch (err) {
    console.error('Get Tape by ID Error:', err);
    res.status(500).json({ message: 'Failed to fetch tape', error: err.message });
  }
};


exports.updateTape = async (req, res) => {
  try {
    const tape = await Tapes.findByPk(req.params.id);

    if (!tape) {
      return res.status(404).json({ message: 'Tape not found' });
    }

    const { election_center_id, station_id, date , notes} = req.body;

    const newTapeImage = req.files?.tape_image?.[0]?.filename || tape.tape_image;

    const updateData = {
      election_center_id: election_center_id || tape.election_center_id,
      station_id: station_id || tape.station_id,
      date: date || tape.date,
      tape_image: newTapeImage
      , notes: notes || tape.notes
    };

    await tape.update(updateData);

    res.json({ data: tape });
  } catch (err) {
    console.error('Update Tape Error:', err);
    res.status(500).json({ message: 'Failed to update tape', error: err.message });
  }
};


exports.deleteTape = async (req, res) => {
  try {
    const deleted = await Tapes.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Tape not found' });
    }

    res.json({ message: 'Tape deleted successfully' });
  } catch (err) {
    console.error('Delete Tape Error:', err);
    res.status(500).json({ message: 'Failed to delete tape', error: err.message });
  }
};

exports.deleteAllTapes = async (req, res) => {
  try {
    const count = await Tapes.destroy({ where: {}, truncate: true });

    res.json({ message: `All tapes deleted` });
  } catch (err) {
    console.error('Delete All Tapes Error:', err);
    res.status(500).json({ message: 'Failed to delete all tapes', error: err.message });
  }
};

