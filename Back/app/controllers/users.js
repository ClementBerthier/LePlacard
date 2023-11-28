const coreController = require("./coreController.js");
const userModel = require("../models/users.js");

const usersController = {
    method: coreController.listMethod(userModel, "user"),

    async addUser(req, res) {
        try {
            const user = req.body;
            const result = await userModel.createUser(user);
            res.json(result);
        } catch (error) {}
    },

    async login(req, res) {
        try {
            const user = req.body;
            const result = await userModel.loginUser(user);
            res.json(result);
        } catch (error) {}
    },

    async modifyUser(req, res) {
        try {
            const user = req.body;
            console.log("user", user);
        } catch (error) {}
    },
};

module.exports = usersController;
