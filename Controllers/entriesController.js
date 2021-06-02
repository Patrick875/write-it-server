const Entry = require("./../models/entryModel");

//get all entries from user
exports.getAllEntries = async (req, res) => {
	try {
		const entries = await Entry.find({ createdBy: req.user }).sort({
			createdAt: -1,
		});
		if (!entries) throw Error("No items");
		res.status(200).json({
			status: "success",
			results: entries.length,
			data: entries,
		});
	} catch (e) {
		res.status(400).json({ msg: e.message });
	}
};

//get one entry

exports.getEntry = async (req, res) => {
	try {
		const entry = await Entry.findById(req.params.id);
		if (!entry) throw Error("No items");
		res.status(200).json({
			status: "success",
			data: entry,
		});
	} catch (e) {
		res.status(400).json({ msg: e.message });
	}
};

//create entry
exports.createEntry = async (req, res) => {
	req.body.createdAt = new Date().toLocaleString();
	try {
		const newEntry = await Entry.create({ ...req.body });
		if (!newEntry) throw Error("Something went wrong saving the item");

		res.status(201).json({
			status: " journal entry created",
			data: newEntry,
		});
	} catch (e) {
		res.status(400).json({ msg: e.message });
	}
};

//update entry
exports.updateEntry = async (req, res) => {
	try {
		console.log(req.params.id);
		const entry = await Entry.findOneAndUpdate(
			{ _id: req.params.id },
			{ ...req.body },
			{ new: true }
		);
		if (!entry) throw Error("Something went wrong updating  the entry");

		res.status(201).json({
			status: " entry updated",
			data: entry,
		});
	} catch (e) {
		res.status(400).json({ msg: e.message });
	}
};
//delete Entry
exports.deleteEntry = async (req, res) => {
	try {
		const entry = await Entry.findByIdAndDelete(req.params.id);
		if (!entry) {
			throw Error(" Item not found ");
		} else {
			res.status(200).json({
				message: "item deleted",
				success: true,
			});
		}
	} catch (e) {
		res.status(400).json({ msg: e.message, success: false });
	}
};
