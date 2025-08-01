const express = require('express');
const router = express.Router();
const SubDistrictController = require('../controllers/SubDistrict.controller');
const {authenticate , authorize} = require('../middlewares/auth.middleware');

router.get('/', SubDistrictController.getAllSubdistricts );
router.use(authenticate);
router.use(authorize(['system_admin']))
router.post('/', SubDistrictController.createSubdistricts);
router.get('/:id', SubDistrictController.getSubdistrictById);
router.get('/district/:id' , SubDistrictController.getSubdistrictsByDistrictId)
router.put('/:id', SubDistrictController.updateSubdistrict);
router.delete('/:id', SubDistrictController.deleteSubdistrict);
router.delete('/', SubDistrictController.deleteAllSubdistricts);


module.exports = router;
