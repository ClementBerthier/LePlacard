const coreController = require("./coreController.js");
const decorModel = require("../models/decors.js");

const decorsController = {
    method: coreController.listMethod(decorModel, "decors"),
};

module.exports = decorsController;
