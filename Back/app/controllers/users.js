const coreController = require("./coreController.js");
const userModel = require("../models/users.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const database = require("../models/dbClient.js");

const usersController = {
    method: coreController.listMethod(userModel, "user"),

    async createUser(req, res) {
        //TODO : check if user already exist
        const salt = 10;

        try {
            const user = req.body;

            const passwordHash = await bcrypt.hash(user.password_user, salt);
            user.password_user = passwordHash;
            const userDB = await userModel.insert(user, "user");
            res.json(userDB);
        } catch (error) {}
    },

    async loginUser(req, res) {
        try {
            const sqlQuery =
                "SELECT password_user FROM public.user WHERE identifiant = $1";
            const values = [req.body.identifiant];

            let userData = await database.query(sqlQuery, values);

            const passwordCompare = await bcrypt.compare(
                req.body.password_user,
                userData.rows[0].password_user
            );
            req.body.password_user = passwordCompare;
            const user = req.body;
            const result = await userModel.login(user);
            if (result !== undefined) {
                const jwtSecret = process.env.JWT_SECRET;
                const jwtData = {
                    identifiant: result.identifiant,
                };
                const jwtOptions = { expiresIn: "3h" };
                const token = jwt.sign(jwtData, jwtSecret, jwtOptions);
                result.token = token;
                res.json(result);
            }
        } catch (error) {}
    },
};

module.exports = usersController;
