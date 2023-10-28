const express = require("express");
const figurinesRouter = require("../controllers/figurines.js");

const router = express.Router();

router.get("/", figurinesRouter.method.getAll);
router.get("/:id", figurinesRouter.method.getOne);

router.post("/", figurinesRouter.method.add);

router.patch("/:id", figurinesRouter.method.update);

router.delete("/:id", figurinesRouter.method.delete);

module.exports = router;
