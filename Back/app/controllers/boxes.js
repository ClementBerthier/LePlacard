const boxModel = require("../models/boxes.js");

const boxesController = {
    async getAllBoxes(req, res) {
        const boxes = await boxModel.findAll();
        res.json(boxes);
    },
    async getOneBox(req, res) {
        const box = await boxModel.findOne(req.params.id);
        res.json(box);
    },
    async addBox(req, res) {
        const box = req.body;
        const boxDB = await boxModel.insert(box);
        res.json(boxDB);
    },
    async updateBox(req, res) {
        const box = req.body;
        const boxDB = await boxModel.update(req.params.id, box);
        res.json(boxDB);
    },
    async deleteBox(req, res) {
        const result = await boxModel.delete(req.params.id);
        res.json(result);
    },
};

module.exports = boxesController;
