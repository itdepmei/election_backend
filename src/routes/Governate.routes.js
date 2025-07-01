const express = require('express');
const router = express.Router();
const governorateController = require('../controllers/Governate.controller');
const {authenticate , authorizeExcept} = require('../middlewares/auth.middleware');

router.get('/', governorateController.getGovernorates);
router.use(authenticate);
router.use(authorizeExcept('voter'))


router.post('/', governorateController.createGovernorates);
router.get('/:id', governorateController.getGovernorateById);
router.put('/:id', governorateController.updateGovernorate);
router.delete('/:id', governorateController.deleteGovernorate);
router.delete('/', governorateController.deleteAllGovernorates);

module.exports = router;
