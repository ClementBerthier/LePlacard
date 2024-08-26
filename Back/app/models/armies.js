const coreModel = require("./coreModel");
const client = require("./dbClient");

const armyModel = {
    ...coreModel,
    tableName: "armies",

    async findAllArmiesOfGame(gameId) {
        let data;
        try {
            const sqlQuery = `
            SELECT a.id, a.army_name, a.picture_path
            FROM public.armies a
            INNER JOIN public.armies_games ag ON a.id = ag.army_id
            WHERE ag.game_id = $1
        `;
            const result = await client.query(sqlQuery, [gameId]);
            data = result.rows;
        } catch (error) {
            console.error(error);
        }
        return data;
    },

    findArmyId: async (armyName) => {
        try {
            const sqlQuery = `SELECT id FROM public.armies WHERE army_name = $1`;
            const values = [armyName];
            const result = await client.query(sqlQuery, values);
            const gameId = result.rows[0].id;
            return gameId;
        } catch (error) {
            console.error(error);
        }
    },
};

module.exports = armyModel;
