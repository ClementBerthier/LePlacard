const coreModel = require("./coreModel");

const userModel = {
    ...coreModel,
    tableName: "user",
    //TODO: ajouter bcrypt et compagnie, supprimer le code et l'addapter a la creation d'un utilisateur.
    async insertUser(elements, table = "user") {
        let userCreated;
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
            userCreated = result.rows[0];
        } catch (error) {}
        return data;
    },
};

module.exports = userModel;
