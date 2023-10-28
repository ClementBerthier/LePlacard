const client = require("./dbClient.js");

const coreModel = {
    async findAll(table = this.tableName) {
        let data;

        try {
            const sqlQuery = `SELECT * FROM public.${table}`;
            console.log("user", sqlQuery);
            const result = await client.query(sqlQuery);
            data = result.rows;
        } catch (error) {}
        return data;
    },
    async findOne(id, table = this.tableName) {
        let data;
        try {
            const sqlQuery = `SELECT * FROM public.${table} WHERE id = $1`;
            const values = [id];
            const result = await client.query(sqlQuery, values);
            data = result.rows;
        } catch (error) {}
        return data;
    },
    async insert(elements, table = this.tableName) {
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
            elementKeys.push(Object.keys(element));
            elementValues.push(Object.values(element));
            counter++;
        }

        let valuesElement = Array.from(
            { length: counter },
            (_, i) => `$${i + 1}`
        ).join(", ");

        const queryElements = elementKeys.map((key) => `${key}`).join(", ");
        try {
            const sqlQuery = `INSERT INTO public.${table}(${queryElements}) VALUES(${valuesElement}) RETURNING *`;
            const values = elementValues.map(([item]) => item);
            const finalValues = values.map((item) => {
                return isNaN(Number(item)) ? item : Number(item);
            });
            const result = await client.query(sqlQuery, finalValues);
            data = result.rows[0];
        } catch (error) {}
        return data;
    },
    async update(id, elements, table = this.tableName) {
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

    async delete(id, table = this.tableName) {
        try {
            const sqlQuery = `DELETE FROM public.${table} WHERE id=$1`;
            const values = [id];
            const result = await client.query(sqlQuery, values);
            return result;
        } catch (error) {}
    },
};

module.exports = coreModel;
