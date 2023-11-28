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
            const userId = Number(req.params.id);
            const result = await userModel.updateUser(user, userId);
            res.json(result);
        } catch (error) {}
    },

    async delete(req, res) {
        try {
            const userId = Number(req.params.id);
            const result = await userModel.deleteUser(userId);
            res.json(result);
        } catch (error) {}
    },
};

module.exports = usersController;
