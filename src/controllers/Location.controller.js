const Location = require('../models/Location.model')
const User = require('../models/user.model');
const ElectionCenter = require('../models/ElectionCenter.model');

exports.createLocation = async (req, res) => {
    const { user_id , longitude, latitude } = req.body;
    try {
        const location = await Location.create({ user_id, longitude, latitude });
        res.status(201).json({ data: location });
    } catch (err) {
        res.status(500).json({ message: err.message });
        }
};



exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({
      include: [{
        model: User,
        attributes: ['id', 'first_name', 'second_name' ,  'last_name' , 'phone_number' , 'election_center_id'],
        include: [{
          model: ElectionCenter,
          attributes: ['id', 'name']
        }]
      }]
    });

    // Transform the response
    const formatted = locations.map(loc => ({
      id: loc.id,
      location: [Number(loc.longitude), Number(loc.latitude)], 
      user: loc.User,
      createdAt: loc.createdAt,
      updatedAt: loc.updatedAt
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب المواقع", error: err.message });
  }
}
