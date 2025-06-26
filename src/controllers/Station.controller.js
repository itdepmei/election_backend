const { Tapes, ElectionCenter } = require("../models");
const Station = require("../models/Station.model");
const sequelize = require("../config/database");

exports.createStations = async (req, res) => {
  try {
    const input = req.body;

    if (Array.isArray(input)) {
      if (input.length === 0) {
        return res.status(400).json({ message: "Empty array provided" });
      }

      const created = await Station.bulkCreate(input, { validate: true });
      return res.status(201).json({ data: created });
    } else {
      const created = await Station.create(input);
      return res.status(201).json({ data: created });
    }
  } catch (err) {
    console.error("Create Station Error:", err);
    res
      .status(500)
      .json({ message: "Failed to create station(s)", error: err.message });
  }
};

exports.getStations = async (req, res) => {
  try {
    const stations = await Station.findAll({
      attributes: [
        "id",
        "name",
        "code",
        "election_center_id",
        [sequelize.fn("COUNT", sequelize.col("Tapes.id")), "tape_count"],
      ],
      include: [
        {
          model: Tapes,
          attributes: [],
          required: false,
        },
        {
          model: ElectionCenter,
          attributes: ["id", "name"], // no nested object, just extract the field above
          required: false,
        },
      ],
      group: ["Station.id"],
    });

    res.json({ data: stations });
  } catch (err) {
    console.error("Get stations error:", err);
    res.status(500).json({
      message: "Failed to fetch stations",
      error: err.message,
    });
  }
};

exports.getStationById = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await Station.findByPk(id, {
      include: [
        {
          model: ElectionCenter,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!station) {
      return res
        .status(404)
        .json({ message: `Station with ID ${id} not found` });
    }

    res.json({ data: station });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch station", error: err.message });
  }
};

exports.updateStation = async (req, res) => {
  try {
    const { id } = req.params;

      if (!id || isNaN(id)) {
  return res.status(400).json({ message: "Invalid station ID" });
}

    const updates = req.body;

    const station = await Station.findByPk(id);
    if (!station) {
      return res
        .status(404)
        .json({ message: `Station with ID ${id} not found` });
    }

    await station.update(updates);
    res.json({ data: station });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update station", error: err.message });
  }
};

exports.deleteStation = async (req, res) => {
  try {
    const { id } = req.params;

      if( !id ) {
      return res.status(400).json({ message: "Invalid station ID" });
    }

    const deleted = await Station.destroy({ where: { id } });

  
    if (!deleted) {
      return res
        .status(404)
        .json({ message: `Station with ID ${id} not found` });
    }

    res.json({ message: `Station with ID ${id} deleted` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete station", error: err.message });
  }
};

exports.deleteAllStations = async (req, res) => {
  try {
    const stations = await Station.findAll({});

    await Station.destroy({ where: {}, truncate: true }); // truncates and resets IDs

    res.json({
      message: "All stations deleted successfully",
    });
  } catch (err) {
    console.error("Delete all stations error:", err);
    res.status(500).json({
      message: "Failed to delete all stations",
      error: err.message,
    });
  }
};
