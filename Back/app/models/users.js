const usersController = require("../controllers/users.js");
const coreModel = require("./coreModel");
const client = require("./dbClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = {
    ...coreModel,
    tableName: "user",

    async createUser(user) {
        const salt = 10;

        try {
            const sqlQuery =
                "SELECT identifiant FROM public.user WHERE identifiant = $1";
            const values = [user.identifiant];
            const result = await client.query(sqlQuery, values);
            if (result.rows[0] !== undefined) {
                res.json(
                    "Ce nom d'utilisateur existe déjà, veuillez en choisir un autre"
                );
            } else {
                const passwordHash = await bcrypt.hash(
                    user.password_user,
                    salt
                );
                user.password_user = passwordHash;
                const sqlQuery2 =
                    "INSERT INTO public.user(identifiant, password_user) VALUES($1, $2) RETURNING *";
                const values2 = [user.identifiant, user.password_user];
                const result = await client.query(sqlQuery2, values2);
                return result.rows[0];
            }
        } catch (error) {}
    },

    async loginUser(userLogin) {
        try {
            const sqlQuery =
                "SELECT password_user FROM public.user WHERE identifiant = $1";
            const values = [userLogin.identifiant];

            let userData = await client.query(sqlQuery, values);

            const passwordCompare = await bcrypt.compare(
                userLogin.password_user,
                userData.rows[0].password_user
            );

            if (passwordCompare) {
                const sqlQuery =
                    "SELECT id, identifiant, is_admin FROM public.user WHERE identifiant = $1";
                const values = [userLogin.identifiant];
                const result = await client.query(sqlQuery, values);
                const loginData = result.rows[0];

                const jwtSecret = process.env.JWT_SECRET;
                const jwtData = {
                    identifiant: loginData.identifiant,
                };
                console.log(result.rows[0]);
                const jwtOptions = { expiresIn: "3h" };
                const token = jwt.sign(jwtData, jwtSecret, jwtOptions);
                loginData.token = token;
                console.log(loginData);
                return loginData;
            }
        } catch (error) {}
    },
};
module.exports = userModel;
