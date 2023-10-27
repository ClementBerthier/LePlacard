const express = require("express");
const gamesController = require("../controllers/games.js");

const router = express.Router();

router.get("/", gamesController.getAllGames);
router.get("/:id", gamesController.getOneGame);

router.post("/", gamesController.addGame);

router.patch("/:id", gamesController.updateGame);

router.delete("/:id", gamesController.deleteGame);

module.exports = router;
