const express = require('express');
const router = express.Router();
const SubDistrictController = require('../controllers/SubDistrict.controller');


router.post('/', SubDistrictController.createSubdistricts);
router.get('/', SubDistrictController.getAllSubdistricts );
router.get('/:id', SubDistrictController.getSubdistrictById);
router.put('/:id', SubDistrictController.updateSubdistrict);
router.delete('/:id', SubDistrictController.deleteSubdistrict);
router.delete('/', SubDistrictController.deleteAllSubdistricts);

module.exports = router;
