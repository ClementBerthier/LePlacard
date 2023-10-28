const express = require("express");

const boxesController = require("../controllers/boxes.js");

const router = express.Router();

router.get("/", boxesController.getAllBoxes);
router.get("/:id", boxesController.getOneBox);

router.post("/", boxesController.addBox);

router.patch("/:id", boxesController.updateBox);

router.delete("/:id", boxesController.deleteBox);

module.exports = router;
