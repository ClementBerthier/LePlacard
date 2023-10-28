const coreModel = require("./coreModel");

const armyModel = {
    ...coreModel,
    tableName: "armies",
};

module.exports = armyModel;
