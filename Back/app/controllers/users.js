const coreController = require("./coreController.js");
const userModel = require("../models/users.js");

const usersController = {
    method: coreController.listMethod(userModel, "user"),
};

module.exports = usersController;
