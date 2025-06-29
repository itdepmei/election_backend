const Coordinator = require("../models/Coordinator.model");
const User = require('../models/user.model');
const ElectionCenter = require('../models/ElectionCenter.model');

exports.getAllCoordinators = async (req, res) => {
  try {
    const { id } = req.params;

    const coordinator = await Coordinator.findAll({
      include: [
        {
          model: User,
          exclude : ["password_hash"]
          
        },
        {
          model: ElectionCenter,
        }
      ]
    });

    if (!coordinator) {
      return res.status(404).json({ message: 'لم يتم العثور على المرتكز' });
    }

    res.status(200).json(coordinator);

  } catch (error) {
    console.error("خطأ في جلب المرتكز:", error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المرتكز', error: error.message });
  }
};

