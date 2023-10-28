const coreController = require("./coreController.js");
const objectModel = require("../models/objects.js");

const objectsController = {
    method: coreController.listMethod(objectModel, "objects"),
};

module.exports = objectsController;
