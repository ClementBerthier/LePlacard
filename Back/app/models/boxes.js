const coreModel = require("./coreModel");
const client = require("./dbClient");

const boxModel = {
    ...coreModel,
    tableName: "boxes",

    async findBoxesByArmyAndGame(gameID, armyID) {
        let data;
        try {
            const sqlQuery = `SELECT b.*
            FROM public.boxes b
            INNER JOIN public.armies_boxes ab ON b.id = ab.box_id
            WHERE b.game_id = $1 AND ab.army_id = $2`;
            const result = await client.query(sqlQuery, [gameID, armyID]);
            data = result.rows;
        } catch (error) {
            console.error(error);
        }
        return data;
    },
};

module.exports = boxModel;
