const client = require("./dbClient.js");

//TODO: spécifié les requete SQL avec un WHERE id est celui de l'user

const coreModel = {
    async findAll(table, identifiant) {
        let data;

        try {
            const userSqlQuery = `SELECT id FROM public.user WHERE identifiant = '${identifiant}'`;
            const userResult = await client.query(userSqlQuery);
            const userId = userResult.rows[0].id;
            let sqlQuery = "";
            if (table === "user") {
                sqlQuery = `SELECT * FROM public.${table}`;
            } else {
                sqlQuery = `SELECT * FROM public.${table} WHERE user_id = ${userId}  `;
            }
            const result = await client.query(sqlQuery);
            data = result.rows;
        } catch (error) {}
        return data;
    },
    async findOne(id, table, identifiant) {
        let data;
        try {
            const userSqlQuery = `SELECT id FROM public.user WHERE identifiant = '${identifiant}'`;
            const userResult = await client.query(userSqlQuery);
            const userId = userResult.rows[0].id;
            if (table === "user") {
                sqlQuery = `SELECT * FROM public.${table} WHERE id = $1`;
            } else {
                sqlQuery = `SELECT * FROM public.${table} WHERE id = $1 AND user_id=${userId}`;
            }
            const values = [id];
            const result = await client.query(sqlQuery, values);
            data = result.rows;
        } catch (error) {}
        return data;
    },
    async insert(elements, table, identifiant) {
        let data;

        const elementKeys = Object.keys(elements);
        const elementValues = Object.values(elements);

        const valuesElement = elementKeys.map((_, i) => `$${i + 1}`).join(", ");
        const queryElements = elementKeys.join(", ");

        try {
            const userSqlQuery = `SELECT id FROM public.user WHERE identifiant = '${identifiant}'`;
            const userResult = await client.query(userSqlQuery);
            const userId = userResult.rows[0].id;

            let finalValues = elementValues.map((item) => {
                return isNaN(Number(item)) ? item : Number(item);
            });
            finalValues.push(userId);

            const sqlQuery = `INSERT INTO public.${table}(${queryElements}, user_id) VALUES(${valuesElement}, $${
                valuesElement.lastIndexOf(",") + 1
            }  ) RETURNING *;`;
            console.log(finalValues);
            const result = await client.query(sqlQuery, finalValues);

            data = result.rows[0];
        } catch (error) {
            console.error(error);
        }

        return data;
    },
    async update(id, elements, table) {
        let data;
        const newElements = Object.keys(elements).map((key) => {
            let obj = {};
            obj[key] = elements[key];
            return obj;
        });

        const elementKeys = [];
        const elementValues = [];

        let counter = 0;

        for (element of newElements) {
            elementKeys.push(Object.keys(element)[0]);
            elementValues.push(Object.values(element));

            counter++;
        }
        const queryElements = elementKeys
            .map((key, index) => `${key}=$${index + 1}`)
            .join(", ");
        try {
            const sqlQuery = `UPDATE public.${table} SET ${queryElements} WHERE id=${id} RETURNING *`;
            const values = elementValues.map(([item]) => item);
            const finalValues = values.map((item) => {
                return isNaN(Number(item)) ? item : Number(item);
            });
            const result = await client.query(sqlQuery, finalValues);
            data = result.rows[0];
        } catch (error) {}
        return data;
    },

    async delete(id, table) {
        try {
            const sqlQuery = `DELETE FROM public.${table} WHERE id=$1`;
            const values = [id];
            const result = await client.query(sqlQuery, values);
            return result;
        } catch (error) {}
    },
};

module.exports = coreModel;
