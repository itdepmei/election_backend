const express = require('express');
const router = express.Router();
const DistrictController = require('../controllers/District.controller');

const {authenticate , authorize} = require('../middlewares/auth.middleware');


router.get('/', DistrictController.getAllDistricts);
router.get('/governorate/:id' , DistrictController.getDistrictByGovernateId)

router.use(authenticate);
router.use(authorize(["system_admin"]));
router.post('/', DistrictController.createDistricts);
router.get('/:id', DistrictController.getDistrictById);
router.put('/:id', DistrictController.updateDistrict);
router.delete('/:id', DistrictController.deleteDistrict);
router.delete('/', DistrictController.deleteAllDistricts);



module.exports = router;
