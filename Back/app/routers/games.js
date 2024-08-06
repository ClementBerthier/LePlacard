const express = require("express");
const verifyJwtToken = require("../services/verifyJwtToken.js");

const gamesController = require("../controllers/games.js");

const router = express.Router();

router.get("/", verifyJwtToken, gamesController.method.getAll);
router.get("/:id", gamesController.method.getOne);

router.post("/", gamesController.method.add);

router.patch("/:id", gamesController.method.update);

router.delete("/:id", gamesController.method.delete);

module.exports = router;
