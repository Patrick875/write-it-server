const User = require("./../models/usersModel");

exports.getUser = async (req, res) => {
	const user = await User.findById(req.params.id);
	res.status(200).json({
		status: "success",
		data: { user },
	});
};

exports.updateUser = async (req, res) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});
	res.status(200).json({
		status: "success",
		data: { user },
	});
};

exports.deleteUser = async (req, res) => {
	const user = await User.findByIdAndDelete(req.params.id, req.body, {
		new: true,
	});
	res.status(200).json({
		status: "success",
		data: { user },
	});
};
