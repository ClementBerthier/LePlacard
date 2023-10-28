const coreController = require("./coreController.js");
const figurineModel = require("../models/figurines.js");

const figurinesController = {
    method: coreController.listMethod(figurineModel, "figurines"),
};

module.exports = figurinesController;
