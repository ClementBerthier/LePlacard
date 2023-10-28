const express = require("express");
const gamesController = require("../controllers/games.js");

const router = express.Router();

router.get("/", gamesController.method.getAll);
router.get("/:id", gamesController.method.getOne);

router.post("/", gamesController.method.add);

router.patch("/:id", gamesController.method.update);

router.delete("/:id", gamesController.method.delete);

module.exports = router;
