const express = require("express");
const usersController = require("../controllers/users.js");
const verifyJwtToken = require("../services/verifyJwtToken.js");
const adminAuth = require("../services/adminAuth.js");

const router = express.Router();
router.get("/", verifyJwtToken, adminAuth, usersController.method.getAll);
router.get("/:id", verifyJwtToken, adminAuth, usersController.method.getOne);

router.post("/", usersController.addUser);
router.post("/login", usersController.login);

router.patch("/:id", verifyJwtToken, usersController.modifyUser);

router.delete("/:id", verifyJwtToken, usersController.delete);

module.exports = router;
