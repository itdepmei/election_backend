const express = require('express');
const router = express.Router();
const Log = require('../controllers/log.controller');


router.get('/',Log.getLog );

module.exports = router;
