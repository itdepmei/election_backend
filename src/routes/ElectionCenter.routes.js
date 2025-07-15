const express = require('express');
const router = express.Router();
const controller = require('../controllers/ElectionCenter.controller');


const { authenticate, authorizeExcept } = require('../middlewares/auth.middleware');
router.get('/', controller.getElectionCenters);             
router.use(authenticate);
router.use(authorizeExcept('voter'));
router.post('/', controller.createElectionCenters);       
router.get('/:id', controller.getElectionCenterById);
router.put('/:id' , controller.updateElectionCenter) 
router.delete('/:id', controller.deleteElectionCenter);           
router.delete('bulk/', controller.deleteElectionCentersBulk);         
router.delete('/', controller.deleteAllElectionCenters); 

module.exports = router;
