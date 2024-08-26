const coreController = require("./coreController.js");
const boxModel = require("../models/boxes.js");
const gameModel = require("../models/games.js");
const armyModel = require("../models/armies.js");

const boxesController = {
    method: coreController.listMethod(boxModel, "boxes"),

    boxesByArmyAndGame: async (req, res) => {
        try {
            nameOfGame = req.headers.nameofgame;
            nameOfArmy = req.headers.nameofarmy;

            const gameId = await gameModel.findGameId(nameOfGame);
            const armyId = await armyModel.findArmyId(nameOfArmy);

            const data = await boxModel.findBoxesByArmyAndGame(gameId, armyId);
            res.json(data);
        } catch (error) {
            console.error(error);
        }
    },
};

module.exports = boxesController;
