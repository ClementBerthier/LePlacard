const express = require("express");
const decorsRouter = require("../controllers/decors.js");

const router = express.Router();

router.get("/", decorsRouter.method.getAll);
router.get("/:id", decorsRouter.method.getOne);

router.post("/", decorsRouter.method.add);

router.patch("/:id", decorsRouter.method.update);

router.delete("/:id", decorsRouter.method.delete);

module.exports = router;
