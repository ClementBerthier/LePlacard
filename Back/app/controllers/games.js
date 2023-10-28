const coreController = require("./coreController.js");
const gameModel = require("../models/games.js");

const gamesController = {
    method: coreController.listMethod(gameModel, "games"),
};

module.exports = gamesController;
