//jshint esversion:9
const mongoose = require("mongoose");

const entrySchema = mongoose.Schema({
	title: String,
	content: {
		type: String,
		required: true,
	},
	createdAt: Date,
	createdBy: {
		type: mongoose.Schema.ObjectId,
		ref: "user",
	},
	journal: {
		type: mongoose.Schema.ObjectId,
		ref: "journal",
	},
	tags: [String],
	active: Boolean,
	imgUrl: String,
});

const Entry = mongoose.model("Entry", entrySchema);

module.exports = Entry;
