const express = require("express");
const objectsController = require("../controllers/objects.js");

const router = express.Router();

router.get("/", objectsController.method.getAll);
router.get("/:id", objectsController.method.getOne);

router.post("/", objectsController.method.add);

router.patch("/:id", objectsController.method.update);

router.delete("/:id", objectsController.method.delete);

module.exports = router;
