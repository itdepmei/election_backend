const express = require('express');
const router = express.Router();
const controller = require('../controllers/ElectionCenter.controller');

router.post('/', controller.createElectionCenters);       
router.get('/', controller.getElectionCenters);             
router.get('/:id', controller.getElectionCenterById);
router.put('/:id' , controller.updateElectionCenter) 
router.delete('/:id', controller.deleteElectionCenter);           
router.delete('bulk/', controller.deleteElectionCentersBulk);         
router.delete('/', controller.deleteAllElectionCenters); 

module.exports = router;
