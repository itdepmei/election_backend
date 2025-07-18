const express = require('express');
const router = express.Router();
const Log = require('../controllers/log.controller');


const { authenticate } = require('../middlewares/auth.middleware');
router.use(authenticate);
router.get('/',Log.getLog );
router.delete('/', Log.deleteLog);

module.exports = router;
