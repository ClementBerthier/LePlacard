const coreModel = require("./coreModel");
const client = require("./dbClient");

const gameModel = {
    ...coreModel,
    tableName: "games",

    findGameId: async (gameName) => {
        try {
            const sqlQuery = `SELECT id FROM public.games WHERE game_name = $1`;
            const values = [gameName];
            const result = await client.query(sqlQuery, values);
            const gameId = result.rows[0].id;
            return gameId;
        } catch (error) {
            console.error(error);
        }
    },
};

module.exports = gameModel;
