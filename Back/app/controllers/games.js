const gameModel = require("../models/games.js");

const gamesController = {
    async getAllGames(req, res) {
        const games = await gameModel.findAll();
        res.json(games);
    },
    async getOneGame(req, res) {
        const game = await gameModel.findOne(res.params.id);
        res.json();
    },
    async addGame(req, res) {
        const game = req.body;
        const gameDB = await gameModel.insert(game);

        res.json(gameDB);
    },
    async updateGame(req, res) {
        const game = req.body;
        const gameDB = await gameModel.update(req.params.id, game);
        res.json(gameDB);
    },
    async deleteGame(req, res) {
        const result = await gameModel.delete(req.params.id);

        res.json(result);
    },
};

module.exports = gamesController;
