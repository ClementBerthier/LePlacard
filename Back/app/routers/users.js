const express = require("express");
const usersController = require("../controllers/users.js");
const verifyJwtToken = require("../services/verifyJwtToken.js");

const router = express.Router();
router.get("/", usersController.method.getAll);
router.get("/:id", usersController.method.getOne);

router.post("/", usersController.addUser);
router.post("/login", usersController.login);

router.patch("/:id", verifyJwtToken, usersController.modifyUser);

router.delete("/:id", verifyJwtToken, usersController.method.delete);

module.exports = router;
