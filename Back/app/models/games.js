const coreModel = require("./coreModel");

const gameModel = {
    ...coreModel,
    tableName: "games",
};

module.exports = gameModel;
