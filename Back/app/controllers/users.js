const coreController = require("./coreController.js");
const userModel = require("../models/users.js");
const bcrypt = require("bcrypt");

const usersController = {
    method: coreController.listMethod(userModel, "user"),

    async createUser(req, res) {
        const salt = 10;

        try {
            const user = req.body;

            const passwordHash = await bcrypt.hash(user.password_user, salt);
            user.password_user = passwordHash;
            console.log(user);
            const userDB = await userModel.insert(user, "user");
            res.json(userDB);
        } catch (error) {}
    },

    async loginUser(req, res) {},
};

module.exports = usersController;
