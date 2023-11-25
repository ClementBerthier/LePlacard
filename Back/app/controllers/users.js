const coreController = require("./coreController.js");
const userModel = require("../models/users.js");

const usersController = {
    method: coreController.listMethod(userModel, "user"),

    async createUser(req, res) {
        try {
            
            const user = req.body;
            const userDB = await userModel.insertUser(user, "user");
            res.json(userDB);
        } catch (error) {}
    },
};

module.exports = usersController;
