const express = require('express');
const router = express.Router();
const Budgetcontroller = require('../controllers/Budget.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')


router.use(authenticate)
router.use(authorize(['system_admin', 'owner'  ]))

router.get('/' , Budgetcontroller.getBudget)



module.exports = router;
