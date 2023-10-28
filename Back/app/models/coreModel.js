const client = require("./dbClient.js");

const coreModel = {
    async findAll(table) {
        let elements;
        try {
            const sqlQuery = `SELECT * FROM public.${table}`;
            const result = await client.query(sqlQuery);
            elements = result.rows;
        } catch (error) {}
        return elements;
    },
    async findOne(table, id) {
        let elements;
        try {
            const sqlQuery = `SELECT * FROM public.${table} WHERE id = $1`;
            const values = [id];
            const result = await client.query(sqlQuery, values);
            elements = result.rows;
        } catch (error) {}
        return elements;
    },
};
