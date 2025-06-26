const express = require('express');
const router = express.Router();
const controller = require('../controllers/Station.controller');

router.post('/', controller.createStations);
router.get('/', controller.getStations);
router.get('/:id', controller.getStationById);
router.put('/:id', controller.updateStation);
router.delete('/:id', controller.deleteStation);

module.exports = router;
