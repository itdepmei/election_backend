const express = require('express');
const router = express.Router();
const Log = require('../controllers/log.controller');


const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.use(authorize(["system_admin", "owner"]));
router.get('/',Log.getLog );
router.delete('/', Log.deleteLog);

module.exports = router;
