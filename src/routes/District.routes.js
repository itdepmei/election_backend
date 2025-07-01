const express = require('express');
const router = express.Router();
const DistrictController = require('../controllers/District.controller');

const {authenticate , authorizeExcept} = require('../middlewares/auth.middleware');


router.get('/', DistrictController.getAllDistricts);
router.use(authenticate);
router.use(authorizeExcept('voter'))
router.post('/', DistrictController.createDistricts);

router.get('/:id', DistrictController.getDistrictById);
router.put('/:id', DistrictController.updateDistrict);
router.delete('/:id', DistrictController.deleteDistrict);
router.delete('/', DistrictController.deleteAllDistricts);

module.exports = router;
