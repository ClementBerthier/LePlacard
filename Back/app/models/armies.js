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
        } catch (error) {}
        return data;
    },
};

module.exports = armyModel;
