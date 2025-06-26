const express = require("express");
const router = express.Router();
const controller = require("../controllers/Tapes.controller");
const upload = require("../config/multer");

router.post(
  "/",
  upload.fields([{ name: "tape_image", maxCount: 1 }]),
  controller.createTapes
);
router.get("/", controller.getTapes);
router.get("/:id", controller.getTapeById);
router.put(
  "/:id",
  upload.fields([{ name: "tape_image", maxCount: 1 }]),

  controller.updateTape
);
router.delete("/:id", controller.deleteTape);
router.delete("/", controller.deleteAllTapes);

module.exports = router;
