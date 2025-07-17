const express = require("express");
const router = express.Router();
const controller = require("../controllers/Tapes.controller");
const upload = require("../config/multer");

const { authenticate, authorize } = require("../middlewares/auth.middleware");


router.use(authenticate)
router.post(
  "/",
  upload.fields([{ name: "tape_image", maxCount: 1 }]),
  controller.createTapes
);
router.get('/stats', controller.getTapesStats); // <-- move this up
router.get("/", controller.getTapes);
router.get("/:id", controller.getTapeById);
router.put(
  "/:id",
  upload.fields([{ name: "tape_image", maxCount: 1 }]),

  controller.updateTape
);
router.patch('/toggle/:id', controller.toggleTapeStatus);
router.delete("/:id", controller.deleteTape);
router.delete("/", controller.deleteAllTapes);

router.get('/station/:id' , controller.getTapesByStationId)
router.get('/center/:id' , controller.getTapesByCenterId)

module.exports = router;
