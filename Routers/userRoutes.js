const express = require("express");

const userController = require("./../Controllers/userController.js");
const router = express.Router();
const authController = require("./../Controllers/authController.js");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/activate", authController.activate);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword", authController.resetPassword);

router
	.route("/:id")
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;
