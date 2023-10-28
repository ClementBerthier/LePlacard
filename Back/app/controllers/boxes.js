const coreController = require("./coreController.js");
const boxModel = require("../models/boxes.js");

const boxesController = {
    method: coreController.listMethod(boxModel, "boxes"),
};

module.exports = boxesController;
