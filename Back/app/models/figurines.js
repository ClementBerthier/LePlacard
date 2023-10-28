const coreModel = require("./coreModel");

const figurineModel = {
    ...coreModel,
    tableName: "figurines",
};

module.exports = figurineModel;
