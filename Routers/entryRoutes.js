//jshint esversion:9
const express = require("express");
const router = express.Router();
const authController = require("./../Controllers/authController.js");
const entriesController = require("./../Controllers/entriesController.js");

//protecting entries routes so the user only sees their entries
//router.use(authController.protected);

// .api/entries/ routes
router
	.route("/")
	.get(authController.protected, entriesController.getAllEntries)
	.post(entriesController.createEntry);

// .api/entries/:id routes

router
	.route("/:id")
	.get(entriesController.getEntry)
	.patch(entriesController.updateEntry)
	.delete(entriesController.deleteEntry);

module.exports = router;
