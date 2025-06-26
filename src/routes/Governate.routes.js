const express = require('express');
const router = express.Router();
const governorateController = require('../controllers/Governate.controller');


router.post('/', governorateController.createGovernorates);
router.get('/', governorateController.getGovernorates);
router.get('/:id', governorateController.getGovernorateById);
router.put('/:id', governorateController.updateGovernorate);
router.delete('/:id', governorateController.deleteGovernorate);
router.delete('/', governorateController.deleteAllGovernorates);

module.exports = router;
