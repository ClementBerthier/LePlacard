const coreController = require("./coreController.js");
const armyModel = require("../models/armies.js");

const armiesController = {
    method: coreController.listMethod(armyModel, "armies"),
};

module.exports = armiesController;
