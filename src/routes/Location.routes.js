const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/Location.controller');

const { authenticate } = require('../middlewares/auth.middleware');
router.use(authenticate);
router.post('/', LocationController.createLocation);
router.get('/',LocationController.getLocations );

module.exports = router;
