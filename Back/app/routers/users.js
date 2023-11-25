const express = require("express");
const usersController = require("../controllers/users.js");

const router = express.Router();
router.get("/", usersController.method.getAll);
router.get("/:id", usersController.method.getOne);

router.post("/", usersController.createUser);

router.patch("/:id", usersController.method.update);

router.delete("/:id", usersController.method.delete);

module.exports = router;
