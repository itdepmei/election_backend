const express = require('express');
const router = express.Router();
const Budgetcontroller = require('../controllers/Budget.controller')
const { authenticate } = require('../middlewares/auth.middleware')


router.use(authenticate)

router.get('/' , Budgetcontroller.getBudget)



module.exports = router;
