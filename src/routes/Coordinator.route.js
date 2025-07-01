const express = require('express');
const router = express.Router();
const Coordinator = require('../controllers/Coordinator.controller');
const upload = require('../config/multer')


router.get('/', Coordinator.getAllCoordinators);
router.get('/:id'  , Coordinator.getCoordinatorById)

router.post('/', upload.fields([
  { name: 'profile_image' },
  { name: 'identity_image' },
  { name: 'voting_card_image' }
]), Coordinator.addCoordinator);

router.put('/:id', upload.fields([
  { name: 'profile_image' },
  { name: 'identity_image' },
  { name: 'voting_card_image' }
]), Coordinator.updateCoordinator);
router.delete('/' , Coordinator.deleteAllCoordinators)
router.delete("/:id" , Coordinator.deleteCoordinator)

module.exports = router;
