const express = require("express");
const figurinesRouter = require("../controllers/figurines.js");
const verifyJwtToken = require("../services/verifyJwtToken.js");

const router = express.Router();

router.get("/", verifyJwtToken, figurinesRouter.method.getAll);
router.get("/:id", figurinesRouter.method.getOne);

router.post("/", figurinesRouter.method.add);

router.patch("/:id", figurinesRouter.method.update);

router.delete("/:id", figurinesRouter.method.delete);

module.exports = router;
