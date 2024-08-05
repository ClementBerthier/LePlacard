const coreController = {
    // TODO: faire ne sorte d'envoyé l'id de l'utilisateur au model
    listMethod(model, table) {
        return {
            async getAll(req, res) {
                try {
                    const identifiant = req.user.identifiant;

                    const data = await model.findAll(table, identifiant);
                    res.json(data);
                } catch (error) {}
            },
            async getOne(req, res) {
                try {
                    const identifiant = req.user.identifiant;
                    const id = req.params.id;

                    const data = await model.findOne(id, table, identifiant);
                    res.json(data);
                } catch (error) {}
            },
            async add(req, res) {
                try {
                    const data = req.body;
                    const dataDB = await model.insert(data, table);
                    res.json(dataDB);
                } catch (error) {}
            },
            async update(req, res) {
                try {
                    const id = req.params.id;
                    const data = req.body;
                    const dataDB = await model.update(id, data, table);
                    res.json(dataDB);
                } catch (error) {}
            },
            async delete(req, res) {
                try {
                    const id = req.params.id;
                    const result = await model.delete(id, table);
                    res.json(result);
                } catch (error) {}
            },
        };
    },
};

module.exports = coreController;
