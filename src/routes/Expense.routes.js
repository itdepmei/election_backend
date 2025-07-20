const router = require("express").Router();
const controller = require("../controllers/Expense.controller");
const { authorizeExcept , authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate)
router.post("/", controller.createExpense);
router.get("/", controller.getAllExpenses);
router.get("/:id", controller.getExpenseById);
router.put("/:id", controller.updateExpense);
router.delete("/:id", controller.deleteExpense);

module.exports = router;
