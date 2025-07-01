const express = require('express');
const router = express.Router();
const controller = require('../controllers/Station.controller');
const {authenticate , authorizeExcept} = require('../middlewares/auth.middleware');

router.get('/', controller.getStations);
router.use(authenticate);
router.use(authorizeExcept('voter'))
router.post('/', controller.createStations);
router.get('/:id', controller.getStationById);
router.put('/:id', controller.updateStation);
router.delete('/:id', controller.deleteStation);
router.get('/center/:id' , controller.getStationByCenterId)

module.exports = router;
