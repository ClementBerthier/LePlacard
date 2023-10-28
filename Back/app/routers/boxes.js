const express = require("express");
const boxesController = require("../controllers/boxes.js");

const router = express.Router();

router.get("/", boxesController.method.getAll);
router.get("/:id", boxesController.method.getOne);

router.post("/", boxesController.method.add);

router.patch("/:id", boxesController.method.update);

router.delete("/:id", boxesController.method.delete);

module.exports = router;
