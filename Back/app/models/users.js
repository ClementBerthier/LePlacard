const coreModel = require("./coreModel");

const userModel = {
    ...coreModel,
    tableName: "user",

    async login(user) {
        let userData;

        try {
            const sqlQuery = "SELECT * FROM user ";
        } catch (error) {}
    },
};

module.exports = userModel;
