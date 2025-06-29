const express = require('express');
const router = express.Router();
const Coordinator = require('../controllers/Coordinator.controller');


router.get('/', Coordinator.getAllCoordinators);

module.exports = router;
