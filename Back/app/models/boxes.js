const coreModel = require("./coreModel");

const boxModel = {
    ...coreModel,
    tableName: "boxes",
};

module.exports = boxModel;
