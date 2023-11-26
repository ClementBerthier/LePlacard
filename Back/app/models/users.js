const coreModel = require("./coreModel");
const client = require("./dbClient");

const userModel = {
    ...coreModel,
    tableName: "user",

    async login(user) {
        try {
            const sqlQuery =
                "SELECT id, identifiant FROM public.user WHERE identifiant = $1";
            const values = [user.identifiant];
            const result = await client.query(sqlQuery, values);
            const userData = result.rows[0];
            return userData;
        } catch (error) {}
    },
};
module.exports = userModel;
