const router = require("express").Router();
const paymentController = require("../controllers/Payment.controller");
const {authenticate } = require("../middlewares/auth.middleware")

router.use(authenticate)
router.post("/", paymentController.createPayment);
router.get("/", paymentController.getAllPayments);
router.get("/:id", paymentController.getPaymentById);
router.put("/:id", paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);

module.exports = router;
