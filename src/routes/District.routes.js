const express = require('express');
const router = express.Router();
const DistrictController = require('../controllers/District.controller');


router.post('/', DistrictController.createDistricts);
router.get('/', DistrictController.getAllDistricts);
router.get('/:id', DistrictController.getDistrictById);
router.put('/:id', DistrictController.updateDistrict);
router.delete('/:id', DistrictController.deleteDistrict);
router.delete('/', DistrictController.deleteAllDistricts);

module.exports = router;
