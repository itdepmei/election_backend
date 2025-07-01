const express = require('express');
const router = express.Router();
const DistrictManager = require('../controllers/DistrictManager.controller');
const upload = require('../config/multer')


router.post('/', upload.fields([
  { name: 'profile_image' },
  { name: 'identity_image' },
  { name: 'voting_card_image' }
]), DistrictManager.addDistrictManager);

router.get('/' , DistrictManager.getAllDistrictManagers)
router.get('/:id' , DistrictManager.GetDistrictManagersbyId)

router.put('/:id', upload.fields([
  { name: 'profile_image' },
  { name: 'identity_image' },
  { name: 'voting_card_image' }
]), DistrictManager.updateDistrictManager);

router.delete('/' , DistrictManager.deletedDistrictManager)


module.exports = router;
