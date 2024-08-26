const coreController = require("./coreController.js");
const armyModel = require("../models/armies.js");
const gameModel = require("../models/games.js");

const armiesController = {
    method: coreController.listMethod(armyModel, "armies"),

    armiesOfGame: async (req, res) => {
        try {
            nameOfGame = req.headers.nameofgame;
            const gameId = await gameModel.findGameId(nameOfGame);

            const data = await armyModel.findAllArmiesOfGame(gameId);
            res.json(data);
        } catch (error) {
            console.error(error);
        }
    },
};

module.exports = armiesController;
