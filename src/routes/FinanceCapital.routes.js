const router = require('express').Router();
const controller = require('../controllers/FinanceCapital.controller');
const { authenticate } = require('../middlewares/auth.middleware')

router.use(authenticate)
router.post('/', controller.createCapital);
router.get('/', controller.getAllCapitals);
router.get('/:id', controller.getCapitalById);
router.put('/:id', controller.updateCapital);
router.delete('/:id', controller.deleteCapital);
router.delete('/' , controller.deleteAllCapital);
module.exports = router;
