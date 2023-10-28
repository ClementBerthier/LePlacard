const coreModel = require("./coreModel");

const userModel = {
    ...coreModel,
    tableName: "user",
};

module.exports = userModel;
