const adminAddUser = require("./admin.auth.controller");
const Coordinator = require("../models/Coordinator.model");
const CoordinatorElectionCenter = require("../models/coordinatorElectionCenter.model");

exports.addCoordinator = async (req, res) => {
  try {
    const { phone_number, password, first_name, election_center_ids } = req.body;

    if (!Array.isArray(election_center_ids) || election_center_ids.length === 0) {
      return res.status(400).json({ message: "At least one election center is required" });
    }

    const user = await adminAddUser({ phone_number, password, first_name });

    const coordinator = await Coordinator.create({
      user_id: user.id
    });

    const centerLinks = election_center_ids.map(centerId => ({
      coordinator_id: coordinator.id,
      election_center_id: centerId
    }));

    await CoordinatorElectionCenter.bulkCreate(centerLinks);

    res.status(201).json({
      message: "Coordinator added successfully",
      data: { user, coordinator, assigned_centers: election_center_ids }
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to add coordinator", error: err.message });
  }
};


