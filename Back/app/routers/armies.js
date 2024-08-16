const express = require("express");
const armiesController = require("../controllers/armies.js");

const router = express.Router();

router.get("/", armiesController.method.getAll);
router.get("/armiesOfGame", armiesController.armiesOfGame);
router.get("/:id", armiesController.method.getOne);

router.post("/", armiesController.method.add);

router.patch("/:id", armiesController.method.update);

router.delete("/:id", armiesController.method.delete);

module.exports = router;
